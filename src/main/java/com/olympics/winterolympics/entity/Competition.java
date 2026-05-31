package com.olympics.winterolympics.entity;

import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.enums.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotNull
    private LocalDate date;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @NotNull
    @Min(0)
    private Integer minimumAge;

    @Enumerated(EnumType.STRING)
    private CompetitionStatus status = CompetitionStatus.DRAFT;

    @OneToMany(mappedBy = "competition")
    private List<CompetitionRegistration> registrations;
}
