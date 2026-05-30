package com.olympics.winterolympics.entity;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class SlalomResult extends Result {

    private Double firstRunTime;

    private Double secondRunTime;

    private Boolean qualifiedForSecondRun;

    private Integer secondRunStartOrder;
}
