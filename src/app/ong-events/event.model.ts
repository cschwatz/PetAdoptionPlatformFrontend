import { Address } from '../address/address.model';
import { Ong } from '../ong/ong.model';


export enum EventTypeEnum {
  ADOPTION_FAIR = 'ADOPTION_FAIR',
  FUNDRAISING = 'FUNDRAISING',
  AWARENESS_CAMPAIGN = 'AWARENESS_CAMPAIGN',
  VETERINARY_CLINIC = 'VETERINARY_CLINIC',
  VOLUNTEER_MEETING = 'VOLUNTEER_MEETING',
  OTHER = 'OTHER'
}


export interface Event {
  id: string;
  name: string;
  obs?: string;      // Description field for the event
  eventType: EventTypeEnum;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  address?: Address;
  ong?: Ong;
}