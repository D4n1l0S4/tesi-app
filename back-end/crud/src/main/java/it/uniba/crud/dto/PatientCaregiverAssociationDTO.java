package it.uniba.crud.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientCaregiverAssociationDTO {

    /**
     * ID dell'associazione (opzionale, generato dal database)
     */
    private Long idAssociation;

    /**
     * ID del paziente a cui associare il caregiver
     * Validazione: richiesto e deve essere un numero positivo
     */
    @NotNull(message = "Patient ID is required")
    @Positive(message = "Patient ID must be a positive number")
    private Long patientId;

    /**
     * ID del caregiver da associare
     * Validazione: richiesto e deve essere un numero positivo
     */
    @NotNull(message = "Caregiver ID is required")
    @Positive(message = "Caregiver ID must be a positive number")
    private Long caregiverId;

    /**
     * Tipo di relazione tra paziente e caregiver
     * Validazione: richiesto, lunghezza massima 100 caratteri
     */
    @NotBlank(message = "Relationship type is required")
    @Size(max = 100, message = "Relationship type must be less than 100 characters")
    private String relationship;
} 