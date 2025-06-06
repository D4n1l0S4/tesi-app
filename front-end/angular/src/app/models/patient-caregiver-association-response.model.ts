export interface PatientCaregiverAssociationResponseDTO {
    success: boolean;
    data: Object;
    errors: { [key: string]: string };
    timestamp: string; // Userò string per LocalDateTime
    message?: string;
} 