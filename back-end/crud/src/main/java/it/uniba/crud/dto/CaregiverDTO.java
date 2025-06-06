package it.uniba.crud.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CaregiverDTO {

    private Long id;

    @NotBlank(message = "First name is required")
    @Size(max = 250, message = "First name must be less than 250 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 250, message = "Last name must be less than 250 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 250, message = "Email must be less than 250 characters")
    private String email;

    @NotBlank(message = "Phone is required")
    @Size(max = 20, message = "Phone must be less than 20 characters")
    private String phone;

    @NotBlank(message = "Address is required")
    @Size(max = 200, message = "Address must be less than 200 characters")
    private String address;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Fiscal code is required")
    @Size(min = 16, max = 16, message = "Fiscal code must be 16 characters long")
    @Pattern(regexp = "^[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]$", message = "Invalid fiscal code format")
    private String fiscalCode;
    
    @NotBlank(message = "Gender is required")
    @Size(min = 1, max = 1, message = "Gender must be M (maschio), F (femmina), or A (altro)")
    @Pattern(regexp = "^[MFA]$", message = "Gender must be M (maschio), F (femmina), or A (altro)")
    private String gender;
} 