package com.olympics.winterolympics.entity;

import com.olympics.winterolympics.enums.Country;
import com.olympics.winterolympics.enums.Gender;
import jakarta.persistence.*;
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

    private String name;

    private String email;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Country country;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate birthDate;

    /** Keycloak username (preferred_username) that owns this athlete profile. */
    @Column(unique = true)
    private String username;

    @OneToMany(mappedBy = "athlete")
    private List<CompetitionRegistration> registrations;
}
