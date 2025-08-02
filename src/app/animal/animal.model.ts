import { Ong } from "../ong/ong.model";
import { Person } from "../person/person.model";

export interface Animal {
  id: string; // UUID as string, optional if hidden in some contexts
  name: string;
  animalType: string; // match your AnimalTypeEnum
  age: number;
  gender: string; // match your AnimalGenderEnum
  breed: string;
  color: string;
  size: number; // assuming size is stored as an int (e.g., 1=Small, 2=Medium)
  weight: number;
  fur: string; // match your FurSizeEnum
  obs?: string;
  castrated: boolean;
  adopted: boolean;
  photo?: string; // backend sends byte[] — will need to be converted to base64 on the backend
  ong?: Ong;
  person?: Person;
}