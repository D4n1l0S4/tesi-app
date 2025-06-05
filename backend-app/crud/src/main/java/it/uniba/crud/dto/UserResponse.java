package it.uniba.crud.dto;

import java.time.LocalDate;

/**
 * classe che viene utilizzata nel corpo di chiamate http 
 * per metodi come getUser oppure getAllUsers
 */
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDate dataBirth;
    private String address;
    private String phone;

    // Costruttore
    public UserResponse(Long id, String username, String email, String firstName, String lastName, LocalDate dataBirth, String address, String phone) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.setDataBirth(dataBirth);
        this.setAddress(address);
        this.setPhone(phone);
    }
    
    // Getter e Setter
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getfirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }
    
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

	public LocalDate getDataBirth() {
		return dataBirth;
	}

	public void setDataBirth(LocalDate dataBirth) {
		this.dataBirth = dataBirth;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}
}
