package it.uniba.crud.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import it.uniba.crud.entity.Caregiver;

import java.util.Optional;

@Repository
public interface CaregiverRepository extends CrudRepository<Caregiver, Long> {
	
    // Metodi personalizzati se necessario
    boolean existsByEmail(String email);
    boolean existsByFiscalCode(String fiscalCode);
    Optional<Caregiver> findByFiscalCode(String fiscalCode);
    
} 