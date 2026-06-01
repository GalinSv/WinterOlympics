package com.olympics.winterolympics.controller;

import com.olympics.winterolympics.config.SecurityConfig;
import com.olympics.winterolympics.dto.SlalomCompetitionDto;
import com.olympics.winterolympics.service.CompetitionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@ContextConfiguration(classes = {SlalomCompetitionController.class, SecurityConfig.class})
@ActiveProfiles("test")
class SlalomCompetitionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CompetitionService competitionService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private static final String NEW_SLALOM =
            "{\"name\":\"Test\",\"date\":\"2030-01-01\",\"gender\":\"MALE\","
                    + "\"minimumAge\":18,\"secondRunQualifiedCount\":30}";

    @Test
    void listCompetitions_isPublic() throws Exception {
        given(competitionService.getAllSlalomCompetitions()).willReturn(List.of());
        mockMvc.perform(get("/api/slalom-competitions"))
                .andExpect(status().isOk());
    }

    @Test
    void createCompetition_withoutToken_isUnauthorized() throws Exception {
        mockMvc.perform(post("/api/slalom-competitions")
                        .contentType("application/json").content(NEW_SLALOM))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createCompetition_asAthlete_isForbidden() throws Exception {
        mockMvc.perform(post("/api/slalom-competitions")
                        .contentType("application/json").content(NEW_SLALOM)
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ROLE_ATHLETE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void createCompetition_asAdmin_isCreated() throws Exception {
        given(competitionService.createSlalomCompetition(any()))
                .willReturn(new SlalomCompetitionDto());
        mockMvc.perform(post("/api/slalom-competitions")
                        .contentType("application/json").content(NEW_SLALOM)
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isCreated());
    }
}
