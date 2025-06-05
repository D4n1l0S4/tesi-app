package it.uniba.crud.dto;

import lombok.*;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Collections;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientCaregiverAssociationResponseDTO {
    /**
     * Indica se l'operazione è andata a buon fine
     */
    private boolean success;

    /**
     * Dati dell'associazione (se l'operazione è riuscita)
     * Può contenere un singolo DTO o una lista di DTO
     */
    private Object data;

    /**
     * Mappa degli errori (se l'operazione non è riuscita)
     */
    @Builder.Default
    private Map<String, String> errors = new HashMap<>();

    /**
     * Timestamp dell'operazione
     */
    private LocalDateTime timestamp;

    /**
     * Messaggio descrittivo (opzionale)
     */
    private String message;

    /**
     * Metodo factory per creare una risposta di successo con singolo DTO
     */
    public static PatientCaregiverAssociationResponseDTO success(PatientCaregiverAssociationDTO data) {
        return PatientCaregiverAssociationResponseDTO.builder()
            .success(true)
            .data(data)
            .timestamp(LocalDateTime.now())
            .message("Operation completed successfully")
            .build();
    }

    /**
     * Metodo factory per creare una risposta di successo con lista di DTO
     */
    public static PatientCaregiverAssociationResponseDTO successList(List<PatientCaregiverAssociationDTO> dataList) {
        return PatientCaregiverAssociationResponseDTO.builder()
            .success(true)
            .data(dataList)
            .timestamp(LocalDateTime.now())
            .message(dataList.isEmpty() ? "No associations found" : "Associations retrieved successfully")
            .build();
    }

    /**
     * Metodo factory per creare una risposta di errore
     */
    public static PatientCaregiverAssociationResponseDTO error(Map<String, String> errors) {
        return PatientCaregiverAssociationResponseDTO.builder()
            .success(false)
            .errors(errors)
            .timestamp(LocalDateTime.now())
            .message("Operation failed")
            .build();
    }

    /**
     * Metodo factory per creare una risposta di errore con un singolo errore
     */
    public static PatientCaregiverAssociationResponseDTO error(String key, String errorMessage) {
        Map<String, String> errors = new HashMap<>();
        errors.put(key, errorMessage);
        return error(errors);
    }
} 