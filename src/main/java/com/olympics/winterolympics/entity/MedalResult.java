package com.olympics.winterolympics.entity;

import com.olympics.winterolympics.enums.Medal;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class MedalResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Medal medal;

    @ManyToOne
    @JoinColumn(name = "athlete_id")
    private Athlete athlete;

    @ManyToOne
    @JoinColumn(name = "competition_id")
    private Competition competition;
}