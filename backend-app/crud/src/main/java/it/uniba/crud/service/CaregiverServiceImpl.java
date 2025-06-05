package it.uniba.crud.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import it.uniba.crud.dto.CaregiverDTO;
import it.uniba.crud.entity.Caregiver;
import it.uniba.crud.repository.CaregiverRepository;

@Service
public class CaregiverServiceImpl implements CaregiverService {

    @Autowired
    private CaregiverRepository caregiverRepository;

    
    
    
    @Override
    @Transactional(readOnly = true)
    public List<Caregiver> fetchAllCaregiver() {
        return (List<Caregiver>) caregiverRepository.findAll();
    }

    
    
    
    @Override
    @Transactional(readOnly = true)
    public Caregiver fetchById(Long id) {
        return caregiverRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Caregiver not found with id: " + id));
    }

    
    
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Caregiver> fetchByIdSafe(Long id) {
        return caregiverRepository.findById(id);
    }

    
    
    
    @Override
    @Transactional
    public Caregiver createCaregiver(CaregiverDTO caregiverDTO) {
        // Controllo duplicati codice fiscale
        if (caregiverRepository.existsByFiscalCode(caregiverDTO.getFiscalCode())) {
            throw new RuntimeException("Esiste già un Caregiver con questo codice fiscale.");
        }

        Caregiver caregiver = Caregiver.builder()
            .firstName(caregiverDTO.getFirstName())
            .lastName(caregiverDTO.getLastName())
            .email(caregiverDTO.getEmail())
            .phone(caregiverDTO.getPhone())
            .address(caregiverDTO.getAddress())
            .dateOfBirth(caregiverDTO.getDateOfBirth())
            .fiscalCode(caregiverDTO.getFiscalCode())
            .gender(caregiverDTO.getGender())
            .build();

        return caregiverRepository.save(caregiver);
    }
    
    
    
    @Override
    @Transactional
    public Caregiver updateCaregiver(Long id, CaregiverDTO caregiverDTO) {
        Caregiver existingCaregiver = fetchById(id);

        // Aggiorno i campi
        existingCaregiver.setFirstName(caregiverDTO.getFirstName());
        existingCaregiver.setLastName(caregiverDTO.getLastName());
        existingCaregiver.setEmail(caregiverDTO.getEmail());
        existingCaregiver.setPhone(caregiverDTO.getPhone());
        existingCaregiver.setAddress(caregiverDTO.getAddress());
        existingCaregiver.setDateOfBirth(caregiverDTO.getDateOfBirth());
        existingCaregiver.setFiscalCode(caregiverDTO.getFiscalCode());
        existingCaregiver.setGender(caregiverDTO.getGender());

        return caregiverRepository.save(existingCaregiver);
    }
 
    
    
    @Override
    @Transactional
    public String deleteCaregiver(Caregiver caregiver) {
        caregiverRepository.delete(caregiver);
        return "Caregiver deleted successfully with id: " + caregiver.getId();
    }
    
    
    
    @Override
    public Optional<Caregiver> findByFiscalCode(String fiscalCode) {
        return caregiverRepository.findByFiscalCode(fiscalCode);
    }
} 