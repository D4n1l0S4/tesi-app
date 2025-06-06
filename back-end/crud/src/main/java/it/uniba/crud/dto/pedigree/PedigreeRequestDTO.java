// it.uniba.crud.dto.PedigreeRequestDto.java
package it.uniba.crud.dto.pedigree;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedigreeRequestDTO {
    @NotNull
    private Long patientId;

    @NotNull
    private JsonNode data;       // JSON serializzato da PedigreeJS

    @NotNull
    private Long createdBy;    // chi lo ha creato
    
    @NotNull
    private Long modifiedBy;   // ID utente che sta salvando/modificando
    
}
