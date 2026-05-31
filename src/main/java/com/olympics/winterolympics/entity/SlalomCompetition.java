package com.olympics.winterolympics.entity;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class SlalomCompetition extends Competition {

    @NotNull
    @Positive
    private Integer secondRunQualifiedCount;
}