import { getDocs, orderBy, query } from 'firebase/firestore';
import { col } from './firestoreService';

export interface ArchaeologicalDiscovery {
  id?: string;
  title: string;
  description: string;
  location: string;
  discovery_date: string;
  researcher_name?: string;
  organization?: string;
  significance?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  species_id?: string;
  species_row_index?: string;
}

export async function fetchDiscoveries(): Promise<ArchaeologicalDiscovery[]> {
  const snap = await getDocs(query(col('archaeological_discoveries'), orderBy('discovery_date', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ArchaeologicalDiscovery, 'id'>) }));
}
