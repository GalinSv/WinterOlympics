package com.olympics.winterolympics.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "registration_id")
    private CompetitionRegistration registration;

    private Double totalTime;

    private Integer finalRank;

    private Boolean finished;
}