package it.uniba.crud.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
//import java.util.Date;

/**
 * DTO per la richiesta di registrazione di un nuovo utente.
 * Include le informazioni necessarie per creare un nuovo account, come username, password,
 * email, nome, cognome, data di nascita e indirizzo.
 * Viene utilizzato per mappare i dati ricevuti dal client durante il processo di registrazione.
 */

public class RegisterRequest {
	
	/*
	 *SPEIGAZIONE ANNOTAZIONI:
	 * @NotBlank: Verifica che un campo String non sia null e contenga almeno un carattere non-whitespace
	 * @Size: Verifica che la lunghezza di una stringa, collezione o array rientri in un intervallo specificato
	 * @Email: Verifica che una stringa sia formattata come un indirizzo email valido
	 * @Pattern: Verifica che una stringa corrisponda a un'espressione regolare specificata
	 * @NotNull: Verifica che un campo non sia null (ma può essere vuoto se è una stringa)
	 *			 È diverso da @NotBlank perché @NotNull controlla solo che non sia null, mentre @NotBlank verifica anche che non sia una stringa vuota
	 **/
	
    @NotBlank(message = "L'username è obbligatorio") 
    @Size(min = 3, max = 250, message = "L'username deve essere compreso tra 3 e 250 caratteri") 
	private String username;
    
    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 8, max = 64, message = "La password deve avere una lunghezza che varia tra 8 e 64 caratteri")
	private String password;
    
    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Formato email non valido")
	private String email;
    
    @NotBlank(message = "Il nome è obbligatorio")
	private String firstName;
    
    @NotBlank(message = "Il cognome è obbligatorio")
	private String lastName;
    
	private LocalDate dateBirth;
	private String address;
	
    @NotBlank(message = "Il numero di telefono è obbligatorio")
    @Pattern(regexp = "^[0-9+\\- ]{5,20}$", message = "Formato telefono non valido, deve avere tra i 5 ed i 20 numeri")
	private String phone;
	
	
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
	
	public String getEmail() {
		return this.email;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}
	
	public String getFirstName() {
		return this.firstName;
	}
	
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	
	public String getLastName() {
		return this.lastName;
	}
	
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	
	public LocalDate getDateBirth() {
		return this.dateBirth;
	}
	
	public void setDateBirth(LocalDate dateBirth) {
		this.dateBirth = dateBirth;
	}
	
	public String getAddress() {
		return this.address;
	}
	
	public void setAddress(String address) {
		this.address = address;
	}
	
	public String getPhone() {
		return this.phone;
	}
	
	public void setPhone(String phone) {
		this.phone = phone;
	}
	
}
