package it.uniba.crud.service;

import java.util.List;

import it.uniba.crud.dto.PatientCaregiverAssociationDTO;
import it.uniba.crud.entity.PatientCaregiverAssociation;

public interface PatientCaregiverAssociationService {
    /**
     * Associa un caregiver a un paziente
     * 
     * @param associationDTO DTO contenente i dettagli dell'associazione
     * @return L'associazione creata
     * @throws RuntimeException se l'associazione esiste già o se paziente/caregiver non esistono
     */
    PatientCaregiverAssociation associateCaregiver(PatientCaregiverAssociationDTO associationDTO);

    /**
     * Recupera tutti i caregiver di un paziente
     * 
     * @param patientId ID del paziente
     * @return Lista delle associazioni del paziente
     */
    List<PatientCaregiverAssociation> getCaregiversByPatient(Long patientId);

    /**
     * Recupera tutti i pazienti di un caregiver
     * 
     * @param caregiverId ID del caregiver
     * @return Lista delle associazioni del caregiver
     */
    List<PatientCaregiverAssociation> getPatientsByCaregiver(Long caregiverId);

    /**
     * Rimuove un'associazione tra paziente e caregiver
     * 
     * @param associationId ID dell'associazione da rimuovere
     * @throws RuntimeException se l'associazione non esiste
     */
    void removeAssociation(Long associationId);

    /**
     * Aggiorna la relazione di un'associazione esistente
     * 
     * @param associationId ID dell'associazione
     * @param newRelationship Nuovo tipo di relazione
     * @return L'associazione aggiornata
     * @throws RuntimeException se l'associazione non esiste
     */
    PatientCaregiverAssociation updateRelationship(Long associationId, String newRelationship);
    
    /**
     * Recupera l'associazione tra un paziente e un caregiver.
     * @param patientId ID del paziente
     * @param caregiverId ID del caregiver
     * @return L'associazione trovata o null se non esiste
     */
    PatientCaregiverAssociation findAssociationByPatientAndCaregiver(Long patientId, Long caregiverId);
} 