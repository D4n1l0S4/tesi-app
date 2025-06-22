package it.uniba.crud.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;



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
