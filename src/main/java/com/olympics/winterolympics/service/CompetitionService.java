package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.BiathlonCompetitionDto;
import com.olympics.winterolympics.dto.SlalomCompetitionDto;
import com.olympics.winterolympics.enums.CompetitionStatus;

import java.util.List;

public interface CompetitionService {

    SlalomCompetitionDto createSlalomCompetition(SlalomCompetitionDto dto);
    List<SlalomCompetitionDto> getAllSlalomCompetitions();
    SlalomCompetitionDto getSlalomCompetitionById(Long id);
    SlalomCompetitionDto updateSlalomCompetition(Long id, SlalomCompetitionDto dto);
    void deleteSlalomCompetition(Long id);

    BiathlonCompetitionDto createBiathlonCompetition(BiathlonCompetitionDto dto);
    List<BiathlonCompetitionDto> getAllBiathlonCompetitions();
    BiathlonCompetitionDto getBiathlonCompetitionById(Long id);
    BiathlonCompetitionDto updateBiathlonCompetition(Long id, BiathlonCompetitionDto dto);
    void deleteBiathlonCompetition(Long id);

    void setStatus(Long competitionId, CompetitionStatus status);

    void finalizeSlalomCompetition(Long competitionId);
    void finalizeBiathlonCompetition(Long competitionId);
}
