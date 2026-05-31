package com.olympics.winterolympics.repository;

import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.enums.Country;
import com.olympics.winterolympics.enums.Gender;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AthleteRepository extends JpaRepository<Athlete, Long> {

    boolean existsByEmail(String email);

    Optional<Athlete> findByUsername(String username);

    List<Athlete> findByNameContainingIgnoreCase(String name);

    List<Athlete> findByGenderAndCountry(Gender gender, Country country);

    List<Athlete> findByGender(Gender gender);
}
