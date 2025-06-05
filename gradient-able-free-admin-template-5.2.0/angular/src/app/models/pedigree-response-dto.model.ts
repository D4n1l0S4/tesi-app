export interface PedigreeResponseDto {
    id: number;             // id del pedigree
    patientId: number;      // id del paziente
    patientName: string;    // nome+cognomedel paziente
    data: any;              // qui tornerà l’oggetto JSON del pedigree
    createdBy: number;      // id user che ha creato il pedigree
    lastModifiedBy: number; // id user che ha modificato l'ultima volta il pedigree
    createdAt: string;      // data ed ora di creazione del pedigree
    lastModified: string;   // data ed ora dell'ultima modifica del pedigree
}
