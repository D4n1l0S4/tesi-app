package it.uniba.crud.repository.pedigree;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import it.uniba.crud.entity.Pedigree;


public interface PedigreeRepository extends JpaRepository<Pedigree, Long>{
	
    /**
     * Cerca il pedigree associato a un dato patientId.
     * @param patientId l'ID del paziente
     * @return Optional contenente il Pedigree (se esiste)
     */
	Optional<Pedigree> findByPatientId(Long patientId);
	
    /**
     * Verifica se esiste un pedigree
     * per il paziente specificato.
     * @param patientId l'ID del paziente
     * @return true se esiste
     */
    boolean existsByPatientId(Long patientId);
}
