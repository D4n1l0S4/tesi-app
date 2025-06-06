package it.uniba.crud.exception;

public class ModifiedByUserNotFoundException extends RuntimeException {
	
    public ModifiedByUserNotFoundException(Long userId) {
        super("L'Uutente con ID: " + userId + " che sta cercando di apportare modifiche al pedigree non è stato trovato nel sistema.");
    }
}
