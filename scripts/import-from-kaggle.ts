// scripts/import-from-kaggle.ts
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // 👈 NOVA IMPORTAÇÃO

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Extrai o ano de uma string no formato "Autor (YYYY)".
 */
function extractYear(namedBy: string): number | null {
  if (!namedBy) return null;
  const match = namedBy.match(/\((\d{4})\)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Mapeia a dieta do CSV para os valores permitidos no banco de dados.
 */
function mapDiet(diet: string): 'carnivorous' | 'herbivorous' | 'omnivorous' | null {
  if (!diet) return null;
  const lowerDiet = diet.toLowerCase();
  if (lowerDiet.includes('carnivore')) return 'carnivorous';
  if (lowerDiet.includes('herbivore')) return 'herbivorous';
  if (lowerDiet.includes('omnivore')) return 'omnivorous';
  return null; // Retorna nulo se não for um valor conhecido
}

/**
 * Função principal que orquestra a importação.
 */
async function main() {
  // 1. Buscar espécies existentes para evitar duplicatas
  const { data: existingDinos, error: fetchError } = await supabase
    .from('dinosaur_species2')
    .select('scientific_name');

  if (fetchError) {
    console.error('❌ Erro ao buscar espécies existentes:', fetchError.message);
    return;
  }

  const existingNames = new Set(existingDinos?.map(d => d.scientific_name) || []);

  // 2. Ler e processar o arquivo CSV
  const recordsToInsert: any[] = [];
  // A linha abaixo agora funciona corretamente
  const csvFilePath = path.resolve(__dirname, 'data', 'dinosaur_genera.csv');
  const parser = createReadStream(csvFilePath).pipe(parse({
    columns: true, // Usa a primeira linha como cabeçalho
    trim: true,
  }));

  for await (const row of parser) {
    const scientificName = row.species || row.name;

    // Pula se não tiver nome científico ou se já existir no banco
    if (!scientificName || existingNames.has(scientificName)) {
      continue;
    }

    // 3. Mapear a linha do CSV para o formato da tabela
    const newDino = {
      name: row.name,
      scientific_name: scientificName,
      period: row.period || 'Unknown',
      diet: mapDiet(row.diet),
      size_length: parseFloat(row.length_m) || null,
      size_height: null, // Dado não disponível no CSV
      size_weight: null, // Dado não disponível no CSV
      habitat: row.lived_in || null,
      description: `A ${row.type} dinosaur from the genus ${row.name}. Taxonomy: ${row.taxonomy || 'N/A'}.`,
      fun_facts: null, // Dado não disponível no CSV
      image_url: null, // Dado não disponível no CSV
      discovered_year: extractYear(row.named_by),
      discovered_location: row.lived_in || null,
    };

    recordsToInsert.push(newDino);
    // Adiciona ao Set para evitar duplicatas do próprio CSV
    existingNames.add(scientificName);
  }

  // 4. Inserir os novos registros em lotes
  if (recordsToInsert.length === 0) {
    return;
  }

  
  const batchSize = 100; // Insere de 100 em 100
  for (let i = 0; i < recordsToInsert.length; i += batchSize) {
    const batch = recordsToInsert.slice(i, i + batchSize);
    const batchNumber = i / batchSize + 1;
    const totalBatches = Math.ceil(recordsToInsert.length / batchSize);
    

    const { error: insertError } = await supabase.from('dinosaur_species2').insert(batch);

    if (insertError) {
      console.error(`❌ Erro ao inserir o lote ${batchNumber}:`, insertError.message);
      return; // Para a execução em caso de erro
    }
  }
}

main().catch(error => {
  console.error('An unexpected error occurred:', error);
});