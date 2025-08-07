import { Ong } from "../ong/ong.model";
import { Person } from "../person/person.model";

export interface Animal {
  id: string;
  name: string;
  animalType: string;
  age: number;
  gender: string;
  breed: string;
  color: string;
  size: number;
  weight: number;
  fur: string;
  obs?: string;
  castrated: boolean;
  adopted: boolean;
  photo?: string;
  ong?: Ong;
  person?: Person;
}