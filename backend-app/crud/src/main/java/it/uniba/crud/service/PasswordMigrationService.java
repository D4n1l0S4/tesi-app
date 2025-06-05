package it.uniba.crud.service;

/*
import it.uniba.crud.dto.UserResponse;
import it.uniba.crud.entity.User;
import it.uniba.crud.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
*/

/**
 * Per info vai nella classe PasswordMigrationController.
 */
/*
@Service
public class PasswordMigrationService {
    private static final Logger logger = LoggerFactory.getLogger(PasswordMigrationService.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public PasswordMigrationService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Transactional
    public void migratePasswords() {
        logger.info("Inizio migrazione password...");
        int migratedCount = 0;
        
        try {
            List<User> users = (List<User>) userRepository.findAll();
            logger.info("Trovati {} utenti da processare", users.size());
            
            for (User user : users) {
                String currentPassword = user.getPassword();
                
                if (!isPasswordHashed(currentPassword)) {
                    String hashedPassword = passwordEncoder.encode(currentPassword);
                    user.setPassword(hashedPassword);
                    userRepository.save(user);
                    migratedCount++;
                    logger.info("Password migrata per l'utente: {} (ID: {})", user.getUsername(), user.getId());
                } else {
                	logger.debug("Password già hashata per l'utente: {} (ID: {})", user.getUsername(), user.getId());
                }
            }
            
            logger.info("Migrazione completata. {} password migrate.", migratedCount);
        } catch (Exception e) {
            logger.error("Errore durante la migrazione delle password", e);
            throw e;
        }
    }
    
    
    private boolean isPasswordHashed(String password) {
        return password != null && 
               password.startsWith("$2") && 
               password.length() == 60;
    }
}*/
