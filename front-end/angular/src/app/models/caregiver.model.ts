export interface Caregiver {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
  fiscalCode: string;
  relationship?: string;
  gender: string;
} 