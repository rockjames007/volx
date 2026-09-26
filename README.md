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

> The project was previously called Volx; internal identifiers such as the `volx` database, the `volx.*` config keys and the repository name keep that name.

**Prerequisites:** Java 17+, Maven, Node 18+, and PostgreSQL with a database named `volx` (user/password `postgres`/`postgres`, see each service's `application.yaml`).

1. **Clone the repository:** `git clone https://github.com/rockjames007/volx.git`
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
| POST | `/auth/register` | `{username, email, password}` → `{jwt, username, expiresIn}` |
| POST | `/auth/authorize` | `{username, password}`; `username` may be the email |
| GET | `/users/me` | requires `Authorization: Bearer <jwt>` |
| GET | `/profile/events?page=0&size=20&sort=fromDate` | active events that haven't finished, paged; each includes `volunteersJoined` |
| GET | `/profile/events/{id}`, `/profile/events/categories/{categoryId}` | |
| POST | `/profile/events` | requires `Authorization: Bearer <jwt>`; `{name, categoryId, fromDate, toDate, description?, noOfParticipant?, address?}` |
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

**Demo Test Link:** https://rockjames007.github.io/volx/ 

License
-------

This project is licensed under the MIT License - see the LICENSE file for details.
