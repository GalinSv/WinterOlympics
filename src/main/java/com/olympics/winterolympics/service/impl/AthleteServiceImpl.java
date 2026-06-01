package com.olympics.winterolympics.service.impl;

import com.olympics.winterolympics.dto.AthleteDto;
import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.exception.ResourceNotFoundException;
import com.olympics.winterolympics.repository.AthleteRepository;
import com.olympics.winterolympics.service.AthleteService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AthleteServiceImpl implements AthleteService {

    private final AthleteRepository athleteRepository;

    private final ModelMapper modelMapper;

    @Override
    public AthleteDto createAthlete(AthleteDto athleteDto) {

        Athlete athlete = mapToEntity(athleteDto);
        Athlete savedAthlete = athleteRepository.save(athlete);
        return mapToDto(savedAthlete);
    }

    @Override
    public List<AthleteDto> getAllAthletes() {

        return athleteRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<AthleteDto> searchAthletesByName(String query) {

        if (query == null || query.isBlank()) {
            return getAllAthletes();
        }

        return athleteRepository
                .findByNameContainingIgnoreCase(query.trim())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public AthleteDto getAthleteById(Long id) {

        Athlete athlete = athleteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));
        return mapToDto(athlete);
    }

    @Override
    public AthleteDto getAthleteByUsername(String username) {

        Athlete athlete = athleteRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));
        return mapToDto(athlete);
    }

    @Override
    public AthleteDto getOrCreateCurrentAthlete(String username, String name, String email) {

        Athlete athlete = athleteRepository.findByUsername(username)
                .orElseGet(() -> {
                    Athlete created = new Athlete();
                    created.setUsername(username);
                    created.setName((name != null && !name.isBlank()) ? name : username);
                    created.setEmail(email);
                    return athleteRepository.save(created);
                });
        return mapToDto(athlete);
    }

    @Override
    public AthleteDto updateAthlete(Long id, AthleteDto athleteDto) {

        Athlete athlete = athleteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));

        applyDto(athlete, athleteDto);
        return mapToDto(athleteRepository.save(athlete));
    }

    @Override
    public AthleteDto updateOwnProfile(String username, AthleteDto athleteDto) {

        Athlete athlete = athleteRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));

        athlete.setName(athleteDto.getName());
        athlete.setEmail(athleteDto.getEmail());
        athlete.setPhoneNumber(athleteDto.getPhoneNumber());

        if (athlete.getGender() == null) {
            athlete.setGender(athleteDto.getGender());
        }
        if (athlete.getCountry() == null) {
            athlete.setCountry(athleteDto.getCountry());
        }
        if (athlete.getBirthDate() == null) {
            athlete.setBirthDate(athleteDto.getBirthDate());
        }

        return mapToDto(athleteRepository.save(athlete));
    }

    @Override
    public void deleteAthlete(Long id) {

        athleteRepository.deleteById(id);
    }

    private void applyDto(Athlete athlete, AthleteDto dto) {
        athlete.setName(dto.getName());
        athlete.setEmail(dto.getEmail());
        athlete.setPhoneNumber(dto.getPhoneNumber());
        athlete.setCountry(dto.getCountry());
        athlete.setGender(dto.getGender());
        athlete.setBirthDate(dto.getBirthDate());
    }

    private AthleteDto mapToDto(Athlete athlete) {
        return modelMapper.map(athlete, AthleteDto.class);
    }

    private Athlete mapToEntity(AthleteDto athleteDto) {
        return modelMapper.map(athleteDto, Athlete.class);
    }
}
