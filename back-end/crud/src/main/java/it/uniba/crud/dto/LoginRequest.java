package it.uniba.crud.dto;

/**
 * DTO per la richiesta di login.
 * Contiene le credenziali dell'utente (username e password) necessarie per l'autenticazione.
 * Viene utilizzato per mappare i dati ricevuti dal client(front-end) durante il processo di login.
 */

public class LoginRequest {
    private String username;
    private String password;
    
    // Getter e Setter
    public String getUsername() {
        return this.username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return this.password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}
