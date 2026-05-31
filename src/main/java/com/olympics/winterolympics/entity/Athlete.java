package com.olympics.winterolympics.entity;

import com.olympics.winterolympics.enums.Country;
import com.olympics.winterolympics.enums.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
public class Athlete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Email
    private String email;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Country country;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Past
    private LocalDate birthDate;

    @Column(unique = true)
    private String username;

    @OneToMany(mappedBy = "athlete")
    private List<CompetitionRegistration> registrations;
}
