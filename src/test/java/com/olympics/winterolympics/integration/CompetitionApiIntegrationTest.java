package com.olympics.winterolympics.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CompetitionApiIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    private static final String NEW_SLALOM =
            "{\"name\":\"Integration Cup\",\"date\":\"2030-02-02\",\"gender\":\"MALE\","
                    + "\"minimumAge\":18,\"secondRunQualifiedCount\":30}";

    @Test
    void listCompetitions_isPublic() throws Exception {
        mvc.perform(get("/api/slalom-competitions"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ATHLETE")
    void createCompetition_asAthlete_isForbidden() throws Exception {
        mvc.perform(post("/api/slalom-competitions")
                        .contentType("application/json").content(NEW_SLALOM))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void createCompetition_asAdmin_persistsAndIsListed() throws Exception {
        mvc.perform(post("/api/slalom-competitions")
                        .contentType("application/json").content(NEW_SLALOM))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Integration Cup"));

        mvc.perform(get("/api/slalom-competitions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Integration Cup"));
    }
}
