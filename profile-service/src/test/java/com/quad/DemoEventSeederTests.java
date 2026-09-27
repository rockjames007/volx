package com.quad;

import com.jayway.jsonpath.JsonPath;
import com.quad.config.DemoEventSeeder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Date;
import java.util.List;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Its own database, so the sample events don't mix with the other tests' events.
@SpringBootTest(properties = {"volx.demo-data.enabled=true", "spring.datasource.url=jdbc:h2:mem:demo;DB_CLOSE_DELAY=-1"})
@AutoConfigureMockMvc
class DemoEventSeederTests {

	@Autowired
	MockMvc mockMvc;
	@Autowired
	DemoEventSeeder seeder;
	@Value("${security.jwt.secret-key}")
	String secretKey;

	private String token(String username, String role) {
		return "Bearer " + Jwts.builder().setSubject(username).claim("role", role)
				.setExpiration(new Date(System.currentTimeMillis() + 60_000))
				.signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)), SignatureAlgorithm.HS256).compact();
	}

	private ResultActions perform(RequestBuilder request) throws Exception {
		ResultActions actions = mockMvc.perform(request);
		MvcResult result = actions.andReturn();
		return result.getRequest().isAsyncStarted() ? mockMvc.perform(asyncDispatch(result)) : actions;
	}

	@Test
	void seedsUpcomingEventsAcrossEveryCause() throws Exception {
		perform(get("/profile/events?size=50"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(12)))
				.andExpect(jsonPath("$.content[*].category.category", hasItem("Disaster relief")))
				.andExpect(jsonPath("$.content[*].category.category", hasItem("Animals")))
				.andExpect(jsonPath("$.content[*].address.area", everyItem(notNullValue())))
				// One event is fully booked, to show what that looks like.
				.andExpect(jsonPath("$.content[?(@.name == 'Pack and deliver food rations')].volunteersJoined", hasItem(25)));
	}

	@Test
	void demoVolunteerHasSignUpsAndVerifiedHours() throws Exception {
		String volunteer = token("test", "VOLUNTEER");
		perform(get("/profile/me/hours").header("Authorization", volunteer))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalHours", is(12.0)))
				.andExpect(jsonPath("$.entries", hasSize(4)))
				.andExpect(jsonPath("$.entries[0].verificationCode", notNullValue()));
		perform(get("/profile/me/events").header("Authorization", volunteer))
				.andExpect(jsonPath("$.joined[*].name", hasItem("Befriending seniors: kopi and a chat")));
	}

	@Test
	void demoOrganizerSeesTheirVolunteers() throws Exception {
		String organizer = token("org", "ORGANIZER");
		MvcResult mine = perform(get("/profile/me/events").header("Authorization", organizer))
				.andExpect(jsonPath("$.organizing", hasSize(4))).andReturn();
		List<Integer> ids = JsonPath.read(mine.getResponse().getContentAsString(),
				"$.organizing[?(@.name == 'Tree planting at Sengkang Riverside Park')].id");
		Integer id = ids.get(0);
		perform(get("/profile/events/" + id + "/volunteers").header("Authorization", organizer))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(13)))
				.andExpect(jsonPath("$[*].name", hasItem("Test Volunteer")));
	}

	@Test
	void runningAgainDoesNotDuplicate() throws Exception {
		seeder.run();
		perform(get("/profile/events?size=50")).andExpect(jsonPath("$.content", hasSize(12)));
	}
}
