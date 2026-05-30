package com.olympics.winterolympics.entity;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class BiathlonResult extends Result {

    private Double skiingTime;

    private Integer missedShots;

    private Double penaltySeconds;
}