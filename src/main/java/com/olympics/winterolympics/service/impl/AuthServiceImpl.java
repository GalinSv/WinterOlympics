package com.olympics.winterolympics.service.impl;

import com.olympics.winterolympics.dto.AuthResponseDto;
import com.olympics.winterolympics.dto.LoginRequestDto;
import com.olympics.winterolympics.dto.RegisterRequestDto;
import com.olympics.winterolympics.dto.RegisterResponseDto;
import com.olympics.winterolympics.entity.Athlete;
import com.olympics.winterolympics.entity.Role;
import com.olympics.winterolympics.entity.User;
import com.olympics.winterolympics.exception.DuplicateUserException;
import com.olympics.winterolympics.repository.AthleteRepository;
import com.olympics.winterolympics.repository.RoleRepository;
import com.olympics.winterolympics.repository.UserRepository;
import com.olympics.winterolympics.service.AuthService;
import com.olympics.winterolympics.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String ATHLETE_ROLE = "ROLE_ATHLETE";

    private final AthleteRepository athleteRepository;

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;

    @Override
    @Transactional
    public RegisterResponseDto register(RegisterRequestDto request) {

        validateRequest(request);
        validateDuplicates(request);

        Role athleteRole =
                roleRepository.findByAuthority(ATHLETE_ROLE)
                        .orElseGet(() -> createRole(ATHLETE_ROLE));

        User user =
                new User();

        user.setUsername(request.getUsername());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.getRoles().add(athleteRole);

        User savedUser =
                userRepository.save(user);

        Athlete athlete =
                new Athlete();

        athlete.setUser(savedUser);
        athlete.setName(request.getName());
        athlete.setEmail(request.getEmail());
        athlete.setPhoneNumber(request.getPhoneNumber());
        athlete.setCountry(request.getCountry());
        athlete.setGender(request.getGender());
        athlete.setBirthDate(request.getBirthDate());

        Athlete savedAthlete =
                athleteRepository.save(athlete);

        return new RegisterResponseDto(
                savedAthlete.getId(),
                savedUser.getId(),
                savedUser.getUsername(),
                savedAthlete.getEmail()
        );
    }

    @Override
    public AuthResponseDto login(LoginRequestDto request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user =
                userRepository.findByUsername(request.getUsername())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid username or password"
                                ));

        return new AuthResponseDto(
                jwtService.generateToken(user),
                "Bearer"
        );
    }

    private void validateRequest(RegisterRequestDto request) {

        if (!request.getPassword()
                .equals(request.getConfirmPassword())) {

            throw new IllegalArgumentException(
                    "Passwords do not match"
            );
        }
    }

    private void validateDuplicates(RegisterRequestDto request) {

        if (userRepository.existsByUsername(
                request.getUsername())) {

            throw new DuplicateUserException(
                    "Username is already taken"
            );
        }

        if (athleteRepository.existsByEmail(
                request.getEmail())) {

            throw new DuplicateUserException(
                    "Email is already taken"
            );
        }
    }

    private Role createRole(String authority) {

        Role role =
                new Role();

        role.setAuthority(authority);

        return roleRepository.save(role);
    }
}
