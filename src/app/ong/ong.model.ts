import { Address } from '../address/address.model';


export interface Ong {
  id?: string;
  cnpj: string; // Fixed typo from cpnj to cnpj
  name: string;
  login: string;
  password?: string; // often omitted from frontend models
  email: string;
  phone: string;
  pix?: string; // PIX key for donations/payments
  instagram?: string; // Instagram profile URL
  facebook?: string; // Facebook profile URL
  tiktok?: string; // TikTok profile URL
  address: Address; // Made required to match backend
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