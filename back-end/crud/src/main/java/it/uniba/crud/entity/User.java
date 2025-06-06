package it.uniba.crud.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
//import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

@Entity									 /*indica che questa classe rappresenta una tabella nel DB*/
@Table(name = "users", schema = "public") /*specifica il nome della table e dello schema nel DB a cui mappare questa classe*/
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 250)
    private String username;

    @Column(nullable = false, length = 250)
    private String password;

    @Column(nullable = false, length = 250)
    private String email;

    @Column(name = "first_name", nullable = false, length = 250)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 250)
    private String lastName;

    @Column(name = "date_of_birth")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateBirth;

    @Column(name = "address", length = 200)
    private String address;

    @Column(nullable = false, length = 20)
    private String phone;

    // Costruttori
    public User() {}

    public User(String username, String password, String email, String firstName, String lastName, String phone) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
    }
    
    public User(String username, String password, String email, String firstName, String lastName, LocalDate date_of_birth, String address, String phone) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateBirth = date_of_birth;
        this.address = address;
        this.phone = phone;
    }


    // Getter e Setter
    public Long getId() { return this.id; }

    public void setId(Long id) { this.id = id; }

    public String getUsername() { return this.username; }

    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return this.password; }

    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return this.email; }

    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return this.firstName; }

    public void setFirstName(String nome) { this.firstName = nome; }

    public String getLastName() { return this.lastName; }

    public void setLastName(String cognome) { this.lastName = cognome; }

    public LocalDate getDataBirth() { return this.dateBirth; }

    public void setDataBirth(LocalDate date_of_birth) { this.dateBirth = date_of_birth; }

    public String getAddress() { return this.address; }

    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return this.phone; }

    public void setPhone(String phone) { this.phone = phone; }
}
