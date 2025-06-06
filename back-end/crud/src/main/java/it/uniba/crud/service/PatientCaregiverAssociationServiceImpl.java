package it.uniba.crud.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import it.uniba.crud.dto.PatientCaregiverAssociationDTO;
import it.uniba.crud.entity.Caregiver;
import it.uniba.crud.entity.Patient;
import it.uniba.crud.entity.PatientCaregiverAssociation;
import it.uniba.crud.repository.CaregiverRepository;
import it.uniba.crud.repository.PatientCaregiverAssociationRepository;
import it.uniba.crud.repository.PatientRepository;

@Service
public class PatientCaregiverAssociationServiceImpl implements PatientCaregiverAssociationService {

    @Autowired
    private PatientCaregiverAssociationRepository associationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private CaregiverRepository caregiverRepository;

    
    //TESTATO
    @Override
    @Transactional
    public PatientCaregiverAssociation associateCaregiver(PatientCaregiverAssociationDTO associationDTO) {
    	
        // Recupera paziente e caregiver
        Patient patient = patientRepository.findById(associationDTO.getPatientId())
            .orElseThrow(() -> new RuntimeException("Patient not found with id: " + associationDTO.getPatientId()));
        
        Caregiver caregiver = caregiverRepository.findById(associationDTO.getCaregiverId())
            .orElseThrow(() -> new RuntimeException("Caregiver not found with id: " + associationDTO.getCaregiverId()));

        // Verifica se l'associazione esiste già
        if (associationRepository.existsByPatientAndCaregiver(patient, caregiver)) {
            throw new RuntimeException("Association already exists between this patient and caregiver");
        }

        // Crea nuova associazione
        PatientCaregiverAssociation association = new PatientCaregiverAssociation();
        association.setPatient(patient);
        association.setCaregiver(caregiver);
        association.setRelationship(associationDTO.getRelationship());

        return associationRepository.save(association);
    }
    
    
    
    /**
     * Recupera l'associazione tra un paziente e un caregiver.
     * @param patientId ID del paziente
     * @param caregiverId ID del caregiver
     * @return L'associazione trovata o null se non esiste
     */
    @Override
    public PatientCaregiverAssociation findAssociationByPatientAndCaregiver(Long patientId, Long caregiverId) {
        Optional<PatientCaregiverAssociation> associationOpt = 
            associationRepository.findByPatientIdAndCaregiverId(patientId, caregiverId);
        
        return associationOpt.orElse(null);
    }

    
    
    //TESTATO
    @Override
    @Transactional(readOnly = true)
    public List<PatientCaregiverAssociation> getCaregiversByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
        
        return associationRepository.findByPatient(patient);
    }

    
    
    //TESTATO
    @Override
    @Transactional(readOnly = true)
    public List<PatientCaregiverAssociation> getPatientsByCaregiver(Long caregiverId) {
        Caregiver caregiver = caregiverRepository.findById(caregiverId)
            .orElseThrow(() -> new RuntimeException("Caregiver not found with id: " + caregiverId));
        
        return associationRepository.findByCaregiver(caregiver);
    }
    
    
    
    //TESTATO
    @Override
    @Transactional
    public void removeAssociation(Long associationId) {
        PatientCaregiverAssociation association = associationRepository.findById(associationId)
            .orElseThrow(() -> new RuntimeException("Association not found with id: " + associationId));
        
        associationRepository.delete(association);
    }

    
    
    //TESTATO
    @Override
    @Transactional
    public PatientCaregiverAssociation updateRelationship(Long associationId, String newRelationship) {
        PatientCaregiverAssociation association = associationRepository.findById(associationId)
            .orElseThrow(() -> new RuntimeException("Association not found with id: " + associationId));
        
        association.setRelationship(newRelationship);
        return associationRepository.save(association);
    }
} 