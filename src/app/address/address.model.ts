export interface Address {
  id?: string;        // UUID, optional if excluded in backend JSON
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: number;
  cep: string;
}