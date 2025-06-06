package it.uniba.crud.controller;

import it.uniba.crud.dto.AuthResponse;
import it.uniba.crud.dto.LoginRequest;
import it.uniba.crud.dto.RegisterRequest;
import it.uniba.crud.dto.UserResponse;
import it.uniba.crud.entity.User;
import it.uniba.crud.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.validation.BindingResult;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

//ciao
@RestController
@RequestMapping("/api/v1/auth")	//Tutte le richieste/URL che iniziano con /api/v1/auth devono essere gestite da questo controller.*/
@CrossOrigin(origins = "*") // Permette richieste da qualsiasi origine
public class AuthController {
	
	private final UserService userService;
	
	@Autowired
	public AuthController(UserService userService) {
		this.userService = userService;
	}
	
	
	
	/*endpoint di prova*/
	 @GetMapping("/hello")
	 public String saluta(@RequestParam(required = false) String name) {
		 if (name == null || name.isEmpty()) {
			 return "hello world!!";  // Se name è null o vuoto, restituisci "Hello world!!"
		 }else{
			 return "hello" + " " + name;  // Altrimenti, restituisci "Hello <name>"
		 }		 
	 }
	
	 
	 
    /**
     * Endpoint per la registrazione di un nuovo utente.
     * L'annotazione @Valid nel metodo attiva il processo di validazione:
     * Quando Spring vede @Valid davanti a un parametro, esegue la validazione dell'oggetto secondo le annotazioni 
     * definite nella sua classe. Se l'oggetto non supera la validazione (ad esempio, un campo obbligatorio è vuoto), 
     * Spring genera errori di validazione.
     * 
     * bindingResult è un'interfaccia di Spring che contiene i risultati della validazione:
     * Contiene informazioni dettagliate su quali validazioni sono fallite e perché
     * 
     * @param registerRequest Contiene i dati di registrazione
     * @return ResponseEntity con AuthResponse che indica l'esito della registrazione
     */
	 @PostMapping("/signup")
	 public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest,
			 											BindingResult bindingResult) {
		 if(bindingResult.hasErrors()) {
		        Map<String, String> errors = new HashMap<>();
		        bindingResult.getFieldErrors().forEach((fieldErr) ->
		        errors.put(fieldErr.getField(), fieldErr.getDefaultMessage())); 
		        // getField() ritorna il nome del campo che non ha superato la validazione, cioè l'attributo definito nella classe, in questo caso RegisterRequest, mentre 
		        // getDefaultMessage() ritorna il messaggio, scritto da noi, associato alla field/attributo che non ha superato la validazione
		        
		        AuthResponse errorResponse = new AuthResponse("Errore nei dati inseriti in input", false, null, null, errors);
		        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
		 }
		 
		// Se la validazione dei vari campi è passata, cioè: il formato dei dati di input è corretto, 
		// tutti i campi obbligatori sono presenti nella richiesta di reg., etc.., passiamo al Service.
		 AuthResponse authResponse = userService.registerUser(registerRequest);
		 
		 if(authResponse.isSuccess()) {
			 return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
	     }else{
	    	 return new ResponseEntity<>(authResponse, HttpStatus.BAD_REQUEST);
	     }
	 }
	 
	 
	 
	 /**
	  * Endpoint per il login di un utente.
	  * @param loginRequest Contiene username e password
	  * @return ResponseEntity con AuthResponse che indica l'esito del login
	  */
	 @PostMapping("/signin")
	 public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginRequest loginRequest) {
		 //System.out.println(loginRequest); devi stampare ogni campo
		 AuthResponse authResponse = userService.loginUser(loginRequest);
		 
	     if (authResponse.isSuccess()) {
	    	 return new ResponseEntity<>(authResponse, HttpStatus.OK);
	     }else{
	    	 return new ResponseEntity<>(authResponse, HttpStatus.UNAUTHORIZED);
	     }
	 }
	 
	
	 
	 /**
	  * Endpoint per ottenere informazioni di un utente per ID.
	  * @param id ID dell'utente
	  * @return ResponseEntity con l'utente se trovato
	  */
	 @GetMapping("/user")
	 public ResponseEntity<?> getUserById(@RequestParam Long id){
		 Optional<User> userOptional = userService.getUserById(id);
		 
		 if(userOptional.isPresent()) {
			 User user = userOptional.get();
			// Rimuoviamo la password per motivi di sicurezza
			 user.setPassword("");
			 return new ResponseEntity<>(user, HttpStatus.OK);
		 }else{
			 return new ResponseEntity<>(new AuthResponse("Utente non trovato", false), HttpStatus.NOT_FOUND);
	     }
	 }
	 
	 
	 
	 /**
	  * Endpoint per il logout.
	  * Nota: poiché non stiamo implementando la gestione delle sessioni,
	  * questo endpoint è principalmente simbolico e restituisce solo una risposta di successo.
	  */
	 @PostMapping("/signout")
	 public ResponseEntity<AuthResponse> logoutUser() {
		 AuthResponse authResponse = new AuthResponse("Logout effettuato con successo", true);
		 return new ResponseEntity<>(authResponse, HttpStatus.OK);
	 }
	 
	 
	 
	 /**
	  * Endpoint GET per recuperare tutti gli utenti.
	  *
	  * @return ResponseEntity contenente la lista di UserResponse.
	  */
	 @GetMapping("/users") 
	 public ResponseEntity<List<UserResponse>> fetchAllUser() {
		 List<UserResponse> users = userService.fetchAllUser();
		 return new ResponseEntity<>(users, HttpStatus.OK);
	 }
}
