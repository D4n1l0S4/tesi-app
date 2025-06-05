package it.uniba.crud.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;

@Data 					/*serve a lombok per generare automaticamente getter e setter ed altri metodi*/
@AllArgsConstructor		/*serve a lombok per creare un costruttore con tutti i campi come parametri*/
@NoArgsConstructor		/*serve a lombok per creare un costruttore senza parametri*/
@Builder				/*serve sempre a lombok per creare costruttori */
@Entity					/*indica che questa classe rappresenta una tabella nel DB*/
@Table(name = "patient", schema = "public") /*specifica il nome della table e dello schema nel DB a cui mappare questa classe*/

public class Patient {
		
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "first_name", length = 250, nullable = false)
	private String firstName;
	
	@Column(name = "last_name", length = 250, nullable = false)
	private String lastName;
	
	@JsonFormat(pattern = "yyyy-MM-dd")
	@Column(name = "date_of_birth", nullable = false)
	private LocalDate dateOfBirth;
	
	@Column(name = "email", length = 250)
	private String email;
	
	@Column(name = "phone", length = 20)
	private String phone;
	
	@Column(name = "address", length = 200)
	private String address;
	
    @Column(name = "gender", length = 1, nullable = false)
    private String gender; // M, F, A
    
    @Column(name = "fiscal_code", length = 16, unique = true, nullable = false)
    private String fiscalCode;
	
	// Aggiungo la relazione con i caregiver
	@JsonIgnore
	@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<PatientCaregiverAssociation> caregiverAssociations;
	
}
