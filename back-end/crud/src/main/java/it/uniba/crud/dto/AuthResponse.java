package it.uniba.crud.dto;

import java.util.Map;

/**
 * DTO di risposta per le operazioni di autenticazione (login o registrazione).
 * Contiene informazioni sul risultato dell'operazione, come messaggio, stato di successo,
 * ID utente e username. Viene restituito al client(front-end) per indicare l'esito dell'operazione.
 */

public class AuthResponse {
    private String message;
    private boolean success;
    private Long userId;
    private String username;
    private Map<String, String> validationErrors;
    
    public AuthResponse() {}
    
    public AuthResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }
    
    public AuthResponse(String message, boolean success, Long userId, String username) {
        this.message = message;
        this.success = success;
        this.userId = userId;
        this.username = username;
    }
    
    // Nuovo costruttore per errori di validazione
    public AuthResponse(String message, boolean success, Long userId, String username, Map<String, String> validationErrors) {
        this.message = message;
        this.success = success;
        this.userId = userId;
        this.username = username;
        this.validationErrors = validationErrors;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
    	return this.username;
    }
    
    public void setUsername(String username) {
    	this.username = username;
    }
    
    public Map<String, String> getValidationErrors() {
        return validationErrors;
    }
    
    public void setValidationErrors(Map<String, String> validationErrors) {
        this.validationErrors = validationErrors;
    }
}
