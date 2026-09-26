package com.quad;

import com.quad.entity.Category;
import com.quad.entity.Event;
import com.quad.repository.EventJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProfileControllerTests {

	@Autowired
	MockMvc mockMvc;
	@Autowired
	EventJpaRepository eventJpaRepository;

	@BeforeEach
	void seed() {
		eventJpaRepository.deleteAll();
		Category category = new Category();
		category.setCategory("Environment");
		Event event = new Event();
		event.setName("Beach clean-up");
		event.setCategory(category);
		event.setIsActive(true);
		event.setFromDate(LocalDateTime.now().plusDays(1));
		eventJpaRepository.save(event);
	}

	@Test
	void listsActiveEventsUsingQueryParamPaging() throws Exception {
		MvcResult result = mockMvc.perform(get("/profile/events?page=0&size=5"))
				.andExpect(request().asyncStarted()).andReturn();
		mockMvc.perform(asyncDispatch(result))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].name").value("Beach clean-up"))
				.andExpect(jsonPath("$.content[0].category.category").value("Environment"));
	}

	@Test
	void unknownEventReturns404() throws Exception {
		MvcResult result = mockMvc.perform(get("/profile/events/999999"))
				.andExpect(request().asyncStarted()).andReturn();
		mockMvc.perform(asyncDispatch(result)).andExpect(status().isNotFound());
	}
}
