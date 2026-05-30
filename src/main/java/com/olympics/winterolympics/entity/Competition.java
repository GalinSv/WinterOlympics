package com.olympics.winterolympics.entity;

import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.enums.Gender;
import jakarta.persistence.*;
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

    private String name;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private Integer minimumAge;

    @Enumerated(EnumType.STRING)
    private CompetitionStatus status = CompetitionStatus.DRAFT;

    @OneToMany(mappedBy = "competition")
    private List<CompetitionRegistration> registrations;
}
