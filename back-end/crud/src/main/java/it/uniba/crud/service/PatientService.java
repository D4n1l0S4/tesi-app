package it.uniba.crud.service;

import java.util.List;
import java.util.Optional;

import it.uniba.crud.entity.Patient;


/**
 * Interfaccia che definisce i servizi per la gestione dei pazienti.
 * Contiene metodi per recuperare, creare, aggiornare ed eliminare pazienti.
 */
public interface PatientService {

    /**
     * Recupera tutti i pazienti dal database.
     * @return Una lista di tutti i pazienti presenti nel sistema
     */
	List<Patient> fetchAllPatient();
	
    /**
     * Recupera un paziente specifico tramite ID.
     * Nota: Questo metodo lancia NoSuchElementException se il paziente non esiste.
     * @param id ID del paziente da recuperare
     * @return Il paziente trovato 
     * @throws NoSuchElementException se il paziente non esiste
     */
	Patient fetchById(Long id);
	
    /**
     * Recupera un paziente tramite ID in modo sicuro (restituendo un Optional).
     * Questo metodo è preferibile quando non siamo sicuri che il paziente esista.
     * @param id ID del paziente da recuperare
     * @return Optional che contiene il paziente se trovato, altrimenti empty
     */
	Optional<Patient> fetchByIdSafe(Long id);
	
    /**
     * Crea un nuovo paziente nel sistema.
     * @param patient Oggetto paziente da salvare
     * @return Il paziente salvato con ID generato
     */
	Patient createPatient(Patient patient);
	
    /**
     * Aggiorna un paziente esistente.
     * @param patient Oggetto paziente con i dati aggiornati
     * @return Il paziente aggiornato
     */
	Patient updatePatient(Patient patient);
	
    /**
     * Elimina un paziente dal sistema.
     * @param patient Oggetto paziente da eliminare
     * @return Messaggio di conferma dell'eliminazione
     */
	String deletePatient(Patient patient);
	
	boolean existsById(Long patientId);
}
