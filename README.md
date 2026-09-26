JoinTeer: Join In and Volunteer for Causes Across Singapore
===========================================================

JoinTeer (join + volunteer) is a platform designed to address the challenges faced by both volunteers and organizers in the civic engagement space. By leveraging technology, JoinTeer aims to enhance awareness, accessibility, and coordination in the volunteer ecosystem.

Problem Statement
-----------------

- **Limited Awareness:** Many potential volunteers are unaware of available opportunities.
- **Accessibility Barriers:** Physical disabilities, lack of transport, or logistical challenges can hinder participation.
- **Matching Challenges:** Volunteers struggle to find opportunities that align with their interests, while organizers find it difficult to recruit volunteers with the right skills and interests.
- **Lack of Coordination:** Disjointed efforts among volunteer organizations, governmental agencies, and community groups lead to duplication of efforts and missed collaboration opportunities.
- **Inclusivity:** Engaging a diverse population requires ensuring opportunities are inclusive and accessible to individuals from diverse backgrounds.
- **Sustainability:** Sustaining long-term engagement requires ongoing support, resources, and incentives for both volunteers and organizations.

Solution Overview
-----------------

JoinTeer offers several key features to address these challenges:

- **Auto-Matching System:** Organizers can easily match the number of required volunteers with their interests aligned.
- **Interest Highlighting:** Volunteers can highlight their interests, making it easier for organizers to find like-minded candidates.
- **Notification System:** Volunteers receive invitations and suggestions easily, enhancing engagement.
- **Comprehensive Listings:** A comprehensive listing of upcoming opportunities, with suggestions based on interest level, increases awareness.
- **Recognition and Rewards:** Volunteer participation is recognized and calculated in leaderboards with redeemable points, provided by sponsorships or organizers.
- **Partnerships:** Partnerships with government and non-governmental organizations amplify the platform's impact through network and resource leverage.

Getting Started
---------------

JoinTeer is a set of Spring Boot microservices behind an API gateway, plus a React frontend.

| Service | Folder | Port |
|---|---|---|
| Service registry (Eureka) | `eureka-server` | 8999 |
| Authentication (register / login / JWT) | `authentication` | 8005 |
| Profiles & events | `profile-service` | 8001 |
| API gateway (the only URL the frontend talks to) | `api-gateway` | 9000 |
| Web app | `frontend-service` | 3000 |

> The project was previously called Volx; a few internal identifiers such as the `volx.*` config keys and the `VOLX_ALLOWED_ORIGINS` variable keep that name.

### Quickest: run the backend with Docker

Needs only [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine with Compose). Clone the repository (`git clone https://github.com/rockjames007/jointeer.git`), then from its folder run the commands below. This starts PostgreSQL, the service registry, the authentication and profile services and the API gateway:

```
docker compose up -d --build     # first build takes a few minutes
docker compose logs -f           # follow the logs; Ctrl+C to stop following
docker compose down              # stop (add -v to also delete the database)
```

The API gateway is then at `http://localhost:9000`. Data is kept in a Docker volume between restarts. Each service has its own database (`jointeer_auth`, `jointeer_profile`), created automatically on first start. For a public server, copy `.env.example` to `.env` and set a database password, a JWT secret and the allowed website origins. Services run on Singapore time (`TZ`), which event times and check-in windows use.

Then start the website (step 3 below) and open `http://localhost:3000`.

### Without Docker

**Prerequisites:** Java 17+, Maven, Node 18+, and PostgreSQL with two databases, `jointeer_auth` and `jointeer_profile` (user/password `postgres`/`postgres`, see each service's `application.yaml`). Each service needs its own database: they both have a `users` table with different columns.

1. **Clone the repository:** `git clone https://github.com/rockjames007/jointeer.git`
2. **Start the backend**, each in its own terminal and in this order:
   ```
   cd eureka-server   && mvn spring-boot:run
   cd authentication  && mvn spring-boot:run
   cd profile-service && mvn spring-boot:run
   cd api-gateway     && mvn spring-boot:run
   ```
3. **Start the frontend:**
   ```
   cd frontend-service
   npm install
   npm start
   ```
   The app expects the gateway at `http://localhost:9000`; override it with `REACT_APP_API_URL` (see `frontend-service/.env.example`).
4. **Open** `http://localhost:3000` and log in with one of the demo accounts below, or register a new one.

**Running the tests** (no database or Eureka needed; tests use in-memory H2):
```
cd authentication  && mvn test
cd profile-service && mvn test
cd frontend-service && npm test
```

**Configuration for shared environments:** set `SECURITY_JWT_SECRET_KEY` (base64, 256-bit) to the same value for the authentication and profile services, and `VOLX_ALLOWED_ORIGINS` for the gateway if the frontend is not served from `http://localhost:3000`.

### API overview (via the gateway)

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{username, email, password, fullName, role?, organizationName?}` → `{jwt, username, expiresIn, role, fullName, organizationName}`. `role` is `VOLUNTEER` (default) or `ORGANIZER`; organizers must give `organizationName`. The JWT carries `role`, `name` and `org` claims. |
| POST | `/auth/authorize` | `{username, password}`; `username` may be the email |
| GET | `/users/me` | requires `Authorization: Bearer <jwt>` |
| GET | `/profile/events?page=0&size=20&sort=fromDate` | active events that haven't finished, paged; each includes `volunteersJoined` |
| GET | `/profile/events/{id}`, `/profile/events/categories/{categoryId}` | |
| POST | `/profile/events` | organizer accounts only; `{name, categoryId, fromDate, toDate, description?, noOfParticipant?, address?}` |
| PUT | `/profile/events/{id}` | the event's organizer only; same body as POST |
| POST | `/profile/events/{id}/cancel` | the event's organizer only; hides it from the listing and stops sign-ups |
| GET | `/profile/events/{id}/volunteers` | the event's organizer only; who joined and when |
| GET | `/profile/events/{id}/check-in-code` | the event's organizer only; the code in the check-in QR, and when check-in is open (1 hour before the start until 3 hours after the end) |
| POST | `/profile/events/{id}/check-in` | `{code}`; checks the volunteer in (walk-ins are signed up if there's space) and credits the event's scheduled hours |
| PUT | `/profile/events/{id}/volunteers/{username}/attendance` | the event's organizer only; `{attended, hours?}` to mark someone present or a no-show |
| GET | `/profile/me/hours` | the logged-in volunteer's verified hours |
| GET | `/profile/verify/{code}` | public; confirms a certificate's verification code |
| GET | `/profile/categories` | a starter set is created on first startup |
| POST / DELETE | `/profile/events/{id}/volunteers` | join / leave an event (requires login); refuses full or finished events |
| GET | `/profile/me/events` | `{joined, organizing}` for the logged-in user |
| GET | `/profile/volunteers`, `/profile/volunteer/{id}` | |
| GET | `/profile/organizers`, `/profile/organizers/{id}` | |

   
Testing Instructions
---------------
**Test Data for Login** (created automatically by the authentication service on startup; disable with `volx.demo-users.enabled=false`)

Organization:
org@gmail.com org123

Volunteer:
test@gmail.com test123

**Demo Test Link:** https://rockjames007.github.io/jointeer/ (the website only; it shows a "couldn't load events" message unless it can reach a running backend)

**Publishing the demo:** every push to `main` builds `frontend-service` and publishes it to GitHub Pages via `.github/workflows/deploy-pages.yml`. The site path follows the repository name automatically. One-time setup: *Settings → Pages → Build and deployment → Source: GitHub Actions*. To point the published site at a hosted backend, set a repository variable `REACT_APP_API_URL` (*Settings → Secrets and variables → Actions → Variables*).

License
-------

This project is licensed under the MIT License - see the LICENSE file for details.
