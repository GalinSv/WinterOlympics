package com.olympics.winterolympics.entity;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class SlalomCompetition extends Competition {

    private Integer secondRunQualifiedCount;
}