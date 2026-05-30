package com.olympics.winterolympics.entity;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class BiathlonCompetition extends Competition {

    private Integer lapCount;

    private Integer shootingRounds;

    private Integer penaltySeconds;
}