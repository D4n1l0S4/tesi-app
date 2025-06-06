import { Patient } from './patient.model';
import { Caregiver } from '../models/caregiver.model';

export interface PatientCaregiverAssociation {
  id?: number;
  patient: Patient;
  caregiver: Caregiver;
  relationship: string;
} 