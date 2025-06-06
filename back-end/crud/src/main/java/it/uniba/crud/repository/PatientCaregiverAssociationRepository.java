package it.uniba.crud.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import it.uniba.crud.entity.Patient;
import it.uniba.crud.entity.Caregiver;
import it.uniba.crud.entity.PatientCaregiverAssociation;

@Repository
public interface PatientCaregiverAssociationRepository extends CrudRepository<PatientCaregiverAssociation, Long> {
    /**
     * Trova tutte le associazioni per un dato paziente
     * @param patient Paziente per cui cercare le associazioni
     * @return Lista di associazioni Paziente-Caregiver
     */
    List<PatientCaregiverAssociation> findByPatient(Patient patient);

    
    /**
     * Trova tutte le associazioni per un dato caregiver
     * @param caregiver Caregiver per cui cercare le associazioni
     * @return Lista di associazioni Paziente-Caregiver
     */
    List<PatientCaregiverAssociation> findByCaregiver(Caregiver caregiver);

    
    /**
     * Verifica se esiste già un'associazione tra un paziente e un caregiver
     * @param patient Paziente
     * @param caregiver Caregiver
     * @return true se l'associazione esiste, false altrimenti
     */
    boolean existsByPatientAndCaregiver(Patient patient, Caregiver caregiver);

    
    /**
     * Trova un'associazione specifica tra paziente e caregiver
     * @param patient Paziente
     * @param caregiver Caregiver
     * @return Optional dell'associazione
     */
    Optional<PatientCaregiverAssociation> findByPatientAndCaregiver(Patient patient, Caregiver caregiver);
    
    
    Optional<PatientCaregiverAssociation> findByPatientIdAndCaregiverId(Long patientId, Long caregiverId);
} 