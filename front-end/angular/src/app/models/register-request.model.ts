export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    dateBirth?: string; // Optional, formato ISO String (YYYY-MM-DD)
    address?: string;   // Optional
    phone: string;
  }
