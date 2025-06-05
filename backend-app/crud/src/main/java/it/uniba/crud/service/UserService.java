package it.uniba.crud.service;

import it.uniba.crud.dto.AuthResponse;
import it.uniba.crud.dto.LoginRequest;
import it.uniba.crud.dto.RegisterRequest;
import it.uniba.crud.dto.UserResponse;
//import it.uniba.crud.entity.Patient;
import it.uniba.crud.entity.User;
import it.uniba.crud.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
//import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Registra un nuovo utente nel sistema.
     * @param registerRequest Contiene i dati di registrazione dell'utente
     * @return AuthResponse con informazioni sul successo o fallimento dell'operazione
     */
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        // Verifica se l'username è già in uso
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return new AuthResponse("Username già in uso", false);
        }
        // Verifica se l'email è già in uso
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new AuthResponse("Email già in uso", false);
        }
        
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // nel db salvo l'hash della password inserite dall'utente
        user.setEmail(registerRequest.getEmail());
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setDataBirth(registerRequest.getDateBirth());
        user.setAddress(registerRequest.getAddress());
        user.setPhone(registerRequest.getPhone());
        
        // Salva l'utente nel database
        userRepository.save(user);
        
        // Restituisci una risposta di successo
        return new AuthResponse("Registrazione completata con successo!!", true, user.getId(), user.getUsername());
    }
    
    
    /**
     * Autentica un utente nel sistema.
     * @param loginRequest Contiene username e password per il login
     * @return AuthResponse con informazioni sul successo o fallimento del login
     */
    public AuthResponse loginUser(LoginRequest loginRequest) {
    	/*
    	 * Usa il metodo personalizzato findByUsername che ho definito nell’interfaccia UserRepository 
    	 * per cercare nel database l’utente con quello username.
    	 * Il risultato è avvolto in un Optional perché:
    	 * -Potrebbe esistere un utente con quello username
    	 * -Potrebbe non esistere alcun utente con quello username, e così facendo evitiamo l'eccezione NullPointerException 
    	 * 
    	 * Userò poi il metodo isPresent() per capire la risposta del metodo finByUsername(),
    	 * se è stato trovato allora all'interno dell'Optional sarà memorizzato l'utente,
    	 * se non è stato trovato il metodo isPresent() restituirà false. 
    	 * */
    	Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
    	
    	if(!userOptional.isPresent()) {
    		return new AuthResponse("Username non trovato", false);
    	}
    	
    	User user = userOptional.get();
    	
        // Verifica se la password è corretta
        // NOTA: in un'applicazione reale, dovremmo confrontare password criptate
    	if(!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
    		return new AuthResponse("Password errata", false);
    	}
    	
        // Login effettuato con successo
        return new AuthResponse("Login effettuato con successo", true, user.getId(), user.getUsername());
    }
    
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    
    /**
     * Recupera tutti gli utenti dal database e li converte in una lista di UserResponse.
     *
     * @return Lista di UserResponse contenente le informazioni essenziali degli utenti.
     */
	public List<UserResponse> fetchAllUser() {
		Iterable<User> users = userRepository.findAll();
		   return StreamSupport.stream(users.spliterator(), false)
		            .map(user -> new UserResponse(
		                    user.getId(),
		                    user.getUsername(),
		                    user.getEmail(),
		                    user.getFirstName(),
		                    user.getLastName(),
		                    user.getDataBirth(),
		                    user.getPhone(),
		                    user.getAddress()
		            ))
		            .collect(Collectors.toList());	
	}
    
    
}
