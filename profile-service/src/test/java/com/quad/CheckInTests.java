package com.quad;

import com.jayway.jsonpath.JsonPath;
import com.quad.entity.Address;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CheckInTests {

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

	@BeforeEach
	void setUp() {
		eventRegistrationJpaRepository.deleteAll();
		eventJpaRepository.deleteAll();
	}

	// An event owned by "greensg" starting in `startsInMinutes` (negative = already started).
	private long event(long startsInMinutes, long lengthMinutes, Integer spots) {
		Address address = new Address();
		address.setArea("East Coast Park");
		address.setPincode("449876");
		Event event = new Event();
		event.setName("Beach clean-up");
		event.setCategory(categoryJpaRepository.findAll().get(0));
		event.setFromDate(LocalDateTime.now().plusMinutes(startsInMinutes));
		event.setToDate(LocalDateTime.now().plusMinutes(startsInMinutes + lengthMinutes));
		event.setNoOfParticipant(spots);
		event.setIsActive(true);
		event.setCreatedBy("greensg");
		event.setOrganizerName("Green SG");
		event.setAddress(address);
		return eventJpaRepository.save(event).getId();
	}

	private String token(String username, String role, String name) {
		return "Bearer " + Jwts.builder().setSubject(username).claim("role", role).claim("name", name)
				.setExpiration(new Date(System.currentTimeMillis() + 60_000))
				.signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)), SignatureAlgorithm.HS256).compact();
	}

	// A method, not a field: the secret key is injected after construction.
	private String organizer() {
		return token("greensg", "ORGANIZER", "Mei Lin Tan");
	}

	private String volunteer(String username) {
		return token(username, "VOLUNTEER", "Volunteer " + username);
	}

	private ResultActions perform(RequestBuilder request) throws Exception {
		ResultActions actions = mockMvc.perform(request);
		MvcResult result = actions.andReturn();
		return result.getRequest().isAsyncStarted() ? mockMvc.perform(asyncDispatch(result)) : actions;
	}

	private String code(long eventId) throws Exception {
		MvcResult result = perform(get("/profile/events/" + eventId + "/check-in-code").header("Authorization", organizer()))
				.andExpect(status().isOk()).andReturn();
		return JsonPath.read(result.getResponse().getContentAsString(), "$.code");
	}

	private ResultActions checkIn(long eventId, String auth, String code) throws Exception {
		return perform(post("/profile/events/" + eventId + "/check-in").header("Authorization", auth)
				.contentType(MediaType.APPLICATION_JSON).content("{\"code\":\"" + code + "\"}"));
	}

	private void join(long eventId, String auth) throws Exception {
		perform(post("/profile/events/" + eventId + "/volunteers").header("Authorization", auth)).andExpect(status().isOk());
	}

	@Test
	void onlyTheOrganizerSeesTheCheckInCodeAndItStaysTheSame() throws Exception {
		long id = event(-30, 150, 10);
		String code = code(id);
		assertEquals(8, code.length());
		assertEquals(code, code(id));
		perform(get("/profile/events/" + id + "/check-in-code").header("Authorization", volunteer("alice")))
				.andExpect(status().isForbidden());
		perform(get("/profile/events/" + id + "/check-in-code")).andExpect(status().isUnauthorized());
	}

	@Test
	void volunteerChecksInAndGetsVerifiedHours() throws Exception {
		long id = event(-30, 150, 10);
		join(id, volunteer("alice"));
		String code = code(id);

		MvcResult first = checkIn(id, volunteer("alice"), code.toLowerCase())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.hours").value(2.5))
				.andExpect(jsonPath("$.alreadyCheckedIn").value(false))
				.andReturn();
		String verification = JsonPath.read(first.getResponse().getContentAsString(), "$.verificationCode");

		checkIn(id, volunteer("alice"), code)
				.andExpect(jsonPath("$.alreadyCheckedIn").value(true))
				.andExpect(jsonPath("$.verificationCode").value(verification));

		perform(get("/profile/events/" + id + "/volunteers").header("Authorization", organizer()))
				.andExpect(jsonPath("$[0].attended").value(true))
				.andExpect(jsonPath("$[0].checkedInAt").isNotEmpty())
				.andExpect(jsonPath("$[0].hours").value(2.5));
	}

	@Test
	void checkInIsRejectedWithTheWrongCodeOrOutsideTheWindow() throws Exception {
		long open = event(-30, 150, 10);
		join(open, volunteer("alice"));
		code(open);
		checkIn(open, volunteer("alice"), "WRONG123").andExpect(status().isBadRequest());

		long later = event(180, 120, 10);
		join(later, volunteer("alice"));
		checkIn(later, volunteer("alice"), code(later))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("Check-in opens an hour before the event starts"));

		long finished = event(-600, 120, 10);
		checkIn(finished, volunteer("alice"), code(finished))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("Check-in for this event has closed"));

		long cancelled = event(-30, 150, 10);
		String cancelledCode = code(cancelled);
		perform(post("/profile/events/" + cancelled + "/cancel").header("Authorization", organizer()));
		checkIn(cancelled, volunteer("alice"), cancelledCode).andExpect(status().isConflict());
	}

	@Test
	void walkInsAreSignedUpWhenThereIsSpace() throws Exception {
		long id = event(-30, 60, 1);
		String code = code(id);
		checkIn(id, volunteer("walkin"), code).andExpect(status().isOk()).andExpect(jsonPath("$.hours").value(1.0));
		perform(get("/profile/events/" + id + "/volunteers").header("Authorization", organizer()))
				.andExpect(jsonPath("$[0].username").value("walkin"))
				.andExpect(jsonPath("$[0].name").value("Volunteer walkin"));

		checkIn(id, volunteer("latecomer"), code)
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("This event is full, so walk-in check-in isn't possible"));
	}

	@Test
	void organizerCanMarkAttendanceByHandAndWithdrawIt() throws Exception {
		long id = event(-30, 150, 10);
		join(id, volunteer("nophone"));

		perform(put("/profile/events/" + id + "/volunteers/nophone/attendance").header("Authorization", organizer())
				.contentType(MediaType.APPLICATION_JSON).content("{\"attended\":true,\"hours\":4}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.attended").value(true))
				.andExpect(jsonPath("$.hours").value(4.0));
		perform(get("/profile/me/hours").header("Authorization", volunteer("nophone")))
				.andExpect(jsonPath("$.totalHours").value(4.0));
		String verification = JsonPath.read(perform(get("/profile/me/hours").header("Authorization", volunteer("nophone")))
				.andReturn().getResponse().getContentAsString(), "$.entries[0].verificationCode");
		perform(get("/profile/verify/" + verification)).andExpect(status().isOk());

		perform(put("/profile/events/" + id + "/volunteers/nophone/attendance").header("Authorization", organizer())
				.contentType(MediaType.APPLICATION_JSON).content("{\"attended\":false}"))
				.andExpect(jsonPath("$.attended").value(false))
				.andExpect(jsonPath("$.hours").doesNotExist());
		perform(get("/profile/verify/" + verification)).andExpect(status().isNotFound());
		perform(get("/profile/me/hours").header("Authorization", volunteer("nophone")))
				.andExpect(jsonPath("$.totalHours").value(0.0));

		perform(put("/profile/events/" + id + "/volunteers/nophone/attendance").header("Authorization", volunteer("nophone"))
				.contentType(MediaType.APPLICATION_JSON).content("{\"attended\":true}"))
				.andExpect(status().isForbidden());
		perform(put("/profile/events/" + id + "/volunteers/nophone/attendance").header("Authorization", organizer())
				.contentType(MediaType.APPLICATION_JSON).content("{\"attended\":true,\"hours\":30}"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void attendanceCannotBeRecordedLongBeforeTheEvent() throws Exception {
		long id = event(24 * 60, 120, 10);
		join(id, volunteer("early"));
		perform(put("/profile/events/" + id + "/volunteers/early/attendance").header("Authorization", organizer())
				.contentType(MediaType.APPLICATION_JSON).content("{\"attended\":true}"))
				.andExpect(status().isConflict());
	}

	@Test
	void hoursRecordAndPublicVerification() throws Exception {
		long first = event(-30, 120, 10);
		long second = event(-20, 180, 10);
		join(first, volunteer("alice"));
		join(second, volunteer("alice"));
		checkIn(first, volunteer("alice"), code(first));
		checkIn(second, volunteer("alice"), code(second));

		MvcResult record = perform(get("/profile/me/hours").header("Authorization", volunteer("alice")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalHours").value(5.0))
				.andExpect(jsonPath("$.entries.length()").value(2))
				.andReturn();
		String verification = JsonPath.read(record.getResponse().getContentAsString(), "$.entries[0].verificationCode");

		perform(get("/profile/verify/" + verification))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.volunteerName").value("Volunteer alice"))
				.andExpect(jsonPath("$.organizerName").value("Green SG"))
				.andExpect(jsonPath("$.place").value("East Coast Park, Singapore 449876"))
				.andExpect(jsonPath("$.eventName").value("Beach clean-up"));
		perform(get("/profile/verify/not-a-real-code")).andExpect(status().isNotFound());
		perform(get("/profile/me/hours")).andExpect(status().isUnauthorized());
	}
}
