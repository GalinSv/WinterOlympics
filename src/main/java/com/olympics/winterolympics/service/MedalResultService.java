package com.olympics.winterolympics.service;

public interface MedalResultService {

    void assignSlalomMedals(Long competitionId);

    void assignBiathlonMedals(Long competitionId);
}