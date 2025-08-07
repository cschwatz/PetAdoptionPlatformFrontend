import { Address } from '../address/address.model';

export interface Ong {
  id?: string;
  cnpj: string; 
  name: string;
  login: string;
  password?: string;
  email: string;
  phone: string;
  pix?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  address: Address;
}

export interface OngUpdateRequest {
  cnpj?: string;
  name?: string;
  email?: string;
  phone?: string;
  pix?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  address?: Address;
}