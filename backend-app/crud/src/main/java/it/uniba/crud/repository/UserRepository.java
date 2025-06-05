package it.uniba.crud.repository;

import it.uniba.crud.entity.User;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository per l'entità User.
 * Estende CrudRepository per avere accesso alle operazioni CRUD 
 * di base, come: save, findById, findAll, deleteById, count, existsById, ecc.
 *
 * I metodi aggiuntivi come findByUsername, existsByUsername ed existsByEmail,
 * sono stati aggiunti da me, ma saranno comunque automaticamente implementati 
 * da Spring Data JPA grazie al nome del metodo (query methods).
 * Non serve definirne il comportamento a mano, lo inferisce dal nome del metodo.
 */
public interface UserRepository extends CrudRepository<User, Long> {
	
    /* Metodo per trovare un utente per username
     * lo userò quando arriva una richiesta di login
     * per verificare che esiste uno user con l'username 
     * inserito dall'utente.
     */
    Optional<User> findByUsername(String username); 
    
    /* Metodo per verificare se esiste un utente con un dato username, 
    *lo userò nella registrazione per evitare di creare 2 utenti con stesso username
    **/
    boolean existsByUsername(String username);
    
    // Metodo per verificare se esiste un utente con una data email
    boolean existsByEmail(String email);

}
