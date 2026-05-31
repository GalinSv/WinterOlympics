package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.BiathlonResultDto;
import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.entity.BiathlonCompetition;
import com.olympics.winterolympics.entity.BiathlonResult;
import com.olympics.winterolympics.entity.Competition;
import com.olympics.winterolympics.entity.CompetitionRegistration;
import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.enums.Country;
import com.olympics.winterolympics.enums.Gender;
import com.olympics.winterolympics.repository.BiathlonResultRepository;
import com.olympics.winterolympics.repository.CompetitionRegistrationRepository;
import com.olympics.winterolympics.service.impl.BiathlonResultServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BiathlonResultServiceImplTest {

    @Mock
    private BiathlonResultRepository biathlonResultRepository;

    @Mock
    private CompetitionRegistrationRepository registrationRepository;

    @InjectMocks
    private BiathlonResultServiceImpl service;

    private final BiathlonCompetition competition = competition(1L, 60);

    @Test
    void saveResult_whenFinished_computesPenaltyAndRoundedTotalAndUpserts() {
        CompetitionRegistration registration = registration(5L, competition);
        BiathlonResult existing = new BiathlonResult();
        existing.setId(77L);
        existing.setRegistration(registration);

        when(registrationRepository.findById(5L)).thenReturn(Optional.of(registration));
        when(biathlonResultRepository.findByRegistrationId(5L)).thenReturn(Optional.of(existing));
        when(biathlonResultRepository.save(any(BiathlonResult.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BiathlonResultDto dto = service.saveResult(5L, 1200.5004, 2, true);

        ArgumentCaptor<BiathlonResult> captor = ArgumentCaptor.forClass(BiathlonResult.class);
        verify(biathlonResultRepository).save(captor.capture());
        BiathlonResult saved = captor.getValue();

        assertThat(saved.getId()).isEqualTo(77L);
        assertThat(saved.getMissedShots()).isEqualTo(2);
        assertThat(saved.getPenaltySeconds()).isEqualTo(120.0); // 2 misses * 60s
        assertThat(saved.getTotalTime()).isEqualTo(1320.5);     // 1200.5004 + 120, rounded
        assertThat(dto.getTotalTime()).isEqualTo(1320.5);
    }

    @Test
    void saveResult_whenDidNotFinish_leavesTotalTimeNull() {
        CompetitionRegistration registration = registration(6L, competition);

        when(registrationRepository.findById(6L)).thenReturn(Optional.of(registration));
        when(biathlonResultRepository.findByRegistrationId(6L)).thenReturn(Optional.empty());
        when(biathlonResultRepository.save(any(BiathlonResult.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BiathlonResultDto dto = service.saveResult(6L, 1300.0, 1, false);

        assertThat(dto.getTotalTime()).isNull();
        assertThat(dto.getPenaltySeconds()).isEqualTo(60.0);
    }

    @Test
    void calculateRanking_ordersByTotalTimeExcludingDnf() {
        BiathlonResult slower = ranked(1L, 1400.0, true);
        BiathlonResult faster = ranked(2L, 1350.0, true);
        BiathlonResult dnf = ranked(3L, null, false);

        when(biathlonResultRepository.findAll())
                .thenReturn(List.of(slower, faster, dnf));

        List<BiathlonResultDto> ranking = service.calculateRanking(1L);

        assertThat(ranking).hasSize(2);
        assertThat(ranking.get(0).getTotalTime()).isEqualTo(1350.0);
        assertThat(ranking.get(0).getFinalRank()).isEqualTo(1);
        assertThat(ranking.get(1).getFinalRank()).isEqualTo(2);
    }

    private static BiathlonCompetition competition(Long id, int penaltySeconds) {
        BiathlonCompetition c = new BiathlonCompetition();
        c.setId(id);
        c.setStatus(CompetitionStatus.ACTIVE);
        c.setGender(Gender.MALE);
        c.setLapCount(4);
        c.setShootingRounds(2);
        c.setPenaltySeconds(penaltySeconds);
        return c;
    }

    private static CompetitionRegistration registration(Long id, Competition competition) {
        Athlete athlete = new Athlete();
        athlete.setName("Athlete " + id);
        athlete.setCountry(Country.NORWAY);
        athlete.setGender(Gender.MALE);
        athlete.setBirthDate(LocalDate.of(1994, 6, 1));

        CompetitionRegistration registration = new CompetitionRegistration();
        registration.setId(id);
        registration.setAthlete(athlete);
        registration.setCompetition(competition);
        return registration;
    }

    private BiathlonResult ranked(Long id, Double totalTime, boolean finished) {
        BiathlonResult result = new BiathlonResult();
        result.setId(id);
        result.setRegistration(registration(id, competition));
        result.setSkiingTime(totalTime);
        result.setMissedShots(0);
        result.setPenaltySeconds(0.0);
        result.setTotalTime(totalTime);
        result.setFinished(finished);
        return result;
    }
}
