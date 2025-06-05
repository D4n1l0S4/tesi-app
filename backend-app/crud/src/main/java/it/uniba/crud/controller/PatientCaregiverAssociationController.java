package it.uniba.crud.controller;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import it.uniba.crud.dto.PatientCaregiverAssociationDTO;
import it.uniba.crud.dto.PatientCaregiverAssociationResponseDTO;
import it.uniba.crud.entity.PatientCaregiverAssociation;
import it.uniba.crud.service.PatientCaregiverAssociationService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/patient-caregiver")
@CrossOrigin(maxAge = 3600)
@Validated
public class PatientCaregiverAssociationController {

    @Autowired
    private PatientCaregiverAssociationService associationService;

    
    //TESTATO
    /**
     * Converte un'entità PatientCaregiverAssociation in DTO
     */
    private PatientCaregiverAssociationDTO convertToDto(PatientCaregiverAssociation association) {
        PatientCaregiverAssociationDTO dto = new PatientCaregiverAssociationDTO();
        dto.setIdAssociation(association.getId());
        dto.setPatientId(association.getPatient().getId());
        dto.setCaregiverId(association.getCaregiver().getId());
        dto.setRelationship(association.getRelationship());
        return dto;
    }

    
    
    //TESTATO    
    /**
     * Associa un caregiver a un paziente
     * 
     * @param associationDTO Dettagli dell'associazione
     * @return Risposta con esito dell'associazione
     */
    @PostMapping("/associate")
    public ResponseEntity<PatientCaregiverAssociationResponseDTO> associateCaregiver(
        @Valid @RequestBody PatientCaregiverAssociationDTO associationDTO
    ) {
        try {
            PatientCaregiverAssociation association = associationService.associateCaregiver(associationDTO);
            PatientCaregiverAssociationDTO responseDto = convertToDto(association);
            
            return ResponseEntity.ok(
                PatientCaregiverAssociationResponseDTO.success(responseDto)
            );
        } catch (Exception e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("association", e.getMessage());
            
            return ResponseEntity.badRequest().body(
                PatientCaregiverAssociationResponseDTO.error(errors)
            );
        }
    }

    
   
    //TESTATO
    /**
     * Recupera i caregiver di un paziente
     * 
     * @param patientId ID del paziente
     * @return Lista delle associazioni
     */
    @GetMapping("/caregiver-by-patient/{patientId}")
    public ResponseEntity<PatientCaregiverAssociationResponseDTO> getCaregiversByPatient(
        @PathVariable Long patientId
    ) {
        try {
            List<PatientCaregiverAssociation> associations = associationService.getCaregiversByPatient(patientId);
            List<PatientCaregiverAssociationDTO> dtos = associations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            // Restituiamo la lista completa dei caregiver
            return ResponseEntity.ok(
                PatientCaregiverAssociationResponseDTO.successList(dtos)
            );
        } catch (Exception e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("patient", e.getMessage());
            
            return ResponseEntity.badRequest().body(
                PatientCaregiverAssociationResponseDTO.error(errors)
            );
        }
    }

    
    
    /**
     * Recupera i pazienti di un caregiver
     * 
     * @param caregiverId ID del caregiver
     * @return Lista delle associazioni
     */
    @GetMapping("/patient-by-caregiver/{caregiverId}")
    public ResponseEntity<PatientCaregiverAssociationResponseDTO> getPatientsByCaregiver(
        @PathVariable Long caregiverId
    ) {
        try {
            List<PatientCaregiverAssociation> associations = associationService.getPatientsByCaregiver(caregiverId);
            List<PatientCaregiverAssociationDTO> dtos = associations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            // Restituiamo la lista completa dei pazienti
            return ResponseEntity.ok(
                PatientCaregiverAssociationResponseDTO.successList(dtos)
            );
        } catch (Exception e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("caregiver", e.getMessage());
            
            return ResponseEntity.badRequest().body(
                PatientCaregiverAssociationResponseDTO.error(errors)
            );
        }
    }

    
    

    
    /**
     * Recupera l'ID dell'associazione dato un paziente e un caregiver
     * 
     * @param patientId ID del paziente
     * @param caregiverId ID del caregiver
     * @return Risposta con l'associazione trovata
     */
    @GetMapping("/association")
    public ResponseEntity<PatientCaregiverAssociationResponseDTO> getAssociationByPatientAndCaregiver(
        @RequestParam Long patientId,
        @RequestParam Long caregiverId
    ) {
        try {
            PatientCaregiverAssociation association = 
                associationService.findAssociationByPatientAndCaregiver(patientId, caregiverId);
            
            if (association != null) {
                PatientCaregiverAssociationDTO responseDto = convertToDto(association);
                return ResponseEntity.ok(
                    PatientCaregiverAssociationResponseDTO.success(responseDto)
                );
            } else {
                Map<String, String> errors = new HashMap<>();
                errors.put("association", "Nessuna associazione trovata per paziente ID: " + 
                          patientId + " e caregiver ID: " + caregiverId);
                
                return ResponseEntity.ok().body(
                    PatientCaregiverAssociationResponseDTO.error(errors)
                );
            }
        } catch (Exception e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("association", e.getMessage());
            
            return ResponseEntity.badRequest().body(
                PatientCaregiverAssociationResponseDTO.error(errors)
            );
        }
    }
    
    
    
    /**
     * Rimuove un'associazione
     * 
     * @param associationId ID dell'associazione
     * @return Risposta con esito dell'operazione
     */
    @DeleteMapping("/remove/{associationId}")
    public ResponseEntity<PatientCaregiverAssociationResponseDTO> removeAssociation(
        @PathVariable Long associationId
    ) {
        try {
            associationService.removeAssociation(associationId);
            
            return ResponseEntity.ok(
                PatientCaregiverAssociationResponseDTO.builder()
                    .success(true)
                    .message("Association removed successfully")
                    .build()
            );
        } catch (Exception e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("association", e.getMessage());
            
            return ResponseEntity.badRequest().body(
                PatientCaregiverAssociationResponseDTO.error(errors)
            );
        }
    }

    
    
    /**
     * Aggiorna la relazione di un'associazione
     * 
     * @param associationId ID dell'associazione
     * @param relationship Nuova relazione
     * @return Associazione aggiornata
     */
    @PutMapping("/update-relationship/{associationId}")
    public ResponseEntity<PatientCaregiverAssociationResponseDTO> updateRelationship(
        @PathVariable Long associationId,
        @RequestParam String relationship
    ) {
        try {
            PatientCaregiverAssociation association = associationService.updateRelationship(associationId, relationship);
            PatientCaregiverAssociationDTO responseDto = convertToDto(association);
            
            return ResponseEntity.ok(
                PatientCaregiverAssociationResponseDTO.success(responseDto)
            );
        } catch (Exception e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("association", e.getMessage());
            
            return ResponseEntity.badRequest().body(
                PatientCaregiverAssociationResponseDTO.error(errors)
            );
        }
    }
    
} 