package it.uniba.crud.entity;

import java.time.LocalDate;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "caregiver", schema = "public")
public class Caregiver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", length = 250, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 250, nullable = false)
    private String lastName;

    @Column(name = "email", length = 250, nullable = false, unique = true)
    private String email;

    @Column(name = "phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "address", length = 200, nullable = false)
    private String address;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "fiscal_code", length = 16, nullable = false, unique = true)
    private String fiscalCode;
    
    @Column(name = "gender", length = 1, nullable = false)
    private String gender; // M, F, A

    // Utilizzeremo una relazione many-to-many con una tabella di associazione
    @JsonIgnore
    @OneToMany(mappedBy = "caregiver", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PatientCaregiverAssociation> patientAssociations;

    // Aggiungo un metodo per la validazione del codice fiscale
    private boolean isValidFiscalCode(String fiscalCode) {
        // Implementazione base di validazione del codice fiscale
        if (fiscalCode == null || fiscalCode.length() != 16) {
            return false;
        }
        
        // Regex base per il codice fiscale italiano
        return fiscalCode.matches("^[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]$");
    }
} 