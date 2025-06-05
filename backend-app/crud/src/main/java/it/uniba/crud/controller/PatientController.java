package it.uniba.crud.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;


import it.uniba.crud.entity.Patient;
import it.uniba.crud.service.PatientService;


import java.util.HashMap;
import java.util.List;
import java.util.Map;



@RestController 						//Dice a Spring che questa classe gestisce richieste REST (risponde con JSON*/
@RequestMapping("/api/v1/patients") 	//Tutte le richieste/URL che iniziano con /api/v1/patients devono essere gestite da questo controller.*/
@CrossOrigin(maxAge = 3360)				//Abilita le richieste CORS (cioè da altri domini, tipo dal tuo frontend Angular)*/
public class PatientController {
	
	@Autowired
	private PatientService patientService;
	
	
	
	@GetMapping("/hello")
	public ResponseEntity<String> hello(@RequestParam(required = false) String name) {
		if(name!=null && !name.isEmpty()) {
			return new ResponseEntity<String>("Hello "+ name, HttpStatus.OK); 
		}
		return new ResponseEntity<String>("Hello World!!", HttpStatus.OK);
	}
	
	
	
	@GetMapping("") 
	public ResponseEntity<List<Patient>> fetchAllPatient() {	
		return ResponseEntity.ok(patientService.fetchAllPatient());
	}
	
	
	
	@GetMapping("/{id}") 
	public ResponseEntity<Patient> fetchById(@PathVariable("id") Long id) {
		return ResponseEntity.ok(patientService.fetchById(id));
	}
	
	
	
	@PostMapping("") 
	public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
		patient.setId(null);
		return ResponseEntity.ok(patientService.createPatient(patient));
	}
	
	
	
	@PutMapping("/{id}") 
	public ResponseEntity<Patient> updatePatient(@PathVariable("id") Long id, @RequestBody Patient patient) {
		
		Patient patObj = patientService.fetchById(id);
		if(patObj!=null) {
			patObj.setFirstName(patient.getFirstName());
			patObj.setLastName(patient.getLastName());
			patObj.setDateOfBirth(patient.getDateOfBirth());
			patObj.setEmail(patient.getEmail());
			patObj.setPhone(patient.getPhone());
			patObj.setAddress(patient.getAddress());
			patObj.setGender(patient.getGender());
			patObj.setFiscalCode(patient.getFiscalCode());
		}
		return ResponseEntity.ok(patientService.updatePatient(patObj));
	}
	
	
	
	@DeleteMapping("{id}") 
	public ResponseEntity<Map<String, String>> deletePatient(@PathVariable("id") Long id) {	
		Patient patObj = patientService.fetchById(id);
		String deleteMsg = null;
		if(patObj!=null) {
			deleteMsg =	patientService.deletePatient(patObj);
		}
	    Map<String, String> response = new HashMap<>();
	    response.put("message", deleteMsg);
	    return ResponseEntity.ok(response);
	}
	
}
