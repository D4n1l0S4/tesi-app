export interface AuthResponse {
    message: string;
    success: boolean;
    userId?: number;    // Optional perché potrebbe non essere presente in caso di errore
    username?: string;  // Optional perché potrebbe non essere presente in caso di errore
    validationErrors?: { [key: string]: string }; // Errori di validazione specifici per campo
}
