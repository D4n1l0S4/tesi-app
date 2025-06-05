package it.uniba.crud.entity;

import java.time.LocalDateTime;

//import it.uniba.crud.converter.JsonbConverter;
import jakarta.persistence.*;
import lombok.*;

@Entity											/*indica che questa classe rappresenta una tabella nel DB*/
@Table(name = "pedigree", schema = "public")	/*specifica il nome della table e dello schema nel DB a cui mappare questa classe*/
@Data											/*serve a lombok per generare automaticamente getter e setter ed altri metodi*/
@NoArgsConstructor								/*serve a lombok per creare un costruttore senza parametri*/
@AllArgsConstructor								/*serve a lombok per creare un costruttore con tutti i campi come parametri*/
@Builder										/*serve sempre a lombok per creare costruttori */
public class Pedigree {
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false, unique = true)
    private Patient patient;
    
    @Column(name = "data", columnDefinition = "jsonb", nullable = false)
    private String data;
    
    @Column(name = "created_by", nullable = false)
    private Long createdBy;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "last_modified", nullable = false)
    private LocalDateTime lastModified;
    
    @Column(name = "last_modified_by", nullable = false)
    private Long lastModifiedBy;
     
}
