import { Address } from '../address/address.model';

export interface Ong {
  id?: string;
  cpnj: string;
  name: string;
  login: string;
  password?: string; // often omitted from frontend models
  email: string;
  phone: string;
  address?: Address; // assuming you add address to Ong later
}
