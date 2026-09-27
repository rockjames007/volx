package com.quad;

import com.quad.entity.Address;
import com.quad.entity.Category;
import com.quad.entity.Event;
import com.quad.entity.EventRegistration;
import com.quad.entity.VolunteerPreference;
import com.quad.repository.CategoryJpaRepository;
import com.quad.repository.EventInviteRepository;
import com.quad.repository.EventJpaRepository;
import com.quad.repository.EventRegistrationJpaRepository;
import com.quad.repository.VolunteerPreferenceRepository;
import com.quad.service.TimeSlots;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterEach;
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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PlanningTests {

	@Autowired
	MockMvc mockMvc;
	@Autowired
	EventJpaRepository eventJpaRepository;
	@Autowired
	EventRegistrationJpaRepository registrations;
	@Autowired
	EventInviteRepository invites;
	@Autowired
	VolunteerPreferenceRepository preferences;
	@Autowired
	CategoryJpaRepository categoryJpaRepository;
	@Value("${security.jwt.secret-key}")
	String secretKey;

	Category environment;
	Category animals;

	@BeforeEach
	@AfterEach
	void cleanUp() {
		invites.deleteAll();
		registrations.deleteAll();
		eventJpaRepository.deleteAll();
		preferences.deleteAll();
		environment = category("Environment");
		animals = category("Animals");
	}

	private Category category(String name) {
		return categoryJpaRepository.findAll().stream().filter(c -> c.getCategory().equals(name)).findFirst()
				.orElseGet(() -> {
					Category category = new Category();
					category.setCategory(name);
					return categoryJpaRepository.save(category);
				});
	}

	private void volunteer(String username, String area, boolean discoverable, Set<String> slots, Category... interests) {
		VolunteerPreference preference = new VolunteerPreference();
		preference.setUsername(username);
		preference.setName("Volunteer " + username);
		preference.setArea(area);
		preference.setDiscoverable(discoverable);
		preference.setAvailability(new HashSet<>(slots));
		preference.setInterests(new HashSet<>(java.util.Arrays.stream(interests).map(Category::getId).toList()));
		preferences.save(preference);
	}

	// A past event on the most recent given weekday, with this many verified attendees.
	private void pastEvent(String organizer, Category category, DayOfWeek day, int hour, int attended) {
		LocalDateTime start = LocalDate.now().minusDays(1).with(TemporalAdjusters.previousOrSame(day)).atTime(hour, 0);
		Address address = new Address();
		address.setArea("Tampines");
		Event event = new Event();
		event.setName("Past event");
		event.setCategory(category);
		event.setFromDate(start);
		event.setToDate(start.plusHours(2));
		event.setIsActive(true);
		event.setCreatedBy(organizer);
		event.setOrganizerName(organizer);
		event.setAddress(address);
		event = eventJpaRepository.save(event);
		for (int i = 0; i < attended; i++) {
			EventRegistration registration = new EventRegistration();
			registration.setEvent(event);
			registration.setUsername(organizer + "-guest-" + i);
			registration.setCreatedDate(start.minusDays(3));
			registration.setAttended(true);
			registration.setHours(2.0);
			registrations.save(registration);
		}
	}

	private String token(String username, String role) {
		return "Bearer " + Jwts.builder().setSubject(username).claim("role", role).claim("name", "Someone")
				.setExpiration(new Date(System.currentTimeMillis() + 60_000))
				.signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)), SignatureAlgorithm.HS256).compact();
	}

	private ResultActions perform(RequestBuilder request) throws Exception {
		ResultActions actions = mockMvc.perform(request);
		MvcResult result = actions.andReturn();
		return result.getRequest().isAsyncStarted() ? mockMvc.perform(asyncDispatch(result)) : actions;
	}

	// Index of a slot in the response, which lists all 21 in Monday-morning-first order.
	private static int index(String slot) {
		return TimeSlots.ALL.indexOf(slot);
	}

	@Test
	void timeSlotsFollowTheStartTime() {
		assertEquals(21, TimeSlots.ALL.size());
		assertEquals("SAT_MORNING", TimeSlots.of(LocalDateTime.of(2030, 1, 5, 9, 0)));
		assertEquals("SAT_AFTERNOON", TimeSlots.of(LocalDateTime.of(2030, 1, 5, 12, 0)));
		assertEquals("MON_EVENING", TimeSlots.of(LocalDateTime.of(2030, 1, 7, 17, 0)));
	}

	@Test
	void volunteersSaveWhenTheyAreUsuallyFree() throws Exception {
		perform(put("/profile/me/preferences").header("Authorization", token("priya", "VOLUNTEER"))
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"interests\":[],\"availability\":[\"SUN_MORNING\",\"TUE_EVENING\",\"NEVER\"],\"discoverable\":true}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.availability", contains("TUE_EVENING", "SUN_MORNING")));
		// Leaving availability out keeps what was saved.
		perform(put("/profile/me/preferences").header("Authorization", token("priya", "VOLUNTEER"))
				.contentType(MediaType.APPLICATION_JSON).content("{\"interests\":[],\"discoverable\":true}"))
				.andExpect(jsonPath("$.availability", hasSize(2)));
	}

	@Test
	void bestTimesCountMatchingVolunteersAndPastTurnout() throws Exception {
		volunteer("a", "Tampines", true, Set.of("SAT_MORNING", "SUN_MORNING"), environment);
		volunteer("b", "Tampines", true, Set.of("SAT_MORNING", "WED_EVENING"), environment);
		volunteer("c", "Bedok", true, Set.of("SAT_MORNING"), environment);
		volunteer("d", "Tampines", true, Set.of("SAT_MORNING"), animals);
		volunteer("hidden", "Tampines", false, Set.of("SAT_MORNING"), environment);
		volunteer("unsure", "Tampines", true, Set.of(), environment);
		pastEvent("greensg", environment, DayOfWeek.SATURDAY, 9, 5);
		pastEvent("greensg", animals, DayOfWeek.WEDNESDAY, 19, 2);
		pastEvent("otherorg", environment, DayOfWeek.SUNDAY, 9, 3);

		perform(get("/profile/planning/best-times?categoryId=" + environment.getId() + "&area=tampines")
				.header("Authorization", token("greensg", "ORGANIZER")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.matchingVolunteers", is(3)))
				.andExpect(jsonPath("$.withAvailability", is(2)))
				.andExpect(jsonPath("$.slots", hasSize(21)))
				.andExpect(jsonPath("$.slots[" + index("SAT_MORNING") + "].available", is(2)))
				.andExpect(jsonPath("$.slots[" + index("WED_EVENING") + "].available", is(1)))
				// Turnout in this cause from everyone's events; your turnout from any of your events.
				.andExpect(jsonPath("$.slots[" + index("SUN_MORNING") + "].turnout", is(3)))
				.andExpect(jsonPath("$.slots[" + index("SAT_MORNING") + "].turnout", is(5)))
				.andExpect(jsonPath("$.slots[" + index("SAT_MORNING") + "].yourTurnout", is(5)))
				.andExpect(jsonPath("$.slots[" + index("WED_EVENING") + "].turnout", is(0)))
				.andExpect(jsonPath("$.slots[" + index("WED_EVENING") + "].yourTurnout", is(2)));

		// Any cause, anywhere: every opted-in volunteer.
		perform(get("/profile/planning/best-times").header("Authorization", token("greensg", "ORGANIZER")))
				.andExpect(jsonPath("$.matchingVolunteers", is(5)))
				.andExpect(jsonPath("$.slots[" + index("SAT_MORNING") + "].available", is(4)));
	}

	@Test
	void onlyOrganizersSeePlanningFigures() throws Exception {
		perform(get("/profile/planning/best-times").header("Authorization", token("priya", "VOLUNTEER")))
				.andExpect(status().isForbidden());
		perform(get("/profile/planning/best-times")).andExpect(status().isUnauthorized());
	}
}
