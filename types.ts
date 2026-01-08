
import React from 'react';

export enum MenuSection {
  Dashboard = 'Dashboard',
  Agendamentos = 'Agendamentos',
  FilaDeEspera = 'Fila de Espera',
  Historico = 'Histórico',
  Funcionarios = 'Funcionários',
  Clientes = 'Clientes',
  Veiculos = 'Veículos',
  Financeiro = 'Financeiro',
  Configuracoes = 'Configurações'
}

export type VehicleCategory = 'Moto' | 'SUV' | 'CAMINHONETE' | 'SEDA' | 'Hatch';

export type BookingStatus = 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  carModel: string;
  carBrand: string;
  category: VehicleCategory;
  plate: string;
  service: string;
  condition?: string;
  date: string;
  time: string;
  price: number;
  status: BookingStatus;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  preferredCar?: string;
  preferredPlate?: string;
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
  createdAt: Date;
}

export interface StaffPayment {
  id: string;
  amount: number;
  date: string;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  status: 'Ativo' | 'Em Pausa';
  email: string;
  dailyRate: number;
  workedDays: number;
  totalPaid: number;
  paymentHistory?: StaffPayment[];
}

export interface AvailableSlot {
  id: string;
  date: string;
  time: string;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const VEHICLE_DATABASE: Record<string, string[]> = {
  "Chevrolet": ["Onix", "Onix Plus", "Tracker", "S10", "Spin", "Montana", "Equinox", "Cruze", "Trailblazer", "Camaro", "Bolt"],
  "Volkswagen": ["Gol", "Polo", "Virtus", "T-Cross", "Nivus", "Taos", "Amarok", "Saveiro", "Jetta", "Tiguan", "Voyage"],
  "Fiat": ["Strada", "Toro", "Mobi", "Argo", "Cronos", "Pulse", "Fastback", "Fiorino", "Ducato", "Uno", "Palio"],
  "Hyundai": ["HB20", "HB20S", "Creta", "Tucson", "Santa Fe", "Kona", "Ioniq", "Azera", "i30"],
  "Toyota": ["Corolla", "Corolla Cross", "Hilux", "SW4", "Yaris", "Etios", "RAV4", "Camry", "Prius"],
  "Honda": ["Civic", "HR-V", "City", "City Hatchback", "CR-V", "WR-V", "Accord"],
  "Jeep": ["Renegade", "Compass", "Commander", "Wrangler", "Gladiator", "Grand Cherokee"],
  "Renault": ["Kwid", "Sandero", "Logan", "Duster", "Oroch", "Captur", "Kardian", "Master"],
  "Nissan": ["Kicks", "Versa", "Sentra", "Frontier", "Leaf", "March", "Tiida"],
  "Ford": ["Ranger", "Territory", "Maverick", "Bronco Sport", "Mustang", "Ka", "EcoSport", "Fusion"],
  "Mitsubishi": ["L200 Triton", "Eclipse Cross", "Outlander", "Pajero Sport", "ASX"],
  "BMW": ["Série 3", "X1", "X3", "X5", "Série 1", "X4", "Série 5", "iX"],
  "Mercedes-Benz": ["Classe C", "GLA", "GLC", "Classe A", "GLE", "CLA", "Sprinter"],
  "Audi": ["A3", "Q3", "Q5", "A4", "Q7", "e-tron", "A5"],
  "Volvo": ["XC40", "XC60", "XC90", "C40", "S60"],
  "BYD": ["Dolphin", "Seal", "Song Plus", "Yuan Plus", "Tan", "Han"],
  "GWM": ["Haval H6", "Ora 03"],
  "Chery": ["Tiggo 5X", "Tiggo 7", "Tiggo 8", "Arrizo 6"],
  "Peugeot": ["208", "2008", "3008", "Partner"],
  "Citroën": ["C3", "C3 Aircross", "C4 Cactus", "Jumpy"],
  "Outros": ["Modelo não listado"]
};

export const BRANDS = Object.keys(VEHICLE_DATABASE).sort((a, b) => a === "Outros" ? 1 : b === "Outros" ? -1 : a.localeCompare(b));
