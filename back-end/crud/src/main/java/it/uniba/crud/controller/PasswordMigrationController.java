package it.uniba.crud.controller;
/*
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
*/
/*
 * Controller temporaneo per la migrazione delle password nel database.
 * 
 * SCOPO:
 * Questo controller gestisce la migrazione delle password degli utenti da formato non hashato a formato hashato (BCrypt).
 * È stato creato per gestire la transizione da un sistema che memorizzava le password in chiaro a un sistema che le memorizza in modo sicuro.
 * Una volta migrate tutte le password in formato hashato, ho commentato questa classe, così questo end point non è più accessibile da nessuno,
 * in alternativa avrei potuto usare un livello di autenticazione per accedere a quell'end-point.
 *  
 * LOG:
 * - I log della migrazione vengono salvati in logs/password-migration.log
 * - Per ogni utente viene registrato se la password è stata migrata o era già hashata
 * - Viene registrato l'ID e lo username di ogni utente processato 
 */
/*
@RestController
@RequestMapping("/api/admin")
public class PasswordMigrationController {
	
    private static final Logger logger = LoggerFactory.getLogger(PasswordMigrationController.class);
    private final PasswordMigrationService passwordMigrationService;
    
    public PasswordMigrationController(PasswordMigrationService passwordMigrationService) {
        this.passwordMigrationService = passwordMigrationService;
    }
    
    
    @PostMapping("/migrate-passwords")
    public String migratePasswords() {
        logger.info("Richiesta di migrazione password ricevuta");
        passwordMigrationService.migratePasswords();
        return "Migrazione password completata";
    }
}
*/