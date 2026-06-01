package com.olympics.winterolympics.integration;

import com.olympics.winterolympics.dto.SlalomCompetitionDto;
import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.enums.CompetitionStatus;
import com.olympics.winterolympics.enums.Country;
import com.olympics.winterolympics.enums.Gender;
import com.olympics.winterolympics.repository.AthleteRepository;
import com.olympics.winterolympics.repository.MedalResultRepository;
import com.olympics.winterolympics.repository.SlalomResultRepository;
import com.olympics.winterolympics.service.CompetitionService;
import com.olympics.winterolympics.service.DemoCompetitionService;
import com.olympics.winterolympics.service.OlympicStatisticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;


@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OlympicDemoFlowIntegrationTest {

    @Autowired private AthleteRepository athleteRepository;
    @Autowired private CompetitionService competitionService;
    @Autowired private DemoCompetitionService demoService;
    @Autowired private SlalomResultRepository slalomResultRepository;
    @Autowired private MedalResultRepository medalResultRepository;
    @Autowired private OlympicStatisticsService statisticsService;

    @Test
    void slalomDemo_runsFullPipelineAndAwardsThreeMedals() {
        for (int i = 0; i < 14; i++) {
            Athlete a = new Athlete();
            a.setName("Racer " + i);
            a.setEmail("racer" + i + "@test.local");
            a.setGender(Gender.MALE);
            a.setCountry(Country.BULGARIA);
            a.setBirthDate(LocalDate.of(1996, 1, 1));
            athleteRepository.save(a);
        }

        SlalomCompetitionDto dto = new SlalomCompetitionDto();
        dto.setName("Integration Slalom");
        dto.setDate(LocalDate.now().plusDays(7));
        dto.setGender(Gender.MALE);
        dto.setMinimumAge(16);
        dto.setSecondRunQualifiedCount(5);
        Long competitionId = competitionService.createSlalomCompetition(dto).getId();

        demoService.runSlalomDemo(competitionId);

        assertThat(competitionService.getSlalomCompetitionById(competitionId).getStatus())
                .isEqualTo(CompetitionStatus.FINISHED);

        var results =
                slalomResultRepository.findByRegistrationCompetitionId(competitionId);
        assertThat(results).isNotEmpty();
        assertThat(results.stream().anyMatch(r -> r.getFinalRank() != null)).isTrue();

        assertThat(medalResultRepository.findByCompetitionId(competitionId)).hasSize(3);
        var stats = statisticsService.getStatistics();
        assertThat(stats.getTotalGold()).isEqualTo(1L);
        assertThat(stats.getTotalSilver()).isEqualTo(1L);
        assertThat(stats.getTotalBronze()).isEqualTo(1L);
    }
}
