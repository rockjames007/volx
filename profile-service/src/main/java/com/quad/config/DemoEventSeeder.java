package com.quad.config;

import com.quad.entity.Address;
import com.quad.entity.Category;
import com.quad.entity.Event;
import com.quad.entity.EventRegistration;
import com.quad.entity.VolunteerPreference;
import com.quad.repository.CategoryJpaRepository;
import com.quad.repository.EventJpaRepository;
import com.quad.repository.EventRegistrationJpaRepository;
import com.quad.repository.VolunteerPreferenceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Fills an empty database with sample events around Singapore, so a demo shows a lively site straight away.
 * The organizations and volunteers are fictional. Dates are relative to startup, so the events are always upcoming,
 * and the README demo accounts get sign-ups and past hours of their own.
 * Only runs when there are no events yet (sample volunteers are also given invitation preferences if they're missing).
 * Disable with volx.demo-data.enabled=false.
 * The GitHub Pages demo (frontend-service/src/demo/demoData.js) shows the same events; keep the two in step.
 */
@Component
@Order(2)
@ConditionalOnProperty(name = "volx.demo-data.enabled", havingValue = "true", matchIfMissing = true)
public class DemoEventSeeder implements CommandLineRunner {

    static final String DEMO_ORGANIZER = "org";
    static final String DEMO_VOLUNTEER = "test";
    private static final String DEMO_VOLUNTEER_NAME = "Test Volunteer";
    private static final String GREEN_SG = "Green Singapore Community";

    static final List<String> VOLUNTEER_NAMES = List.of(
            "Aisyah Rahman", "Wei Jie Tan", "Priya Nair", "Marcus Lim", "Nurul Huda", "Jun Hao Ong",
            "Kavitha Subramaniam", "Daniel Goh", "Siti Aminah", "Ethan Koh", "Farah Iskandar", "Ravi Menon",
            "Chloe Ng", "Hafiz Ismail", "Mei Ling Chua", "Arjun Pillai", "Rachel Teo", "Zul Hakim", "Sarah Lee",
            "Bryan Wong", "Divya Krishnan", "Amirul Hassan", "Grace Yeo", "Kenneth Chew", "Nadia Salleh",
            "Vikram Das", "Jasmine Low", "Irfan Aziz", "Hui Min Seah", "Joel Fernandez");

    // Where each fictional volunteer likes to help (cycled), and the causes in the order interests are picked.
    static final List<String> AREAS = List.of("Tampines", "Ang Mo Kio", "Jurong West", "Bedok", "Toa Payoh",
            "Woodlands", "Sengkang", "Queenstown", "Pasir Ris", "Bishan");
    static final List<String> CAUSES = List.of("Animals", "Community", "Disaster relief", "Education",
            "Environment", "Health");

    /**
     * One sample event. {@code day} is days from today (negative = already happened); {@code joined} counts the
     * fictional volunteers signed up, on top of the demo volunteer when {@code demoVolunteer} is set.
     */
    record Sample(String name, String category, String organizerName, String createdBy, int day, LocalTime start,
                  double hours, int spots, int joined, boolean demoVolunteer, String area, String address,
                  String pincode, String description) {
    }

    static final List<Sample> SAMPLES = List.of(
            new Sample("Beach clean-up at Pasir Ris", "Environment", "Coastline Keepers", "coastlinekeepers",
                    3, LocalTime.of(8, 0), 3, 40, 23, false, "Pasir Ris", "Pasir Ris Park, Carpark C", "519639",
                    "Help us clear plastic and fishing line from the shore before it washes back out to sea. "
                            + "Gloves, tongs and bags are provided. Bring a hat, a water bottle and shoes you don't mind getting sandy. "
                            + "We finish with a quick tally of what we found."),
            new Sample("Tree planting at Sengkang Riverside Park", "Environment", GREEN_SG, DEMO_ORGANIZER,
                    6, LocalTime.of(8, 30), 3, 30, 12, true, "Sengkang", "Sengkang Riverside Park, Anchorvale St", "544964",
                    "Plant native saplings along the riverside with our park team. No gardening experience needed: "
                            + "we'll show you how to dig, plant and mulch. Wear covered shoes and bring water. Tools and gloves provided."),
            new Sample("Weekend maths tutoring for Primary 5", "Education", "Kampung Tutors", "kampungtutors",
                    4, LocalTime.of(10, 0), 2, 10, 7, false, "Toa Payoh", "Blk 177 Toa Payoh Central, Level 2", "310177",
                    "Sit with a small group of Primary 5 pupils and help them work through fractions and word problems. "
                            + "Worksheets and answer keys are ready for you. Patience matters more than being a maths whiz."),
            new Sample("Reading buddies at Jurong West library", "Education", "Kampung Tutors", "kampungtutors",
                    10, LocalTime.of(14, 0), 2, 12, 4, false, "Jurong West", "Jurong West Public Library, Jurong West St 64", "648886",
                    "Read picture books with children aged 5 to 8 and help them sound out new words. "
                            + "Great for first-time volunteers. English, Mandarin, Malay and Tamil readers are all welcome."),
            new Sample("Blood donation drive helpers", "Health", "Heartland Health Volunteers", "heartlandhealth",
                    8, LocalTime.of(9, 0), 6, 20, 18, false, "Tampines", "Our Tampines Hub, Festive Plaza", "528523",
                    "Welcome donors, guide them through registration and hand out drinks and snacks after they donate. "
                            + "You don't need to donate yourself. Shifts are flexible: stay for two hours or the whole day."),
            new Sample("Befriending seniors: kopi and a chat", "Community", "Silver Friends SG", "silverfriends",
                    2, LocalTime.of(15, 0), 2, 15, 9, true, "Ang Mo Kio", "Blk 420 Ang Mo Kio Ave 10, Activity Centre", "560420",
                    "Spend an afternoon with seniors who live alone: play a round of carrom, share kopi and swap stories. "
                            + "A short briefing at the start covers everything you need. Dialect speakers especially welcome."),
            new Sample("Pack and deliver food rations", "Community", "Heartland Food Share", "heartlandfood",
                    5, LocalTime.of(9, 0), 4, 25, 25, false, "Bedok", "Blk 216 Bedok North St 1, void deck", "460216",
                    "Pack rice, oil and canned food into bags, then deliver them door to door to families in the estate. "
                            + "Drivers with a car are a big help. Wear comfortable clothes; there is some lifting."),
            new Sample("Dog walking at the shelter", "Animals", "Paws in the Heartlands", "pawsheartlands",
                    7, LocalTime.of(7, 30), 2.5, 12, 5, false, "Sungei Tengah", "Sungei Tengah Rd, Shelter Block B", "699012",
                    "Our shelter dogs need their morning walk and some company. We'll pair you with a calm dog after a "
                            + "10-minute safety briefing. Wear closed shoes. Minimum age 16."),
            new Sample("Adoption day helpers", "Animals", "Paws in the Heartlands", "pawsheartlands",
                    13, LocalTime.of(11, 0), 6, 8, 2, false, "Tiong Bahru", "Tiong Bahru Community Centre, Hall 1", "168898",
                    "Help cats and dogs meet their future families. You'll set up pens, chat with visitors and help with adoption forms. "
                            + "Animal lovers who enjoy talking to people are perfect for this."),
            new Sample("Emergency supply packing", "Disaster relief", GREEN_SG, DEMO_ORGANIZER,
                    9, LocalTime.of(10, 0), 4, 30, 11, false, "Jurong East", "Jurong East Community Club, Multi-purpose Hall", "609601",
                    "Pack hygiene kits and dry rations for families affected by the floods in the region. "
                            + "It's an assembly line, so it's easy to join at any point. Great for groups of friends or colleagues."),
            new Sample("Community garden harvest day", "Environment", GREEN_SG, DEMO_ORGANIZER,
                    15, LocalTime.of(8, 0), 3, 20, 3, false, "Queenstown", "Commonwealth Close community garden", "140042",
                    "Harvest kang kong, chilli and pandan with the residents who tend this garden, then help share it out "
                            + "to neighbours. Bring a hat and a bag for your own share."),
            new Sample("Coding club for teens", "Education", "Kampung Tutors", "kampungtutors",
                    12, LocalTime.of(14, 0), 3, 15, 6, false, "Woodlands", "Woodlands Regional Library, Level 3", "738875",
                    "Help teenagers build their first simple game in Scratch or Python. If you can write a loop, you can help. "
                            + "Laptops are provided."),
            // Already happened: these give the demo accounts attendance records and verified hours.
            new Sample("Beach clean-up at East Coast Park", "Environment", "Coastline Keepers", "coastlinekeepers",
                    -14, LocalTime.of(8, 0), 3, 40, 26, true, "Marine Parade", "East Coast Park, Area C", "449876",
                    "Our monthly clean-up of the East Coast shoreline."),
            new Sample("Tree planting at Bishan-Ang Mo Kio Park", "Environment", GREEN_SG, DEMO_ORGANIZER,
                    -10, LocalTime.of(8, 30), 3, 25, 15, true, "Bishan", "Bishan-Ang Mo Kio Park, Pond Gardens", "569931",
                    "Planting native trees along the river with the park team."),
            new Sample("Reading buddies at Jurong West library", "Education", "Kampung Tutors", "kampungtutors",
                    -21, LocalTime.of(14, 0), 2, 12, 9, true, "Jurong West", "Jurong West Public Library, Jurong West St 64", "648886",
                    "Reading picture books with young children."),
            new Sample("Pack and deliver food rations", "Community", "Heartland Food Share", "heartlandfood",
                    -30, LocalTime.of(9, 0), 4, 25, 20, true, "Bedok", "Blk 216 Bedok North St 1, void deck", "460216",
                    "Packing and delivering rations to families in the estate.")
    );

    private final CategoryJpaRepository categories;
    private final EventJpaRepository events;
    private final EventRegistrationJpaRepository registrations;
    private final VolunteerPreferenceRepository preferences;

    public DemoEventSeeder(CategoryJpaRepository categories, EventJpaRepository events,
                           EventRegistrationJpaRepository registrations, VolunteerPreferenceRepository preferences) {
        this.categories = categories;
        this.events = events;
        this.registrations = registrations;
        this.preferences = preferences;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Map<String, Category> byName = categories.findAll().stream()
                .collect(Collectors.toMap(Category::getCategory, Function.identity(), (a, b) -> a));
        LocalDateTime now = LocalDateTime.now();
        if (events.count() > 0) {
            // Sample events from an earlier version: give their volunteers preferences too, so they can be invited.
            if (registrations.existsByUsername(usernameOf(VOLUNTEER_NAMES.get(0)))) {
                addPreferences(byName, now);
            }
            return;
        }
        for (int i = 0; i < SAMPLES.size(); i++) {
            Sample sample = SAMPLES.get(i);
            Category category = byName.get(sample.category());
            if (category == null) {
                continue;
            }
            Event event = events.save(toEvent(sample, category, now));
            addVolunteers(event, sample, i);
        }
        addPreferences(byName, now);
    }

    // The fictional volunteers (and the demo volunteer) have opted in to invitations, so organizers can find them.
    private void addPreferences(Map<String, Category> byName, LocalDateTime now) {
        for (int i = 0; i < VOLUNTEER_NAMES.size(); i++) {
            String name = VOLUNTEER_NAMES.get(i);
            savePreference(usernameOf(name), name, AREAS.get(i % AREAS.size()),
                    List.of(CAUSES.get(i % CAUSES.size()), CAUSES.get((i + 2) % CAUSES.size())), availability(i), byName, now);
        }
        savePreference(DEMO_VOLUNTEER, DEMO_VOLUNTEER_NAME, "Ang Mo Kio", List.of("Community", "Environment"),
                Set.of("SAT_MORNING", "SUN_MORNING", "WED_EVENING"), byName, now);
    }

    // When the i-th fictional volunteer is usually free: mostly weekend mornings, some weekday evenings.
    static Set<String> availability(int i) {
        Set<String> slots = new HashSet<>();
        if (i % 3 != 2) slots.add("SAT_MORNING");
        if (i % 2 == 0) slots.add("SUN_MORNING");
        if (i % 4 == 1) slots.add("SAT_AFTERNOON");
        if (i % 5 == 0) slots.add("SUN_AFTERNOON");
        if (i % 3 == 0) slots.add(List.of("TUE", "WED", "THU").get(i % 9 / 3) + "_EVENING");
        if (i % 7 == 3) slots.add("FRI_EVENING");
        return slots;
    }

    private void savePreference(String username, String name, String area, List<String> causes, Set<String> availability,
                                Map<String, Category> byName, LocalDateTime now) {
        VolunteerPreference existing = preferences.findById(username).orElse(null);
        if (existing != null) {
            // Sample volunteers from before availability existed: add theirs once.
            if (existing.getAvailability().isEmpty()) {
                existing.setAvailability(new HashSet<>(availability));
                preferences.save(existing);
            }
            return;
        }
        VolunteerPreference preference = new VolunteerPreference();
        preference.setUsername(username);
        preference.setName(name);
        preference.setArea(area);
        preference.setInterests(causes.stream().map(byName::get).filter(Objects::nonNull).map(Category::getId)
                .collect(Collectors.toCollection(HashSet::new)));
        preference.setAvailability(new HashSet<>(availability));
        preference.setDiscoverable(true);
        preference.setUpdatedDate(now);
        preferences.save(preference);
    }

    private static Event toEvent(Sample sample, Category category, LocalDateTime now) {
        LocalDate day = LocalDate.now().plusDays(sample.day());
        if (sample.day() < 0) {
            // Past sample events were on Saturdays, like most volunteering.
            day = day.with(TemporalAdjusters.previousOrSame(DayOfWeek.SATURDAY));
        }
        LocalDateTime from = day.atTime(sample.start());
        Event event = new Event();
        event.setName(sample.name());
        event.setDescription(sample.description());
        event.setCategory(category);
        event.setFromDate(from);
        event.setToDate(from.plusMinutes(Math.round(sample.hours() * 60)));
        event.setNoOfParticipant(sample.spots());
        event.setIsActive(true);
        event.setCreatedBy(sample.createdBy());
        event.setOrganizerName(sample.organizerName());
        // Posted a couple of weeks before it happens (upcoming ones: a few days ago).
        LocalDateTime posted = from.minusDays(14);
        event.setCreatedDate(posted.isBefore(now.minusDays(3)) ? posted : now.minusDays(3));

        Address address = new Address();
        address.setAddress(sample.address());
        address.setArea(sample.area());
        address.setState("Singapore");
        address.setCountry("Singapore");
        address.setPincode(sample.pincode());
        event.setAddress(address);
        return event;
    }

    private void addVolunteers(Event event, Sample sample, int eventIndex) {
        LocalDateTime now = LocalDateTime.now();
        boolean past = event.getToDate().isBefore(now);
        // Sign-ups spread evenly between posting and the start (or now, if it hasn't started yet).
        LocalDateTime lastSignup = past ? event.getFromDate().minusHours(2) : now.minusMinutes(30);
        long spread = ChronoUnit.MINUTES.between(event.getCreatedDate(), lastSignup) / (sample.joined() + 2);
        for (int n = 0; n < sample.joined(); n++) {
            // Rotate through the names so each event has a different crowd.
            String name = VOLUNTEER_NAMES.get((eventIndex * 7 + n) % VOLUNTEER_NAMES.size());
            // Past events: roughly one in six didn't turn up.
            Boolean attended = past ? (n % 6 != 5) : null;
            registrations.save(registration(event, usernameOf(name), name, spread * (n + 1), attended, sample.hours(), n));
        }
        if (sample.demoVolunteer()) {
            registrations.save(registration(event, DEMO_VOLUNTEER, DEMO_VOLUNTEER_NAME,
                    spread * (sample.joined() + 1), past ? Boolean.TRUE : null, sample.hours(), sample.joined()));
        }
    }

    private static EventRegistration registration(Event event, String username, String name, long minutesAfterPosting,
                                                  Boolean attended, double hours, int order) {
        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUsername(username);
        registration.setVolunteerName(name);
        registration.setCreatedDate(event.getCreatedDate().plusMinutes(minutesAfterPosting).truncatedTo(ChronoUnit.MINUTES));
        registration.setAttended(attended);
        if (Boolean.TRUE.equals(attended)) {
            registration.setCheckedInAt(event.getFromDate().minusMinutes(10).plusMinutes(order % 20));
            registration.setHours(hours);
            registration.setVerificationCode(UUID.randomUUID().toString());
        }
        return registration;
    }

    static String usernameOf(String name) {
        return name.toLowerCase().replace(' ', '.');
    }
}
