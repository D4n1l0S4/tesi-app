package it.uniba.crud.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import it.uniba.crud.dto.ApiResponse;
import it.uniba.crud.dto.CaregiverDTO;
import it.uniba.crud.entity.Caregiver;
import it.uniba.crud.service.CaregiverService;
import jakarta.validation.Valid;
//WHAT
@RestController
@RequestMapping("/api/v1/caregivers")
@CrossOrigin(maxAge = 3600)
@Validated
public class CaregiverController {

    @Autowired
    private CaregiverService caregiverService;

    
    
    @GetMapping("/hello")
    public ResponseEntity<String> hello(@RequestParam(required = false) String name) {
        if(name != null && !name.isEmpty()) {
            return new ResponseEntity<>("Hello " + name, HttpStatus.OK);
        }
        return new ResponseEntity<>("Hello Caregiver World!!", HttpStatus.OK);
    }

    
    
    @GetMapping("")
    public ResponseEntity<List<Caregiver>> fetchAllCaregiver() {
        return ResponseEntity.ok(caregiverService.fetchAllCaregiver());
    }

    
    
    @GetMapping("/{id}")
    public ResponseEntity<Caregiver> fetchById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(caregiverService.fetchById(id));
    }

    
    
    @PostMapping("")
    public ResponseEntity<Caregiver> createCaregiver(@Valid @RequestBody CaregiverDTO caregiver) {
        caregiver.setId(null);
        return ResponseEntity.ok(caregiverService.createCaregiver(caregiver));
    }

    
    
    @PutMapping("/{id}")
    public ResponseEntity<Caregiver> updateCaregiver(
        @PathVariable("id") Long id, 
        @Valid @RequestBody CaregiverDTO caregiver
    ) {
        return ResponseEntity.ok(caregiverService.updateCaregiver(id, caregiver));
    }

    
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCaregiver(@PathVariable("id") Long id) {
        Caregiver careObj = caregiverService.fetchById(id);
        String deleteMsg = caregiverService.deleteCaregiver(careObj);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", deleteMsg);
        return ResponseEntity.ok(response);
    }
    
    
    
    @GetMapping("/search-by-fiscal-code")
    public ResponseEntity<ApiResponse<Caregiver>> findByFiscalCode(@RequestParam String fiscalCode) {
    	Optional<Caregiver> caregiverOpt = caregiverService.findByFiscalCode(fiscalCode);
    	
    	if(!caregiverOpt.isPresent()) { // caso in cui non è presente
    		ApiResponse<Caregiver> apiResponse = new ApiResponse<>(false, "Nessun Caregiver associato a quel Codice Fiscale.");
    		return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    	}

    	//se non è entrato nell'if sopra allora è presente
    	Caregiver caregiver = caregiverOpt.get();
    	ApiResponse<Caregiver> apiResponse = new ApiResponse<>(true, "Trovato Caregiver associato a quel Codice Fiscale.", caregiver);
    	
    	return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }
} 