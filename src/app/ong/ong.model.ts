import { Address } from '../address/address.model';


export interface Ong {
  id?: string;
  cnpj: string; // Fixed typo from cpnj to cnpj
  name: string;
  login: string;
  password?: string; // often omitted from frontend models
  email: string;
  phone: string;
  address: Address; // Made required to match backend
}


export interface OngUpdateRequest {
  cnpj?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: Address;
}
