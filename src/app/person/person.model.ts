import { Address } from '../address/address.model';

export interface Person {
  id?: string;
  cpf: string;
  firstName: string;
  middleName?: string;
  familyName: string;
  login: string;
  password?: string;
  email: string;
  phone: string;
  address: Address;
}
