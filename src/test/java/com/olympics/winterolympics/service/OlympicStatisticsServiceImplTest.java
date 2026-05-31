package com.olympics.winterolympics.service;

import com.olympics.winterolympics.dto.OlympicStatisticsDto;
import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.entity.MedalResult;
import com.olympics.winterolympics.enums.Country;
import com.olympics.winterolympics.enums.Medal;
import com.olympics.winterolympics.repository.AthleteRepository;
import com.olympics.winterolympics.repository.MedalResultRepository;
import com.olympics.winterolympics.service.impl.OlympicStatisticsServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OlympicStatisticsServiceImplTest {

    @Mock
    private MedalResultRepository medalResultRepository;

    @Mock
    private AthleteRepository athleteRepository;

    @InjectMocks
    private OlympicStatisticsServiceImpl service;

    @Test
    void getStatistics_aggregatesMedalsCountsAndMedalistAges() {
        Athlete youngest = athlete("Young", Country.BULGARIA, LocalDate.of(2002, 1, 1));
        Athlete middle = athlete("Middle", Country.GERMANY, LocalDate.of(1995, 1, 1));
        Athlete oldest = athlete("Old", Country.BULGARIA, LocalDate.of(1986, 1, 1));

        when(medalResultRepository.findAll()).thenReturn(List.of(
                medal(youngest, Medal.GOLD),
                medal(middle, Medal.SILVER),
                medal(oldest, Medal.BRONZE)
        ));
        when(athleteRepository.findAll()).thenReturn(List.of(youngest, middle, oldest));

        OlympicStatisticsDto dto = service.getStatistics();

        assertThat(dto.getMedalsByCountry())
                .containsEntry("BULGARIA", 2L)
                .containsEntry("GERMANY", 1L);
        assertThat(dto.getTotalGold()).isEqualTo(1);
        assertThat(dto.getTotalSilver()).isEqualTo(1);
        assertThat(dto.getTotalBronze()).isEqualTo(1);

        assertThat(dto.getYoungestMedalist()).isEqualTo("Young");
        assertThat(dto.getOldestMedalist()).isEqualTo("Old");
        assertThat(dto.getYoungestMedalistAge())
                .isLessThan(dto.getOldestMedalistAge());
        assertThat(dto.getAverageAthleteAge()).isGreaterThan(0.0);
    }

    private static Athlete athlete(String name, Country country, LocalDate birthDate) {
        Athlete athlete = new Athlete();
        athlete.setName(name);
        athlete.setCountry(country);
        athlete.setBirthDate(birthDate);
        return athlete;
    }

    private static MedalResult medal(Athlete athlete, Medal medal) {
        MedalResult result = new MedalResult();
        result.setAthlete(athlete);
        result.setMedal(medal);
        return result;
    }
}
