
import { Booking, StaffMember, Client, AvailableSlot } from '../types.ts';

// Gera um ID baseado no endereço do site (ex: lava-lava-e62h)
// Isso garante que qualquer pessoa no mesmo domínio veja os mesmos dados.
const getDeterministicUnitId = () => {
  const hostname = window.location.hostname;
  // Remove pontos e caracteres especiais para criar uma chave limpa
  const slug = hostname.replace(/\./g, '-').replace('localhost', 'dev-local');
  return slug;
};

export const WASH_ID = getDeterministicUnitId();
// Usamos o bucket do KVDB com o ID do domínio
const API_URL = `https://kvdb.io/A2V2p5X7tE6zG8n9/${WASH_ID}`; 

export interface WashData {
  bookings: Booking[];
  staff: StaffMember[];
  clients: Client[];
  availableSlots: AvailableSlot[];
  adminPin: string;
}

export const syncDataToCloud = async (data: WashData): Promise<boolean> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    console.error("Erro ao sincronizar com a nuvem:", error);
    return false;
  }
};

export const fetchDataFromCloud = async (): Promise<WashData | null> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) return null;
    const data = await response.json();
    // Validação de segurança para garantir que recebemos um objeto válido
    if (data && typeof data === 'object' && Array.isArray(data.bookings || [])) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar dados da nuvem:", error);
    return null;
  }
};

// Função para resetar (caso precise criar um novo banco por algum motivo)
export const switchUnit = (newId: string) => {
  localStorage.setItem('lavacar_unit_id_override', newId);
  window.location.reload();
};
