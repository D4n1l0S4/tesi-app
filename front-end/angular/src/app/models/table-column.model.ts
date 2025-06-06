export interface TableColumn {
    key: string;           // Chiave che corrisponde alla proprietà del Patient
    label: string;         // Etichetta da mostrare nell'intestazione
    sortable?: boolean;    // Se la colonna è ordinabile
    searchable?: boolean;  // Se la colonna è ricercabile
    type?: 'text' | 'date' | 'number'; // Tipo di dato per la formattazione
} 