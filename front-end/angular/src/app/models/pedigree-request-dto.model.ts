export interface PedigreeRequestDto {
    patientId: number;
    data: any;        // qui andrà l’oggetto JSON di PedigreeJS
    createdBy: number;
    modifiedBy: number;
}
