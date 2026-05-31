package com.olympics.winterolympics.entity;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class BiathlonCompetition extends Competition {

    @NotNull
    @Positive
    private Integer lapCount;

    @NotNull
    @Positive
    private Integer shootingRounds;

    @NotNull
    @PositiveOrZero
    private Integer penaltySeconds;
}