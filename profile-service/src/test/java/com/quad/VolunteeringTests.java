package com.quad;

import com.quad.entity.Category;
import com.quad.entity.Event;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class VolunteeringTests {

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

	private Category category;

	@BeforeEach
	void setUp() {
		eventRegistrationJpaRepository.deleteAll();
		eventJpaRepository.deleteAll();
		category = categoryJpaRepository.findAll().get(0);
	}

	private Event saveEvent(String name, LocalDateTime from, Integer spots, String organizer) {
		Event event = new Event();
		event.setName(name);
		event.setCategory(category);
		event.setFromDate(from);
		event.setToDate(from.plusHours(3));
		event.setNoOfParticipant(spots);
		event.setIsActive(true);
		event.setCreatedBy(organizer);
		return eventJpaRepository.save(event);
	}

	private String auth(String username) {
		return "Bearer " + Jwts.builder()
				.setSubject(username)
				.setExpiration(new Date(System.currentTimeMillis() + 60_000))
				.signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)), SignatureAlgorithm.HS256)
				.compact();
	}

	private ResultActions perform(RequestBuilder request) throws Exception {
		ResultActions actions = mockMvc.perform(request);
		MvcResult result = actions.andReturn();
		return result.getRequest().isAsyncStarted() ? mockMvc.perform(asyncDispatch(result)) : actions;
	}

	@Test
	void volunteerCanJoinAndLeaveAnEvent() throws Exception {
		Long id = saveEvent("Tree planting", LocalDateTime.now().plusDays(2), 10, "org").getId();

		perform(post("/profile/events/" + id + "/volunteers").header("Authorization", auth("test")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.volunteersJoined").value(1));
		perform(get("/profile/events/" + id)).andExpect(jsonPath("$.volunteersJoined").value(1));

		perform(post("/profile/events/" + id + "/volunteers").header("Authorization", auth("test")))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("You have already joined this event"));

		perform(delete("/profile/events/" + id + "/volunteers").header("Authorization", auth("test")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.volunteersJoined").value(0));
	}

	@Test
	void cannotJoinAFullOrFinishedEvent() throws Exception {
		Long full = saveEvent("Food drive", LocalDateTime.now().plusDays(2), 1, "org").getId();
		perform(post("/profile/events/" + full + "/volunteers").header("Authorization", auth("a")))
				.andExpect(status().isOk());
		perform(post("/profile/events/" + full + "/volunteers").header("Authorization", auth("b")))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("This event is full"));

		Long past = saveEvent("Last week's clean-up", LocalDateTime.now().minusDays(7), 10, "org").getId();
		perform(post("/profile/events/" + past + "/volunteers").header("Authorization", auth("a")))
				.andExpect(status().isConflict());
	}

	@Test
	void finishedEventsAreNotListed() throws Exception {
		saveEvent("Last week's clean-up", LocalDateTime.now().minusDays(7), 10, "org");
		saveEvent("Next week's clean-up", LocalDateTime.now().plusDays(7), 10, "org");
		perform(get("/profile/events"))
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.content[0].name").value("Next week's clean-up"));
	}

	@Test
	void myEventsListsWhatIJoinedAndWhatIOrganize() throws Exception {
		Long joined = saveEvent("Tree planting", LocalDateTime.now().plusDays(2), 10, "org").getId();
		saveEvent("My blood drive", LocalDateTime.now().plusDays(3), 5, "test");
		perform(post("/profile/events/" + joined + "/volunteers").header("Authorization", auth("test")));

		perform(get("/profile/me/events").header("Authorization", auth("test")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.joined[0].name").value("Tree planting"))
				.andExpect(jsonPath("$.joined.length()").value(1))
				.andExpect(jsonPath("$.organizing[0].name").value("My blood drive"));
	}

	@Test
	void joiningAndMyEventsRequireLogin() throws Exception {
		Long id = saveEvent("Tree planting", LocalDateTime.now().plusDays(2), 10, "org").getId();
		perform(post("/profile/events/" + id + "/volunteers")).andExpect(status().isUnauthorized());
		perform(get("/profile/me/events")).andExpect(status().isUnauthorized());
		perform(post("/profile/events/424242/volunteers").header("Authorization", auth("test")))
				.andExpect(status().isNotFound());
	}
}
