package com.quad;

import com.jayway.jsonpath.JsonPath;
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

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InviteTests {

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

	private Event event(String organizer, Category category, long startsInDays, Integer spots) {
		Address address = new Address();
		address.setArea("Tampines");
		Event event = new Event();
		event.setName("Beach clean-up");
		event.setCategory(category);
		event.setFromDate(LocalDateTime.now().plusDays(startsInDays));
		event.setToDate(LocalDateTime.now().plusDays(startsInDays).plusHours(3));
		event.setNoOfParticipant(spots);
		event.setIsActive(true);
		event.setCreatedBy(organizer);
		event.setOrganizerName(organizer.equals("greensg") ? "Green SG" : "Other Org");
		event.setAddress(address);
		return eventJpaRepository.save(event);
	}

	private void volunteer(String username, String name, String area, boolean discoverable, Category... interests) {
		VolunteerPreference preference = new VolunteerPreference();
		preference.setUsername(username);
		preference.setName(name);
		preference.setArea(area);
		preference.setDiscoverable(discoverable);
		preference.setInterests(new java.util.HashSet<>(java.util.Arrays.stream(interests).map(Category::getId).toList()));
		preferences.save(preference);
	}

	// A verified past event for this volunteer.
	private void attended(String username, Event event) {
		EventRegistration registration = new EventRegistration();
		registration.setEvent(event);
		registration.setUsername(username);
		registration.setCreatedDate(LocalDateTime.now());
		registration.setAttended(true);
		registration.setHours(3.0);
		registrations.save(registration);
	}

	private String token(String username, String role, String name) {
		return "Bearer " + Jwts.builder().setSubject(username).claim("role", role).claim("name", name)
				.claim("org", role.equals("ORGANIZER") ? "Green SG" : null)
				.setExpiration(new Date(System.currentTimeMillis() + 60_000))
				.signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)), SignatureAlgorithm.HS256).compact();
	}

	private String organizer() {
		return token("greensg", "ORGANIZER", "Mei Lin Tan");
	}

	private String volunteerToken(String username) {
		return token(username, "VOLUNTEER", "Volunteer " + username);
	}

	private ResultActions perform(RequestBuilder request) throws Exception {
		ResultActions actions = mockMvc.perform(request);
		MvcResult result = actions.andReturn();
		return result.getRequest().isAsyncStarted() ? mockMvc.perform(asyncDispatch(result)) : actions;
	}

	private ResultActions invite(Event event, String auth, String... usernames) throws Exception {
		String list = String.join("\",\"", usernames);
		return perform(post("/profile/events/" + event.getId() + "/invites").header("Authorization", auth)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"usernames\":[\"" + list + "\"],\"message\":\"We'd love your help!\"}"));
	}

	private Long firstInviteId(String username) throws Exception {
		MvcResult result = perform(get("/profile/me/invites").header("Authorization", volunteerToken(username)))
				.andExpect(status().isOk()).andReturn();
		return ((Number) JsonPath.read(result.getResponse().getContentAsString(), "$[0].id")).longValue();
	}

	@Test
	void volunteersSaveTheirCausesAreaAndInvitationChoice() throws Exception {
		perform(get("/profile/me/preferences")).andExpect(status().isUnauthorized());
		perform(get("/profile/me/preferences").header("Authorization", volunteerToken("priya")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.interests", empty()))
				.andExpect(jsonPath("$.discoverable", is(false)));

		perform(put("/profile/me/preferences").header("Authorization", volunteerToken("priya"))
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"interests\":[" + environment.getId() + ",99999],\"area\":\" Tampines \",\"discoverable\":true}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.interests", contains(String.valueOf(environment.getId()))))
				.andExpect(jsonPath("$.area", is("Tampines")))
				.andExpect(jsonPath("$.discoverable", is(true)));

		perform(put("/profile/me/preferences").header("Authorization", organizer())
				.contentType(MediaType.APPLICATION_JSON).content("{\"interests\":[]}"))
				.andExpect(status().isForbidden());
	}

	@Test
	void organizersFindOnlyVolunteersWhoOptedIn() throws Exception {
		Event pastWithUs = event("greensg", environment, -20, 20);
		Event pastElsewhere = event("otherorg", environment, -10, 20);
		volunteer("priya", "Priya Nair", "Tampines", true, environment);
		volunteer("marcus", "Marcus Lim", "Bedok", true, animals);
		volunteer("hidden", "Hidden Person", "Tampines", false, environment);
		volunteer("wei", "Wei Jie Tan", "Tampines East", true);
		attended("wei", pastWithUs);
		attended("marcus", pastElsewhere);

		// Environment: interested (Priya) or experienced (Wei, Marcus); people who've helped you come first.
		perform(get("/profile/volunteers/search?categoryId=" + environment.getId()).header("Authorization", organizer()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[*].username", contains("wei", "marcus", "priya")))
				.andExpect(jsonPath("$[0].name", is("Wei T.")))
				.andExpect(jsonPath("$[0].eventsWithYou", is(1)))
				.andExpect(jsonPath("$[0].verifiedHours", is(3.0)))
				.andExpect(jsonPath("$[0].email").doesNotExist());

		perform(get("/profile/volunteers/search?categoryId=" + environment.getId() + "&experienced=true&area=tampines")
				.header("Authorization", organizer()))
				.andExpect(jsonPath("$[*].username", contains("wei")));

		perform(get("/profile/volunteers/search").header("Authorization", volunteerToken("priya")))
				.andExpect(status().isForbidden());
		perform(get("/profile/volunteers/search")).andExpect(status().isUnauthorized());
	}

	@Test
	void invitedVolunteersCanAcceptAndAreSignedUp() throws Exception {
		Event event = event("greensg", environment, 5, 10);
		volunteer("priya", "Priya Nair", "Tampines", true, environment);
		volunteer("hidden", "Hidden Person", "Tampines", false, environment);

		invite(event, organizer(), "priya", "hidden", "nobody")
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.invited", is(1)))
				.andExpect(jsonPath("$.skipped", is(2)));
		// Asking twice doesn't send a second invitation.
		invite(event, organizer(), "priya").andExpect(jsonPath("$.invited", is(0)));

		perform(get("/profile/me/invites").header("Authorization", volunteerToken("priya")))
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].organizerName", is("Green SG")))
				.andExpect(jsonPath("$[0].message", is("We'd love your help!")))
				.andExpect(jsonPath("$[0].event.name", is("Beach clean-up")));

		Long inviteId = firstInviteId("priya");
		// Nobody else can answer Priya's invitation.
		perform(post("/profile/me/invites/" + inviteId + "/accept").header("Authorization", volunteerToken("marcus")))
				.andExpect(status().isNotFound());
		perform(post("/profile/me/invites/" + inviteId + "/accept").header("Authorization", volunteerToken("priya")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.volunteersJoined", is(1)));

		perform(get("/profile/me/invites").header("Authorization", volunteerToken("priya"))).andExpect(jsonPath("$", empty()));
		perform(get("/profile/events/" + event.getId() + "/invites").header("Authorization", organizer()))
				.andExpect(jsonPath("$[0].status", is("JOINED")));
		perform(get("/profile/volunteers/search?eventId=" + event.getId()).header("Authorization", organizer()))
				.andExpect(jsonPath("$[0].status", is("JOINED")));
	}

	@Test
	void decliningCanMuteTheOrganizer() throws Exception {
		Event event = event("greensg", environment, 5, 10);
		volunteer("priya", "Priya Nair", "Tampines", true, environment);
		invite(event, organizer(), "priya");

		perform(post("/profile/me/invites/" + firstInviteId("priya") + "/decline").header("Authorization", volunteerToken("priya"))
				.contentType(MediaType.APPLICATION_JSON).content("{\"muteOrganizer\":true}"))
				.andExpect(status().isOk());

		perform(get("/profile/volunteers/search").header("Authorization", organizer())).andExpect(jsonPath("$", empty()));
		invite(event("greensg", environment, 8, 10), organizer(), "priya").andExpect(jsonPath("$.invited", is(0)));
		perform(get("/profile/me/preferences").header("Authorization", volunteerToken("priya")))
				.andExpect(jsonPath("$.mutedOrganizers[0].name", is("Green SG")));

		// Unmuting from the preferences page makes them findable again.
		perform(put("/profile/me/preferences").header("Authorization", volunteerToken("priya"))
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"interests\":[" + environment.getId() + "],\"discoverable\":true,\"mutedOrganizers\":[]}"))
				.andExpect(jsonPath("$.mutedOrganizers", empty()));
		perform(get("/profile/volunteers/search").header("Authorization", organizer()))
				.andExpect(jsonPath("$[*].username", contains("priya")))
				.andExpect(jsonPath("$[0].status", nullValue()));
	}

	@Test
	void invitationsAreLimitedAndOnlyForYourOwnUpcomingEvents() throws Exception {
		Event small = event("greensg", environment, 5, 2);
		for (int i = 0; i < 12; i++) {
			volunteer("v" + i, "Volunteer " + i, "Bedok", true, environment);
		}
		String[] everyone = java.util.stream.IntStream.range(0, 12).mapToObj(i -> "v" + i).toArray(String[]::new);
		// Two spots: at least 10 invitations.
		invite(small, organizer(), everyone)
				.andExpect(jsonPath("$.invited", is(10)))
				.andExpect(jsonPath("$.skipped", is(2)))
				.andExpect(jsonPath("$.remaining", is(0)));

		invite(event("otherorg", environment, 5, 10), organizer(), "v0").andExpect(status().isForbidden());
		invite(event("greensg", environment, -5, 10), organizer(), "v0").andExpect(status().isConflict());
		perform(get("/profile/events/" + small.getId() + "/invites").header("Authorization", volunteerToken("v0")))
				.andExpect(status().isForbidden());
		perform(get("/profile/events/" + small.getId() + "/invites").header("Authorization", organizer()))
				.andExpect(jsonPath("$", hasSize(10)))
				.andExpect(jsonPath("$[*].status", org.hamcrest.Matchers.everyItem(is("INVITED"))));
	}
}
