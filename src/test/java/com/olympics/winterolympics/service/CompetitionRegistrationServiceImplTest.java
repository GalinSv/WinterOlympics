package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.CompetitionRegistrationDto;
import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.entity.CompetitionRegistration;
import com.olympics.winterolympics.entity.SlalomCompetition;
import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.enums.Gender;
import com.olympics.winterolympics.exception.DuplicateRegistrationException;
import com.olympics.winterolympics.exception.InvalidCompetitionException;
import com.olympics.winterolympics.repository.AthleteRepository;
import com.olympics.winterolympics.repository.CompetitionRegistrationRepository;
import com.olympics.winterolympics.repository.CompetitionRepository;
import com.olympics.winterolympics.service.impl.CompetitionRegistrationServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompetitionRegistrationServiceImplTest {

    @Mock private AthleteRepository athleteRepository;
    @Mock private CompetitionRepository competitionRepository;
    @Mock private CompetitionRegistrationRepository registrationRepository;

    @InjectMocks private CompetitionRegistrationServiceImpl service;

    @Test
    void registerAthlete_genderMismatch_isRejected() {
        stub(athlete(Gender.MALE, 25), competition(Gender.FEMALE, 18), false);

        assertThatThrownBy(() -> service.registerAthlete(dto()))
                .isInstanceOf(InvalidCompetitionException.class)
                .hasMessageContaining("gender");
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void registerAthlete_underMinimumAge_isRejected() {
        stub(athlete(Gender.MALE, 14), competition(Gender.MALE, 18), false);

        assertThatThrownBy(() -> service.registerAthlete(dto()))
                .isInstanceOf(InvalidCompetitionException.class)
                .hasMessageContaining("age");
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void registerAthlete_duplicate_isRejected() {
        stub(athlete(Gender.MALE, 25), competition(Gender.MALE, 18), true);

        assertThatThrownBy(() -> service.registerAthlete(dto()))
                .isInstanceOf(DuplicateRegistrationException.class);
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void registerAthlete_valid_isSaved() {
        stub(athlete(Gender.MALE, 25), competition(Gender.MALE, 18), false);

        service.registerAthlete(dto());

        verify(registrationRepository).save(any(CompetitionRegistration.class));
    }

    private void stub(Athlete athlete, SlalomCompetition competition, boolean duplicate) {
        when(athleteRepository.findById(1L)).thenReturn(Optional.of(athlete));
        when(competitionRepository.findById(2L)).thenReturn(Optional.of(competition));
        when(registrationRepository.existsByAthleteIdAndCompetitionId(1L, 2L))
                .thenReturn(duplicate);
    }

    private static CompetitionRegistrationDto dto() {
        CompetitionRegistrationDto dto = new CompetitionRegistrationDto();
        dto.setAthleteId(1L);
        dto.setCompetitionId(2L);
        return dto;
    }

    private static Athlete athlete(Gender gender, int age) {
        Athlete a = new Athlete();
        a.setId(1L);
        a.setName("Tester");
        a.setGender(gender);
        a.setBirthDate(LocalDate.now().minusYears(age));
        return a;
    }

    private static SlalomCompetition competition(Gender gender, int minimumAge) {
        SlalomCompetition c = new SlalomCompetition();
        c.setId(2L);
        c.setGender(gender);
        c.setMinimumAge(minimumAge);
        c.setStatus(CompetitionStatus.ACTIVE);
        c.setSecondRunQualifiedCount(30);
        return c;
    }
}
