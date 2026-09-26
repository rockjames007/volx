package com.quad;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationFlowTests {

	@Autowired
	MockMvc mockMvc;
	@Autowired
	ObjectMapper objectMapper;

	private ResultActions perform(RequestBuilder request) throws Exception {
		ResultActions actions = mockMvc.perform(request);
		MvcResult result = actions.andReturn();
		return result.getRequest().isAsyncStarted() ? mockMvc.perform(asyncDispatch(result)) : actions;
	}

	private static RequestBuilder json(String url, String body) {
		return post(url).contentType(MediaType.APPLICATION_JSON).content(body);
	}

	@Test
	void registerThenLoginWithEmailThenFetchCurrentUser() throws Exception {
		perform(json("/auth/register", "{\"username\":\"alice\",\"email\":\"alice@example.com\",\"password\":\"secret1\"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.jwt").isNotEmpty());

		MvcResult login = perform(json("/auth/authorize", "{\"username\":\"alice@example.com\",\"password\":\"secret1\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value("alice"))
				.andReturn();
		JsonNode body = objectMapper.readTree(login.getResponse().getContentAsString());

		perform(get("/users/me").header("Authorization", "Bearer " + body.get("jwt").asText()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("alice@example.com"))
				.andExpect(jsonPath("$.password").doesNotExist());
	}

	@Test
	void duplicateRegistrationIsRejected() throws Exception {
		perform(json("/auth/register", "{\"username\":\"bob\",\"email\":\"bob@example.com\",\"password\":\"secret1\"}"))
				.andExpect(status().isCreated());
		perform(json("/auth/register", "{\"username\":\"bob2\",\"email\":\"BOB@example.com\",\"password\":\"secret1\"}"))
				.andExpect(status().isConflict());
	}

	@Test
	void wrongPasswordReturns401() throws Exception {
		perform(json("/auth/authorize", "{\"username\":\"test@gmail.com\",\"password\":\"nope\"}"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void demoAccountFromReadmeCanLogIn() throws Exception {
		perform(json("/auth/authorize", "{\"username\":\"org@gmail.com\",\"password\":\"org123\"}"))
				.andExpect(status().isOk());
	}

	@Test
	void protectedEndpointsRequireAValidToken() throws Exception {
		perform(get("/users/me")).andExpect(status().isUnauthorized());
		perform(get("/users/me").header("Authorization", "Bearer not-a-jwt")).andExpect(status().isUnauthorized());
	}
}
