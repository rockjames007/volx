package com.quad;

import com.quad.repository.CategoryJpaRepository;
import com.quad.repository.EventJpaRepository;
import com.quad.repository.EventRegistrationJpaRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.LocalDateTime;
import java.util.Date;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EventCreationTests {

	@Autowired
	MockMvc mockMvc;
	@Autowired
	EventJpaRepository eventJpaRepository;
	@Autowired
	EventRegistrationJpaRepository eventRegistrationJpaRepository;
	@Autowired
	CategoryJpaRepository categoryJpaRepository;
	@Value("${security.jwt.secret-key}")
	String secretKey;

	private Long categoryId;

	@BeforeEach
	void setUp() {
		eventRegistrationJpaRepository.deleteAll();
		eventJpaRepository.deleteAll();
		categoryId = categoryJpaRepository.findAll().get(0).getId();
	}

	private String tokenFor(String username, long ttlMillis) {
		return Jwts.builder()
				.setSubject(username)
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + ttlMillis))
				.signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)), SignatureAlgorithm.HS256)
				.compact();
	}

	private ResultActions perform(RequestBuilder request) throws Exception {
		ResultActions actions = mockMvc.perform(request);
		MvcResult result = actions.andReturn();
		return result.getRequest().isAsyncStarted() ? mockMvc.perform(asyncDispatch(result)) : actions;
	}

	private MockHttpServletRequestBuilder createEvent(String body) {
		return post("/profile/events").contentType(MediaType.APPLICATION_JSON).content(body);
	}

	private String eventJson(String name, Long category, LocalDateTime from, LocalDateTime to) {
		return """
				{"name":"%s","description":"Bring gloves","categoryId":%d,"fromDate":"%s","toDate":"%s",
				 "noOfParticipant":15,"address":{"area":"Marina Beach","state":"Tamil Nadu"}}
				""".formatted(name, category, from, to);
	}

	@Test
	void seedsDefaultCategories() throws Exception {
		perform(get("/profile/categories"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[*].category").value(containsInAnyOrder(
						"Animals", "Community", "Disaster relief", "Education", "Environment", "Health")))
				.andExpect(jsonPath("$[0].category").value("Animals"));
	}

	@Test
	void loggedInUserCanCreateAnEventThatThenAppearsInTheListing() throws Exception {
		LocalDateTime start = LocalDateTime.now().plusDays(3).withNano(0);
		perform(createEvent(eventJson("Beach clean-up", categoryId, start, start.plusHours(3)))
				.header("Authorization", "Bearer " + tokenFor("test", 60_000)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.createdBy").value("test"))
				.andExpect(jsonPath("$.isActive").value(true))
				.andExpect(jsonPath("$.address.area").value("Marina Beach"));

		perform(get("/profile/events"))
				.andExpect(jsonPath("$.content[0].name").value("Beach clean-up"))
				.andExpect(jsonPath("$.content[0].category.id").value(categoryId.toString()));
	}

	@Test
	void creatingRequiresAValidToken() throws Exception {
		LocalDateTime start = LocalDateTime.now().plusDays(3);
		String body = eventJson("Beach clean-up", categoryId, start, start.plusHours(3));
		perform(createEvent(body)).andExpect(status().isUnauthorized());
		perform(createEvent("{}")).andExpect(status().isUnauthorized());
		perform(createEvent(body).header("Authorization", "Bearer garbage")).andExpect(status().isUnauthorized());
		perform(createEvent(body).header("Authorization", "Bearer " + tokenFor("test", -1_000)))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void rejectsInvalidEvents() throws Exception {
		String token = "Bearer " + tokenFor("test", 60_000);
		LocalDateTime start = LocalDateTime.now().plusDays(3);

		perform(createEvent(eventJson(" ", categoryId, start, start.plusHours(3))).header("Authorization", token))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("name: must not be blank"));
		perform(createEvent(eventJson("Clean-up", categoryId, start, start.minusHours(1))).header("Authorization", token))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value(containsString("end date must be after")));
		perform(createEvent(eventJson("Clean-up", 999_999L, start, start.plusHours(1))).header("Authorization", token))
				.andExpect(status().isBadRequest());
		perform(createEvent(eventJson("Clean-up", categoryId, LocalDateTime.now().minusDays(1), start)).header("Authorization", token))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value(containsString("fromDate")));
	}
}
