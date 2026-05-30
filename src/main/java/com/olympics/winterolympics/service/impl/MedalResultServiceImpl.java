package com.olympics.winterolympics.service.impl;

import com.olympics.winterolympics.entity.BiathlonResult;
import com.olympics.winterolympics.entity.MedalResult;
import com.olympics.winterolympics.entity.SlalomResult;
import com.olympics.winterolympics.enums.Medal;
import com.olympics.winterolympics.repository.BiathlonResultRepository;
import com.olympics.winterolympics.repository.MedalResultRepository;
import com.olympics.winterolympics.repository.SlalomResultRepository;
import com.olympics.winterolympics.service.MedalResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedalResultServiceImpl implements MedalResultService {

    private final SlalomResultRepository slalomResultRepository;
    private final BiathlonResultRepository biathlonResultRepository;
    private final MedalResultRepository medalResultRepository;

    @Override
    @Transactional
    public void assignSlalomMedals(Long competitionId) {
        clearMedals(competitionId);

        List<SlalomResult> ranked = slalomResultRepository.findAll().stream()
                .filter(r -> r.getRegistration().getCompetition().getId().equals(competitionId))
                .filter(r -> Boolean.TRUE.equals(r.getFinished()))
                .filter(r -> r.getTotalTime() != null)
                .sorted(Comparator.comparing(SlalomResult::getTotalTime))
                .limit(3)
                .toList();

        for (int i = 0; i < ranked.size(); i++) {
            SlalomResult r = ranked.get(i);
            MedalResult m = new MedalResult();
            m.setCompetition(r.getRegistration().getCompetition());
            m.setAthlete(r.getRegistration().getAthlete());
            m.setMedal(medalFor(i));
            medalResultRepository.save(m);
        }
    }

    @Override
    @Transactional
    public void assignBiathlonMedals(Long competitionId) {
        clearMedals(competitionId);

        List<BiathlonResult> ranked = biathlonResultRepository.findAll().stream()
                .filter(r -> r.getRegistration().getCompetition().getId().equals(competitionId))
                .filter(r -> Boolean.TRUE.equals(r.getFinished()))
                .filter(r -> r.getTotalTime() != null)
                .sorted(Comparator.comparing(BiathlonResult::getTotalTime))
                .limit(3)
                .toList();

        for (int i = 0; i < ranked.size(); i++) {
            BiathlonResult r = ranked.get(i);
            MedalResult m = new MedalResult();
            m.setCompetition(r.getRegistration().getCompetition());
            m.setAthlete(r.getRegistration().getAthlete());
            m.setMedal(medalFor(i));
            medalResultRepository.save(m);
        }
    }

    private void clearMedals(Long competitionId) {
        List<MedalResult> existing = medalResultRepository.findByCompetitionId(competitionId);
        if (!existing.isEmpty()) {
            medalResultRepository.deleteAll(existing);
        }
    }

    private Medal medalFor(int position) {
        return switch (position) {
            case 0 -> Medal.GOLD;
            case 1 -> Medal.SILVER;
            case 2 -> Medal.BRONZE;
            default -> throw new IllegalArgumentException("Invalid medal position");
        };
    }
}
