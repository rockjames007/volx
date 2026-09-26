package com.quad;

import com.jayway.jsonpath.JsonPath;
import com.quad.repository.CategoryJpaRepository;
import com.quad.repository.EventJpaRepository;
import com.quad.repository.EventRegistrationJpaRepository;
import io.jsonwebtoken.JwtBuilder;
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

import java.time.LocalDateTime;
import java.util.Date;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrganizerToolsTests {

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

	private String token(String username, String role, String name, String org) {
		JwtBuilder builder = Jwts.builder().setSubject(username)
				.setExpiration(new Date(System.currentTimeMillis() + 60_000));
		if (role != null) builder.claim("role", role);
		if (name != null) builder.claim("name", name);
		if (org != null) builder.claim("org", org);
		return "Bearer " + builder.signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)), SignatureAlgorithm.HS256)
				.compact();
	}

	private String organizer(String username) {
		return token(username, "ORGANIZER", "Organizer " + username, "Org of " + username);
	}

	private String volunteer(String username) {
		return token(username, "VOLUNTEER", "Volunteer " + username, null);
	}

	private ResultActions perform(RequestBuilder request) throws Exception {
		ResultActions actions = mockMvc.perform(request);
		MvcResult result = actions.andReturn();
		return result.getRequest().isAsyncStarted() ? mockMvc.perform(asyncDispatch(result)) : actions;
	}

	private String body(String name, int spots) {
		LocalDateTime start = LocalDateTime.now().plusDays(3).withNano(0);
		return """
				{"name":"%s","categoryId":%d,"fromDate":"%s","toDate":"%s","noOfParticipant":%d,
				 "address":{"area":"Toa Payoh Central","pincode":"310490"}}
				""".formatted(name, categoryId, start, start.plusHours(3), spots);
	}

	private long createEvent(String auth, String name, int spots) throws Exception {
		MvcResult result = perform(post("/profile/events").header("Authorization", auth)
				.contentType(MediaType.APPLICATION_JSON).content(body(name, spots)))
				.andExpect(status().isCreated()).andReturn();
		return JsonPath.<Number>read(result.getResponse().getContentAsString(), "$.id").longValue();
	}

	@Test
	void onlyOrganizersCanPostEventsAndTheirOrganizationIsShown() throws Exception {
		perform(post("/profile/events").header("Authorization", volunteer("vol"))
				.contentType(MediaType.APPLICATION_JSON).content(body("Beach clean-up", 10)))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.message").value("Only organizer accounts can post events"));

		long id = createEvent(organizer("greensg"), "Beach clean-up", 10);
		perform(get("/profile/events/" + id)).andExpect(jsonPath("$.organizerName").value("Org of greensg"));
	}

	@Test
	void organizerCanEditTheirEventButNobodyElseCan() throws Exception {
		long id = createEvent(organizer("greensg"), "Beach clean-up", 10);

		perform(put("/profile/events/" + id).header("Authorization", organizer("greensg"))
				.contentType(MediaType.APPLICATION_JSON).content(body("Beach clean-up (bring gloves)", 12)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Beach clean-up (bring gloves)"))
				.andExpect(jsonPath("$.noOfParticipant").value(12));

		perform(put("/profile/events/" + id).header("Authorization", organizer("someone-else"))
				.contentType(MediaType.APPLICATION_JSON).content(body("Hijacked", 12)))
				.andExpect(status().isForbidden());
		perform(put("/profile/events/" + id).contentType(MediaType.APPLICATION_JSON).content(body("Anon", 12)))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void spotsCannotBeReducedBelowTheVolunteersAlreadyJoined() throws Exception {
		long id = createEvent(organizer("greensg"), "Food drive", 5);
		perform(post("/profile/events/" + id + "/volunteers").header("Authorization", volunteer("a")));
		perform(post("/profile/events/" + id + "/volunteers").header("Authorization", volunteer("b")));

		perform(put("/profile/events/" + id).header("Authorization", organizer("greensg"))
				.contentType(MediaType.APPLICATION_JSON).content(body("Food drive", 1)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value(containsString("2 volunteers have already joined")));
	}

	@Test
	void organizerSeesWhoJoinedButOthersCannot() throws Exception {
		long id = createEvent(organizer("greensg"), "Reading buddies", 5);
		perform(post("/profile/events/" + id + "/volunteers").header("Authorization", volunteer("alice")))
				.andExpect(status().isOk());

		perform(get("/profile/events/" + id + "/volunteers").header("Authorization", organizer("greensg")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].username").value("alice"))
				.andExpect(jsonPath("$[0].name").value("Volunteer alice"))
				.andExpect(jsonPath("$[0].joinedAt").isNotEmpty());
		perform(get("/profile/events/" + id + "/volunteers").header("Authorization", volunteer("alice")))
				.andExpect(status().isForbidden());
		perform(get("/profile/events/" + id + "/volunteers")).andExpect(status().isUnauthorized());
	}

	@Test
	void cancellingHidesTheEventStopsSignUpsAndKeepsItInMyEvents() throws Exception {
		long id = createEvent(organizer("greensg"), "Park restoration", 5);
		perform(post("/profile/events/" + id + "/volunteers").header("Authorization", volunteer("alice")));

		perform(post("/profile/events/" + id + "/cancel").header("Authorization", volunteer("alice")))
				.andExpect(status().isForbidden());
		perform(post("/profile/events/" + id + "/cancel").header("Authorization", organizer("greensg")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.isActive").value(false));

		perform(get("/profile/events")).andExpect(jsonPath("$.totalElements").value(0));
		perform(post("/profile/events/" + id + "/volunteers").header("Authorization", volunteer("bob")))
				.andExpect(status().isConflict());
		perform(put("/profile/events/" + id).header("Authorization", organizer("greensg"))
				.contentType(MediaType.APPLICATION_JSON).content(body("Revived", 5)))
				.andExpect(status().isConflict());
		perform(get("/profile/me/events").header("Authorization", volunteer("alice")))
				.andExpect(jsonPath("$.joined[0].isActive").value(false));
	}

	@Test
	void organizersCannotJoinTheirOwnEvent() throws Exception {
		long id = createEvent(organizer("greensg"), "Blood drive", 5);
		perform(post("/profile/events/" + id + "/volunteers").header("Authorization", organizer("greensg")))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("You're organizing this event"));
	}

	@Test
	void tokensIssuedBeforeAccountTypesStillWorkAsVolunteers() throws Exception {
		long id = createEvent(organizer("greensg"), "Befriend seniors", 5);
		perform(post("/profile/events/" + id + "/volunteers").header("Authorization", token("oldtimer", null, null, null)))
				.andExpect(status().isOk());
		perform(post("/profile/events").header("Authorization", token("oldtimer", null, null, null))
				.contentType(MediaType.APPLICATION_JSON).content(body("Nope", 5)))
				.andExpect(status().isForbidden());
	}
}
