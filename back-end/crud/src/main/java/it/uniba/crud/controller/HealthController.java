package it.uniba.crud.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


@RestController 						//Dice a Spring che questa classe gestisce richieste REST (risponde con JSON*/
@RequestMapping("/api/v1/keep-alive") 	//Tutte le richieste/URL che iniziano con /api/v1/keep-alive devono essere gestite da questo controller.*/
@CrossOrigin(maxAge = 3360)				//Abilita le richieste CORS (cioè da altri domini, tipo dal tuo frontend Angular)*/

public class HealthController {
	
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Query semplice per testare la connessione al database
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            
            response.put("status", "OK");
            response.put("timestamp", LocalDateTime.now());
            response.put("database", "connected");
            response.put("dbTest", result);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("timestamp", LocalDateTime.now());
            response.put("database", "disconnected");
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong - " + LocalDateTime.now());
    }
}
