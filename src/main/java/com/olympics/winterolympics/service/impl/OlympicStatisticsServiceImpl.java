package com.olympics.winterolympics.service.impl;

import com.olympics.winterolympics.dto.OlympicStatisticsDto;
import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.entity.MedalResult;
import com.olympics.winterolympics.enums.Medal;
import com.olympics.winterolympics.repository.AthleteRepository;
import com.olympics.winterolympics.repository.MedalResultRepository;
import com.olympics.winterolympics.service.OlympicStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OlympicStatisticsServiceImpl implements OlympicStatisticsService {

    private final MedalResultRepository medalResultRepository;
    private final AthleteRepository athleteRepository;

    @Override
    public void assignSlalomMedals(Long competitionId) {}

    @Override
    public void assignBiathlonMedals(Long competitionId) {}

    @Override
    public OlympicStatisticsDto getStatistics() {
        OlympicStatisticsDto dto = new OlympicStatisticsDto();

        List<MedalResult> medals = medalResultRepository.findAll();

        Map<String, Long> medalsByCountry = medals.stream()
                .filter(m -> m.getAthlete() != null && m.getAthlete().getCountry() != null)
                .collect(Collectors.groupingBy(
                        m -> m.getAthlete().getCountry().name(),
                        Collectors.counting()));
        dto.setMedalsByCountry(medalsByCountry);

        dto.setTotalGold(medals.stream().filter(m -> m.getMedal() == Medal.GOLD).count());
        dto.setTotalSilver(medals.stream().filter(m -> m.getMedal() == Medal.SILVER).count());
        dto.setTotalBronze(medals.stream().filter(m -> m.getMedal() == Medal.BRONZE).count());

        List<Athlete> athletes = athleteRepository.findAll();
        double avg = athletes.stream()
                .filter(a -> a.getBirthDate() != null)
                .mapToInt(this::age)
                .average().orElse(0);
        dto.setAverageAthleteAge(avg);

        List<Athlete> medalists = medals.stream()
                .map(MedalResult::getAthlete)
                .filter(a -> a != null && a.getBirthDate() != null)
                .distinct()
                .toList();

        Athlete youngest = medalists.stream()
                .max(Comparator.comparing(Athlete::getBirthDate))
                .orElse(null);
        Athlete oldest = medalists.stream()
                .min(Comparator.comparing(Athlete::getBirthDate))
                .orElse(null);

        if (youngest != null) {
            dto.setYoungestMedalist(youngest.getName());
            dto.setYoungestMedalistAge(age(youngest));
        }
        if (oldest != null) {
            dto.setOldestMedalist(oldest.getName());
            dto.setOldestMedalistAge(age(oldest));
        }
        return dto;
    }

    private int age(Athlete a) {
        return Period.between(a.getBirthDate(), LocalDate.now()).getYears();
    }
}
