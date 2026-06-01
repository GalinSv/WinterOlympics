package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.SlalomResultDto;
import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.entity.Competition;
import com.olympics.winterolympics.entity.CompetitionRegistration;
import com.olympics.winterolympics.entity.SlalomCompetition;
import com.olympics.winterolympics.entity.SlalomResult;
import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.enums.Country;
import com.olympics.winterolympics.enums.Gender;
import com.olympics.winterolympics.repository.CompetitionRegistrationRepository;
import com.olympics.winterolympics.repository.SlalomResultRepository;
import com.olympics.winterolympics.service.impl.SlalomResultServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SlalomResultServiceImplTest {

    @Mock
    private SlalomResultRepository slalomResultRepository;

    @Mock
    private CompetitionRegistrationRepository registrationRepository;

    @InjectMocks
    private SlalomResultServiceImpl service;

    private final SlalomCompetition competition = competition(1L, 2);

    @Test
    void saveFirstRunTime_updatesExistingResultInPlaceAndRoundsToMillis() {
        CompetitionRegistration registration = registration(10L, competition);
        SlalomResult existing = new SlalomResult();
        existing.setId(99L);
        existing.setRegistration(registration);

        when(registrationRepository.findById(10L)).thenReturn(Optional.of(registration));
        when(slalomResultRepository.findByRegistrationId(10L)).thenReturn(Optional.of(existing));
        when(slalomResultRepository.save(any(SlalomResult.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SlalomResultDto dto = service.saveFirstRunTime(10L, 50.123456, true);

        ArgumentCaptor<SlalomResult> captor = ArgumentCaptor.forClass(SlalomResult.class);
        verify(slalomResultRepository).save(captor.capture());
        SlalomResult saved = captor.getValue();

        assertThat(saved.getId()).isEqualTo(99L);
        assertThat(saved.getFirstRunTime()).isEqualTo(50.123);
        assertThat(dto.getFirstRunTime()).isEqualTo(50.123);
    }

    @Test
    void calculateQualifiedAthletes_withNoResults_returnsEmptyAndDoesNotPersist() {
        when(slalomResultRepository.findByRegistrationCompetitionId(1L))
                .thenReturn(new ArrayList<>());

        List<SlalomResultDto> result = service.calculateQualifiedAthletes(1L);

        assertThat(result).isEmpty();
        verify(slalomResultRepository, never()).saveAll(any());
    }

    @Test
    void calculateQualifiedAthletes_assignsSecondRunStartOrderSlowestFirst() {
        SlalomResult fast = result(1L, competition, 50.0, true);
        SlalomResult middle = result(2L, competition, 55.0, true);
        SlalomResult slowExtra = result(3L, competition, 60.0, true);
        SlalomResult dnf = result(4L, competition, 48.0, false);

        when(slalomResultRepository.findByRegistrationCompetitionId(1L))
                .thenReturn(new ArrayList<>(List.of(fast, middle, slowExtra, dnf)));

        List<SlalomResultDto> qualified = service.calculateQualifiedAthletes(1L);

        assertThat(fast.getQualifiedForSecondRun()).isTrue();
        assertThat(middle.getQualifiedForSecondRun()).isTrue();
        assertThat(slowExtra.getQualifiedForSecondRun()).isFalse();
        assertThat(dnf.getQualifiedForSecondRun()).isFalse();

        assertThat(middle.getSecondRunStartOrder()).isEqualTo(1);
        assertThat(fast.getSecondRunStartOrder()).isEqualTo(2);

        assertThat(qualified).hasSize(2);
        assertThat(qualified.get(0).getFirstRunTime()).isEqualTo(55.0);
    }

    @Test
    void calculateFinalRanking_ranksByTotalTimeAndExcludesDnfAndIncomplete() {
        SlalomResult slower = ranked(1L, competition, 100.0, true);
        SlalomResult faster = ranked(2L, competition, 95.0, true);
        SlalomResult incomplete = ranked(3L, competition, null, true);
        SlalomResult dnf = ranked(4L, competition, 90.0, false);

        when(slalomResultRepository.findAll())
                .thenReturn(List.of(slower, faster, incomplete, dnf));

        List<SlalomResultDto> ranking = service.calculateFinalRanking(1L);

        assertThat(ranking).hasSize(2);
        assertThat(ranking.get(0).getTotalTime()).isEqualTo(95.0);
        assertThat(ranking.get(0).getFinalRank()).isEqualTo(1);
        assertThat(ranking.get(1).getTotalTime()).isEqualTo(100.0);
        assertThat(ranking.get(1).getFinalRank()).isEqualTo(2);
        assertThat(faster.getFinalRank()).isEqualTo(1);
    }

    private static SlalomCompetition competition(Long id, int qualifiedCount) {
        SlalomCompetition c = new SlalomCompetition();
        c.setId(id);
        c.setStatus(CompetitionStatus.ACTIVE);
        c.setGender(Gender.MALE);
        c.setSecondRunQualifiedCount(qualifiedCount);
        return c;
    }

    private static CompetitionRegistration registration(Long id, Competition competition) {
        Athlete athlete = new Athlete();
        athlete.setName("Athlete " + id);
        athlete.setCountry(Country.BULGARIA);
        athlete.setGender(Gender.MALE);
        athlete.setBirthDate(LocalDate.of(1995, 1, 1));

        CompetitionRegistration registration = new CompetitionRegistration();
        registration.setId(id);
        registration.setAthlete(athlete);
        registration.setCompetition(competition);
        return registration;
    }

    private static SlalomResult result(Long id, Competition competition,
                                       Double firstRunTime, boolean finished) {
        SlalomResult result = new SlalomResult();
        result.setId(id);
        result.setRegistration(registration(id, competition));
        result.setFirstRunTime(firstRunTime);
        result.setFinished(finished);
        return result;
    }

    private static SlalomResult ranked(Long id, Competition competition,
                                       Double totalTime, boolean finished) {
        SlalomResult result = result(id, competition, 0.0, finished);
        result.setTotalTime(totalTime);
        return result;
    }
}
