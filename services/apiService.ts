
import { Booking, StaffMember, Client, AvailableSlot } from '../types.ts';

/**
 * CONFIGURAÇÃO SUPABASE - NOVO PROJETO
 * 
 * Para que o sincronismo funcione, execute este SQL no Editor do seu Supabase:
 * 
 * CREATE TABLE IF NOT EXISTS units_data (
 *   unit_id TEXT PRIMARY KEY,
 *   json_payload JSONB,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * ALTER TABLE units_data ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public access" ON units_data FOR ALL USING (true);
 */

const SUPABASE_URL = 'https://dmosckbmwomfoqobignh.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_DPMIxu9x_BpfeeQkRIVNRg_tuKbtCzF'; 

export const WASH_ID = 'unidade_principal';

export interface WashData {
  bookings: Booking[];
  staff: StaffMember[];
  clients: Client[];
  availableSlots: AvailableSlot[];
  adminPin: string;
}

export const switchUnit = (unitCode: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set('unit', unitCode);
  window.location.href = url.toString();
};

const isValidConfig = () => {
  return SUPABASE_URL && 
         SUPABASE_URL.includes('supabase.co') && 
         SUPABASE_KEY && 
         SUPABASE_KEY.length > 10;
};

const fetchWithTimeout = async (url: string, options: any, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const syncDataToCloud = async (data: WashData): Promise<boolean> => {
  if (!isValidConfig()) return false;

  try {
    const response = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/units_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        unit_id: WASH_ID,
        json_payload: data,
        updated_at: new Date().toISOString()
      })
    });
    
    return response.ok;
  } catch (error) {
    console.debug("Falha na sincronização cloud (offline ou erro de CORS)");
    return false;
  }
};

export const fetchDataFromCloud = async (): Promise<WashData | null> => {
  if (!isValidConfig()) return null;

  try {
    const response = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/units_data?unit_id=eq.${WASH_ID}&select=json_payload`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data && data.length > 0 ? data[0].json_payload : null;
  } catch (error) {
    console.debug("Falha ao buscar dados da cloud (offline ou erro de CORS)");
    return null;
  }
};
