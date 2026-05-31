package com.olympics.winterolympics.service;

import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.entity.Competition;
import com.olympics.winterolympics.entity.CompetitionRegistration;
import com.olympics.winterolympics.entity.MedalResult;
import com.olympics.winterolympics.entity.SlalomCompetition;
import com.olympics.winterolympics.entity.SlalomResult;
import com.olympics.winterolympics.enums.Country;
import com.olympics.winterolympics.enums.Medal;
import com.olympics.winterolympics.repository.BiathlonResultRepository;
import com.olympics.winterolympics.repository.MedalResultRepository;
import com.olympics.winterolympics.repository.SlalomResultRepository;
import com.olympics.winterolympics.service.impl.MedalResultServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedalResultServiceImplTest {

    @Mock
    private SlalomResultRepository slalomResultRepository;

    @Mock
    private BiathlonResultRepository biathlonResultRepository;

    @Mock
    private MedalResultRepository medalResultRepository;

    @InjectMocks
    private MedalResultServiceImpl service;

    private final SlalomCompetition competition = competition(1L);

    @Test
    void assignSlalomMedals_assignsGoldSilverBronzeToFastestThreeFinishers() {
        SlalomResult gold = result(1L, "Gold", 95.0, true);
        SlalomResult silver = result(2L, "Silver", 98.0, true);
        SlalomResult bronze = result(3L, "Bronze", 100.0, true);
        SlalomResult fourth = result(4L, "Fourth", 101.0, true);
        SlalomResult dnf = result(5L, "Dnf", null, false);

        when(medalResultRepository.findByCompetitionId(1L)).thenReturn(List.of());
        when(slalomResultRepository.findAll())
                .thenReturn(List.of(bronze, gold, fourth, silver, dnf));

        service.assignSlalomMedals(1L);

        ArgumentCaptor<MedalResult> captor = ArgumentCaptor.forClass(MedalResult.class);
        verify(medalResultRepository, times(3)).save(captor.capture());
        List<MedalResult> medals = captor.getAllValues();

        assertThat(medals).hasSize(3);
        assertThat(medals.get(0).getMedal()).isEqualTo(Medal.GOLD);
        assertThat(medals.get(0).getAthlete().getName()).isEqualTo("Gold");
        assertThat(medals.get(1).getMedal()).isEqualTo(Medal.SILVER);
        assertThat(medals.get(1).getAthlete().getName()).isEqualTo("Silver");
        assertThat(medals.get(2).getMedal()).isEqualTo(Medal.BRONZE);
        assertThat(medals.get(2).getAthlete().getName()).isEqualTo("Bronze");
    }

    @Test
    void assignSlalomMedals_clearsExistingMedalsFirst() {
        MedalResult stale = new MedalResult();
        when(medalResultRepository.findByCompetitionId(1L)).thenReturn(List.of(stale));
        when(slalomResultRepository.findAll()).thenReturn(List.of());

        service.assignSlalomMedals(1L);

        verify(medalResultRepository).deleteAll(List.of(stale));
    }

    private static SlalomCompetition competition(Long id) {
        SlalomCompetition c = new SlalomCompetition();
        c.setId(id);
        c.setSecondRunQualifiedCount(30);
        return c;
    }

    private SlalomResult result(Long id, String athleteName,
                                Double totalTime, boolean finished) {
        Athlete athlete = new Athlete();
        athlete.setName(athleteName);
        athlete.setCountry(Country.BULGARIA);

        CompetitionRegistration registration = new CompetitionRegistration();
        registration.setId(id);
        registration.setAthlete(athlete);
        registration.setCompetition((Competition) competition);

        SlalomResult result = new SlalomResult();
        result.setId(id);
        result.setRegistration(registration);
        result.setTotalTime(totalTime);
        result.setFinished(finished);
        return result;
    }
}
