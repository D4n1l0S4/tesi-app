package it.uniba.crud.controller.pedigree;

import java.util.Optional;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import it.uniba.crud.dto.ApiResponse;
import it.uniba.crud.dto.pedigree.PedigreeRequestDTO;
import it.uniba.crud.dto.pedigree.PedigreeResponseDTO;
import it.uniba.crud.exception.CreatedByUserNotFoundException;
import it.uniba.crud.exception.ModifiedByUserNotFoundException;
import it.uniba.crud.service.pedigree.PedigreeService;
import it.uniba.crud.service.PatientService;

import org.springframework.http.HttpStatus;



@RestController
@RequestMapping("/api/v1/pedigrees")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PedigreeController {

    @Autowired
    private PedigreeService pedigreeService;

    @Autowired
    private PatientService patientService;
    
    
    /** 
     * Controlla se esiste un pedigree per un dato paziente.
     */
    @GetMapping("/exists/{patientId}")
    public ResponseEntity<ApiResponse<Boolean>> exists(@PathVariable Long patientId) {
    	
    	// Verifica che il paziente esista
    	if (!patientService.existsById(patientId)) {
    	    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
    	        new ApiResponse<Boolean>(false, "Errore: Paziente con ID(" + patientId + ") non trovato nel DB")
    	    );
    	}

        boolean patientHasPedigree = pedigreeService.existsByPatientId(patientId);
        
        if(patientHasPedigree) {
        	return ResponseEntity.ok(
        		new ApiResponse<Boolean>(patientHasPedigree, "Trovato pedigree associato al paziente con ID: " + patientId)
        	);
        } else {
        	return ResponseEntity.ok(
            		new ApiResponse<Boolean>(patientHasPedigree, "Non c'è alcun pedigree associato al paziente con ID: " + patientId)
            	);
        }
    }
    
    
    
    /**
     * Recupera il pedigree (se esiste), ritorna cmq http.code 200, 
     * in base al campo success capisci se quel paziente ha già un 
     * pedigree oppure bisognerà crearne uno nuovo. 
     *  
     */
    @GetMapping("/by-patient/{patientId}")
    public ResponseEntity<ApiResponse<PedigreeResponseDTO>> getByPatient(
            @PathVariable Long patientId) {
    	
        // Verifica che il paziente esista
        if (!patientService.existsById(patientId)) {
            return ResponseEntity.ok(
                new ApiResponse<PedigreeResponseDTO>(false, "Errore: Paziente con ID(" + patientId + ") non trovato nel DB")
            );
        }
    	
        try {
	        Optional<PedigreeResponseDTO> opt = pedigreeService.getByPatientId(patientId);
	        if (opt.isPresent()) {
	            return ResponseEntity.ok(
	            		new ApiResponse<PedigreeResponseDTO>(true, "Pedigree trovato", opt.get())
	            );
	        } else {
	            return ResponseEntity.ok(
	            		new ApiResponse<PedigreeResponseDTO>(false, "Non esiste un pedigree per il paziente con ID: " + patientId)
	            );
	        }
        } catch(Exception e) {
        	return ResponseEntity.ok(
        			new ApiResponse<PedigreeResponseDTO>(false, "Errore durante il recupero del pedigree: " + e.getMessage())
        	);
        }
    }
    
    
    
    /**
     * Crea o aggiorna un pedigree.
     */
    @PostMapping("")
    public ResponseEntity<ApiResponse<PedigreeResponseDTO>> save(
            @Valid @RequestBody PedigreeRequestDTO pedigreeRequest) {
    	
        // Verifica che il paziente esista
        if (!patientService.existsById(pedigreeRequest.getPatientId())) {
            return ResponseEntity.ok(
                new ApiResponse<PedigreeResponseDTO>(false, "Paziente con ID: " + pedigreeRequest.getPatientId() + " non trovato nel DB")
            );
        }
    	
    	try {
	        PedigreeResponseDTO resp = pedigreeService.saveOrUpdate(pedigreeRequest);
	        return ResponseEntity.ok(
	        		new ApiResponse<PedigreeResponseDTO>(true, "Pedigree salvato", resp)
	        );
    	} catch(CreatedByUserNotFoundException | ModifiedByUserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiResponse<>(false, e.getMessage())
            );
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ApiResponse<PedigreeResponseDTO>(false, "Errore durante il salvataggio del pedigree: " + e.getMessage())
            );
    	}
    }
}
