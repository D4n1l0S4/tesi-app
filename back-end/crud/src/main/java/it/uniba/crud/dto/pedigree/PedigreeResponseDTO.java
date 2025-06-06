package it.uniba.crud.dto.pedigree;

import java.time.LocalDateTime;
import lombok.*;
import com.fasterxml.jackson.databind.JsonNode;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedigreeResponseDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private JsonNode  data;
    private Long createdBy;
    private Long lastModifiedBy;
    private LocalDateTime createdAt;	//data + ora
    private LocalDateTime lastModified;
}
