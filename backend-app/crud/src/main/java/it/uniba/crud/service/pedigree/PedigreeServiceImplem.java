package it.uniba.crud.service.pedigree;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import it.uniba.crud.dto.pedigree.PedigreeRequestDTO;
import it.uniba.crud.dto.pedigree.PedigreeResponseDTO;
import it.uniba.crud.entity.Pedigree;
import it.uniba.crud.exception.CreatedByUserNotFoundException;
import it.uniba.crud.exception.ModifiedByUserNotFoundException;
import it.uniba.crud.entity.Patient;
import it.uniba.crud.repository.pedigree.PedigreeRepository;
import it.uniba.crud.service.PatientService;
import it.uniba.crud.service.UserService;

@Service
public class PedigreeServiceImplem implements PedigreeService{

	@Autowired
	private PedigreeRepository pedigreeRepository;
	
	@Autowired
	private PatientService patientService;
	
	@Autowired
	private UserService userService;
	
	
    /**
     * Verifica se esiste un pedigree per un dato patientId.
     */
	public boolean existsByPatientId(Long patientId) {
		return pedigreeRepository.existsByPatientId(patientId);
	}
	
	
	
    /**
     * Recupera il pedigree (se esiste) e lo mappa su ResponseDto.
     */
	public Optional<PedigreeResponseDTO> getByPatientId(Long patientId) {
		/*
		 * potrei magari prima verificare se esiste e poi lo recupero, o cmq sia
		 * posso verificare se esite perchè ritorna un optional quindi se poi è vuoto
		 * allora potrei dire vedi che non esiste alcun pedigree per quel paziente, 
		 * se invece è avvalorato l'Optional significa che ha trovato un pedigree il cui
		 * patientID è quello preso in input.
		 * */
		return pedigreeRepository.findByPatientId(patientId)
				.map(this::toResponseDto);
		
	}
	
	
	
    /**
     * Crea o aggiorna il pedigree dal RequestDto e restituisce il ResponseDto.
     */
    public PedigreeResponseDTO saveOrUpdate(PedigreeRequestDTO pedigreeRequest) {
    	
        Patient patient = patientService.fetchById(pedigreeRequest.getPatientId());
        Optional<Pedigree> optionalPedigree = pedigreeRepository.findByPatientId(pedigreeRequest.getPatientId());
        Pedigree pedigree;
        
        if(optionalPedigree.isEmpty()) { // se entro in quest'if significa che non esiste già un pedigree per il paziente allora ne creiamo uno nuovo
            
            if (userService.getUserById(pedigreeRequest.getCreatedBy()).isEmpty()) { //controlliamo prima che l'id dello user che vuole creare il pedigree sia effettivamente un id valido salvato nel db
                throw new CreatedByUserNotFoundException(pedigreeRequest.getCreatedBy());
            }
            
            pedigree = new Pedigree();
            pedigree.setPatient(patient);
            pedigree.setCreatedBy(pedigreeRequest.getCreatedBy());
            pedigree.setCreatedAt(LocalDateTime.now());
            pedigree.setLastModifiedBy(pedigreeRequest.getCreatedBy()); // solo nel caso della creazione, l'id dell'utente che lo crea va messo sia nel campo createdBy che nel campo lastModifiedBy
            pedigree.setLastModified(LocalDateTime.now());
            
        } else { // se entro nell'else significa che è già presente un pedigree associato al paziente, perciò non devo crearne uno nuovo, ma recuperare e poi modificare quello esistente
        	
            if (userService.getUserById(pedigreeRequest.getModifiedBy()).isEmpty()) {//controlliamo prima che l'id dello user che vuole modificare il pedigree sia effettivamente un id valido salvato nel db
                throw new ModifiedByUserNotFoundException(pedigreeRequest.getModifiedBy());
            }
            
            pedigree = optionalPedigree.get();
            pedigree.setLastModifiedBy(pedigreeRequest.getModifiedBy());
            pedigree.setLastModified(LocalDateTime.now());
        }
        
        pedigree.setData(pedigreeRequest.getData().toString());
        
        Pedigree saved = pedigreeRepository.save(pedigree);
        
        return toResponseDto(saved);
    }
    
    
	
    private PedigreeResponseDTO toResponseDto(Pedigree p) {
    	ObjectMapper objectMapper = new ObjectMapper();
    	JsonNode jsonNode = null;
        try {
            jsonNode = objectMapper.readTree(p.getData());
        } catch (JsonProcessingException e) {
            // gestisci l'errore
        }
    	
        return PedigreeResponseDTO.builder()
            .id(p.getId())
            .patientId(p.getPatient().getId())
            .patientName(p.getPatient().getLastName() + " " + p.getPatient().getFirstName())
            .data(jsonNode)
            .createdBy(p.getCreatedBy())
            .lastModifiedBy(p.getLastModifiedBy())
            .createdAt(p.getCreatedAt())
            .lastModified(p.getLastModified())
            .build();
    }
}
