export interface Patient {
    id?: number;           // Opzionale perché non lo abbiamo durante la creazione
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    email: string;
    phone: string;
    address: string;
    gender: string;
    fiscalCode: string;
} 