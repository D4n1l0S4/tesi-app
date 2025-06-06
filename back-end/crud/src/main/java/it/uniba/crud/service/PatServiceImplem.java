package it.uniba.crud.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import it.uniba.crud.entity.Patient;
import it.uniba.crud.repository.PatientRepository;


/**
 * Implementazione dell'interfaccia PatientService.
 * Questa classe contiene la logica di business per gestire i pazienti.
 */
@Service
public class PatServiceImplem implements PatientService{

    /**
     * Repository per l'accesso ai dati dei pazienti.
     * Viene iniettato automaticamente da Spring tramite @Autowired.
     */
	@Autowired
	private PatientRepository patientRepository;
	
	
	
	/**
     * {@inheritDoc}
     * Implementazione che recupera tutti i pazienti dal repository.
     */
	@Override
	public List<Patient> fetchAllPatient() {
		return (List<Patient>) patientRepository.findAll();
	}
	

	
    /**
     * {@inheritDoc}
     * Implementazione che recupera un paziente per ID.
     * ATTENZIONE: Il metodo .get() lancia NoSuchElementException se l'elemento non esiste.
     */
	@Override
	public Patient fetchById(Long id) {
		return patientRepository.findById(id).get();
	}

	
	
    /**
     * {@inheritDoc}
     * Implementazione sicura che restituisce un Optional<Patient>.
     * Questo permette di gestire il caso in cui il paziente non esista senza eccezioni.
     */
    @Override
    public Optional<Patient> fetchByIdSafe(Long id) {
        return patientRepository.findById(id);
    }

    
    
    /**
     * {@inheritDoc}
     * Implementazione che salva un nuovo paziente nel repository.
     */
	@Override
	public Patient createPatient(Patient patient) {
		return patientRepository.save(patient);
	}

	
	
    /**
     * {@inheritDoc}
     * Implementazione che aggiorna un paziente esistente nel repository.
     */
	@Override
	public Patient updatePatient(Patient patient) {
		return patientRepository.save(patient);
	}

	
	
    /**
     * {@inheritDoc}
     * Implementazione che elimina un paziente dal repository.
     */
	@Override
	public String deletePatient(Patient patient) {
		patientRepository.delete(patient);
		return "Patient is Deleted Successfully for id:"+patient.getId();
	}
	
	
	
    @Override
    public boolean existsById(Long patientId) {
        return patientRepository.existsById(patientId);
    }
	

}
