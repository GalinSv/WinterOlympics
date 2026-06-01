package com.olympics.winterolympics.service.impl;

import com.olympics.winterolympics.dto.BiathlonCompetitionDto;
import com.olympics.winterolympics.dto.SlalomCompetitionDto;
import com.olympics.winterolympics.entity.BiathlonCompetition;
import com.olympics.winterolympics.entity.Competition;
import com.olympics.winterolympics.entity.SlalomCompetition;
import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.exception.CompetitionLockedException;
import com.olympics.winterolympics.exception.ResourceNotFoundException;
import com.olympics.winterolympics.repository.BiathlonResultRepository;
import com.olympics.winterolympics.repository.CompetitionRegistrationRepository;
import com.olympics.winterolympics.repository.CompetitionRepository;
import com.olympics.winterolympics.repository.MedalResultRepository;
import com.olympics.winterolympics.repository.SlalomResultRepository;
import com.olympics.winterolympics.service.CompetitionService;
import com.olympics.winterolympics.service.MedalResultService;
import com.olympics.winterolympics.service.SlalomResultService;
import com.olympics.winterolympics.service.BiathlonResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompetitionServiceImpl implements CompetitionService {

    private final CompetitionRepository competitionRepository;
    private final CompetitionRegistrationRepository registrationRepository;
    private final SlalomResultRepository slalomResultRepository;
    private final BiathlonResultRepository biathlonResultRepository;
    private final MedalResultRepository medalResultRepository;
    private final MedalResultService medalResultService;
    @Lazy
    private final SlalomResultService slalomResultService;
    @Lazy
    private final BiathlonResultService biathlonResultService;

    @Override
    public SlalomCompetitionDto createSlalomCompetition(SlalomCompetitionDto dto) {
        SlalomCompetition competition = new SlalomCompetition();
        if (dto.getStatus() == null) competition.setStatus(CompetitionStatus.DRAFT);
        mapSlalomDtoToEntity(dto, competition);
        competitionRepository.save(competition);
        return mapSlalomEntityToDto(competition);
    }

    @Override
    public List<SlalomCompetitionDto> getAllSlalomCompetitions() {
        return competitionRepository.findAll().stream()
                .filter(c -> c instanceof SlalomCompetition)
                .map(c -> mapSlalomEntityToDto((SlalomCompetition) c))
                .toList();
    }

    @Override
    public SlalomCompetitionDto getSlalomCompetitionById(Long id) {
        SlalomCompetition competition = (SlalomCompetition) competitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slalom competition not found"));
        return mapSlalomEntityToDto(competition);
    }

    @Override
    public SlalomCompetitionDto updateSlalomCompetition(Long id, SlalomCompetitionDto dto) {
        SlalomCompetition competition = (SlalomCompetition) competitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slalom competition not found"));
        assertEditable(competition);
        competition.setName(dto.getName());
        competition.setDate(dto.getDate());
        competition.setSecondRunQualifiedCount(dto.getSecondRunQualifiedCount());
        competitionRepository.save(competition);
        return mapSlalomEntityToDto(competition);
    }

    @Override
    @Transactional
    public void deleteSlalomCompetition(Long id) {
        cascadeDelete(id);
    }

    @Override
    public BiathlonCompetitionDto createBiathlonCompetition(BiathlonCompetitionDto dto) {
        BiathlonCompetition competition = new BiathlonCompetition();
        if (dto.getStatus() == null) competition.setStatus(CompetitionStatus.DRAFT);
        mapBiathlonDtoToEntity(dto, competition);
        competitionRepository.save(competition);
        return mapBiathlonEntityToDto(competition);
    }

    @Override
    public List<BiathlonCompetitionDto> getAllBiathlonCompetitions() {
        return competitionRepository.findAll().stream()
                .filter(c -> c instanceof BiathlonCompetition)
                .map(c -> mapBiathlonEntityToDto((BiathlonCompetition) c))
                .toList();
    }

    @Override
    public BiathlonCompetitionDto getBiathlonCompetitionById(Long id) {
        BiathlonCompetition competition = (BiathlonCompetition) competitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Biathlon competition not found"));
        return mapBiathlonEntityToDto(competition);
    }

    @Override
    public BiathlonCompetitionDto updateBiathlonCompetition(Long id, BiathlonCompetitionDto dto) {
        BiathlonCompetition competition = (BiathlonCompetition) competitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Biathlon competition not found"));
        assertEditable(competition);
        competition.setName(dto.getName());
        competition.setDate(dto.getDate());
        competition.setLapCount(dto.getLapCount());
        competition.setShootingRounds(dto.getShootingRounds());
        competition.setPenaltySeconds(dto.getPenaltySeconds());
        competitionRepository.save(competition);
        return mapBiathlonEntityToDto(competition);
    }

    @Override
    @Transactional
    public void deleteBiathlonCompetition(Long id) {
        cascadeDelete(id);
    }

    private void cascadeDelete(Long competitionId) {
        medalResultRepository.deleteByCompetitionId(competitionId);
        slalomResultRepository.deleteAll(
                slalomResultRepository.findByRegistrationCompetitionId(competitionId));
        biathlonResultRepository.deleteAll(
                biathlonResultRepository.findByRegistrationCompetitionId(competitionId));
        registrationRepository.deleteAll(
                registrationRepository.findByCompetitionId(competitionId));
        competitionRepository.deleteById(competitionId);
    }

    @Override
    public void setStatus(Long competitionId, CompetitionStatus status) {
        Competition c = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Competition not found"));
        c.setStatus(status);
        competitionRepository.save(c);
    }

    @Override
    @Transactional
    public void finalizeSlalomCompetition(Long competitionId) {
        Competition c = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Competition not found"));
        if (c.getStatus() == CompetitionStatus.FINISHED) return;
        slalomResultService.calculateFinalRanking(competitionId);
        medalResultService.assignSlalomMedals(competitionId);
        c.setStatus(CompetitionStatus.FINISHED);
        competitionRepository.save(c);
    }

    @Override
    @Transactional
    public void finalizeBiathlonCompetition(Long competitionId) {
        Competition c = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Competition not found"));
        if (c.getStatus() == CompetitionStatus.FINISHED) return;
        biathlonResultService.calculateRanking(competitionId);
        medalResultService.assignBiathlonMedals(competitionId);
        c.setStatus(CompetitionStatus.FINISHED);
        competitionRepository.save(c);
    }

    private void assertEditable(Competition competition) {
        if (competition.getStatus() != CompetitionStatus.DRAFT) {
            throw new CompetitionLockedException(
                    "Competition can no longer be edited once results have started.");
        }
    }

    private void mapSlalomDtoToEntity(SlalomCompetitionDto dto, SlalomCompetition c) {
        c.setName(dto.getName());
        c.setDate(dto.getDate());
        c.setGender(dto.getGender());
        c.setMinimumAge(dto.getMinimumAge());
        c.setSecondRunQualifiedCount(dto.getSecondRunQualifiedCount());
        if (dto.getStatus() != null) c.setStatus(dto.getStatus());
    }

    private SlalomCompetitionDto mapSlalomEntityToDto(SlalomCompetition c) {
        SlalomCompetitionDto dto = new SlalomCompetitionDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDate(c.getDate());
        dto.setGender(c.getGender());
        dto.setMinimumAge(c.getMinimumAge());
        dto.setStatus(c.getStatus());
        dto.setSecondRunQualifiedCount(c.getSecondRunQualifiedCount());
        return dto;
    }

    private void mapBiathlonDtoToEntity(BiathlonCompetitionDto dto, BiathlonCompetition c) {
        c.setName(dto.getName());
        c.setDate(dto.getDate());
        c.setGender(dto.getGender());
        c.setMinimumAge(dto.getMinimumAge());
        c.setLapCount(dto.getLapCount());
        c.setShootingRounds(dto.getShootingRounds());
        c.setPenaltySeconds(dto.getPenaltySeconds());
        if (dto.getStatus() != null) c.setStatus(dto.getStatus());
    }

    private BiathlonCompetitionDto mapBiathlonEntityToDto(BiathlonCompetition c) {
        BiathlonCompetitionDto dto = new BiathlonCompetitionDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDate(c.getDate());
        dto.setGender(c.getGender());
        dto.setMinimumAge(c.getMinimumAge());
        dto.setStatus(c.getStatus());
        dto.setLapCount(c.getLapCount());
        dto.setShootingRounds(c.getShootingRounds());
        dto.setPenaltySeconds(c.getPenaltySeconds());
        return dto;
    }
}
