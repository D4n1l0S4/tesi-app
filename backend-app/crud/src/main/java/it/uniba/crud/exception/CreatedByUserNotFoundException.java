package it.uniba.crud.exception;

public class CreatedByUserNotFoundException extends RuntimeException {
	
    public CreatedByUserNotFoundException(Long userId) {
        super("L'utente con ID: " + userId + " che sta cercando di creare il pedigree non è stato trovato nel sistema.");
    }
}

