
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import admin from 'firebase-admin';

// node-fetch is in deps, but Node 18+ has fetch; keep compatibility.
import fetch from 'node-fetch';

type DinoPicturesPic = {
  url?: string;
  clickthrough_url?: string;
  thumbnail?: string;
  source?: string;
  source_display?: string;
  voting_url?: string;
};

type DinoPicturesDinosaurResponse = {
  dino: string;
  pics?: DinoPicturesPic[];
};

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function initAdmin() {
  if (admin.apps.length) return admin.app();

  // Prefer GOOGLE_APPLICATION_CREDENTIALS (file path)
  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!gac) {
    throw new Error(
      'Missing GOOGLE_APPLICATION_CREDENTIALS. Set it to a Firebase service account JSON path.'
    );
  }

  const json = JSON.parse(fs.readFileSync(gac, 'utf8'));
  return admin.initializeApp({
    credential: admin.credential.cert(json),
  });
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function pickBestUrl(p: DinoPicturesPic): string | null {
  return (p.url || p.clickthrough_url || p.voting_url || '').trim() || null;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchDinoPictures(name: string): Promise<DinoPicturesPic[]> {
  const url = `https://dinosaurpictures.org/api/dinosaur/${encodeURIComponent(name)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const json = (await res.json()) as DinoPicturesDinosaurResponse;
  return json.pics ?? [];
}

async function main() {
  initAdmin();
  const db = admin.firestore();

  const limitStr = process.env.ENRICH_LIMIT;
  const limit = limitStr ? Number(limitStr) : undefined;

  const colName = 'dinosaur_species2';
  console.log(`🦕 Enriching images for collection: ${colName}`);

  const snap = await db.collection(colName).get();
  const docs = snap.docs;
  console.log(`📦 Loaded docs: ${docs.length}`);

  let processed = 0;
  let updated = 0;

  // Rate limiting: simple sequential loop with small delay.
  // This is safer for public API and for Firestore write quotas.
  for (const doc of docs) {
    if (limit && processed >= limit) break;

    processed++;

    const data = doc.data() as Record<string, unknown>;
    const scientific = String(data.scientific_name || '').trim();
    const common = String(data.common_name || '').trim();
    const lookup = scientific || common;

    if (!lookup) continue;

    // If already enriched with a decent number of images, skip.
    const existing = Array.isArray(data.image_urls) ? (data.image_urls as string[]) : [];
    if (existing.length >= 4) continue;

    const pics = await fetchDinoPictures(lookup);

    const urls = uniq(
      pics
        .map(pickBestUrl)
        .filter((u): u is string => Boolean(u))
    );

    const thumbs = uniq(
      pics
        .map((p) => (p.thumbnail || '').trim())
        .filter(Boolean)
    );

    const sources = pics
      .map((p) => ({
        url: p.source,
        display: p.source_display,
      }))
      .filter((s) => s.url || s.display);

    if (!urls.length) {
      // still wait a bit before next request
      await sleep(120);
      continue;
    }

    const payload: Record<string, unknown> = {
      image_urls: urls.slice(0, 20),
      image_thumbnails: thumbs.slice(0, 20),
      image_sources: sources.slice(0, 20),
      image_enriched_at: new Date().toISOString(),
    };

    // Keep legacy field populated for card thumbnails
    if (!data.image_url && urls[0]) {
      payload.image_url = urls[0];
    }

    await doc.ref.set(payload, { merge: true });
    updated++;

    if (updated % 25 === 0) {
      console.log(`✅ Updated ${updated} docs (processed ${processed})`);
    }

    // Be kind to the upstream API
    await sleep(120);
  }

  console.log(`\nDone. Processed=${processed}, Updated=${updated}`);
  console.log('Tip: set ENRICH_LIMIT=50 for a quick test run.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
