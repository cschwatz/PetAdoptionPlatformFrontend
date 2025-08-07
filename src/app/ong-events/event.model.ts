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
  obs?: string;      
  eventType: EventTypeEnum;
  startDate: string;
  endDate: string;
  address?: Address;
  ong?: Ong;
}