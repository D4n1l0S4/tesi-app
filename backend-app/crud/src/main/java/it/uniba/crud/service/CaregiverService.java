package it.uniba.crud.service;

import java.util.List;
import java.util.Optional;

import it.uniba.crud.dto.CaregiverDTO;
import it.uniba.crud.entity.Caregiver;

public interface CaregiverService {
    /**
     * Recupera tutti i caregiver
     * @return Lista di caregiver
     */
    List<Caregiver> fetchAllCaregiver();

    /**
     * Recupera un caregiver per ID
     * @param id ID del caregiver
     * @return Caregiver trovato
     */
    Caregiver fetchById(Long id);

    /**
     * Recupera un caregiver per ID in modo sicuro
     * @param id ID del caregiver
     * @return Optional del caregiver
     */
    Optional<Caregiver> fetchByIdSafe(Long id);

    /**
     * Crea un nuovo caregiver
     * @param caregiver DTO del caregiver da creare
     * @return Caregiver creato
     */
    Caregiver createCaregiver(CaregiverDTO caregiver);

    /**
     * Aggiorna un caregiver esistente
     * @param id ID del caregiver da aggiornare
     * @param caregiver DTO con i nuovi dati
     * @return Caregiver aggiornato
     */
    Caregiver updateCaregiver(Long id, CaregiverDTO caregiver);

    /**
     * Elimina un caregiver
     * @param caregiver Caregiver da eliminare
     * @return Messaggio di conferma
     */
    String deleteCaregiver(Caregiver caregiver);
    
    Optional<Caregiver> findByFiscalCode(String fiscalCode);
} 