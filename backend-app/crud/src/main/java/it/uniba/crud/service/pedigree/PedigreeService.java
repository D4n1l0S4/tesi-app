package it.uniba.crud.service.pedigree;

import java.util.Optional;

import it.uniba.crud.dto.pedigree.PedigreeRequestDTO;
import it.uniba.crud.dto.pedigree.PedigreeResponseDTO;

public interface PedigreeService {
    boolean existsByPatientId(Long patientId);
    Optional<PedigreeResponseDTO> getByPatientId(Long patientId);
    PedigreeResponseDTO saveOrUpdate(PedigreeRequestDTO pedigreeRequest);
}
