// A stand-in for the JoinTeer backend, used by the GitHub Pages demo (REACT_APP_DEMO=true). It answers the same
// requests as the real API from sample data kept in this browser, following the same rules, so every screen works
// without a server. Changes stay in this browser and the sample data starts afresh each day.
import { CATEGORIES, DEMO_ACCOUNTS, SAMPLES, VOLUNTEER_NAMES } from './demoData';

const STORAGE_KEY = 'jointeer.demo';
const VERSION = 1;
const HOUR = 60 * 60 * 1000;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Times travel as local date-times without a zone ("2026-10-03T08:00:00"), like the real API.
const pad = (n) => String(n).padStart(2, '0');
export const toLocalIso = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
const parse = (value) => (value ? new Date(value) : null);
const todayKey = () => toLocalIso(new Date()).slice(0, 10);
const randomId = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
const newCheckInCode = () => Array.from({ length: 8 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
const usernameOf = (name) => name.toLowerCase().replace(/ /g, '.');

export function seed(now = new Date()) {
  const categories = CATEGORIES.map(([category, categoryDescription], i) => ({ id: String(i + 1), category, categoryDescription }));
  const categoryByName = Object.fromEntries(categories.map((c) => [c.category, c]));
  const events = [];
  const registrations = [];

  SAMPLES.forEach((sample, index) => {
    const [hour, minute] = sample.start.split(':').map(Number);
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() + sample.day, hour, minute);
    const to = new Date(from.getTime() + sample.hours * HOUR);
    const posted = new Date(Math.min(from.getTime() - 14 * 24 * HOUR, now.getTime() - 3 * 24 * HOUR));
    const id = index + 1;
    events.push({
      id,
      name: sample.name,
      description: sample.description,
      category: categoryByName[sample.category],
      address: { address: sample.address, area: sample.area, state: 'Singapore', country: 'Singapore', pincode: sample.pincode },
      bgImage: null,
      fromDate: toLocalIso(from),
      toDate: toLocalIso(to),
      isActive: true,
      noOfParticipant: sample.spots,
      createdBy: sample.org[1],
      organizerName: sample.org[0],
      createdDate: toLocalIso(posted),
      checkInCode: null,
    });

    const past = to < now;
    // Sign-ups spread evenly between posting and the start (or now, if it hasn't started yet).
    const lastSignup = past ? from.getTime() - 2 * HOUR : now.getTime() - HOUR / 2;
    const spread = (lastSignup - posted.getTime()) / (sample.joined + 2);
    const people = VOLUNTEER_NAMES.map((name) => [usernameOf(name), name]);
    const crowd = Array.from({ length: sample.joined }, (_, n) => people[(index * 7 + n) % people.length]);
    if (sample.demoVolunteer) crowd.push(['test', 'Test Volunteer']);
    crowd.forEach(([username, volunteerName], n) => {
      // Past events: roughly one in six fictional volunteers didn't turn up.
      const attended = past ? (username === 'test' || n % 6 !== 5) : null;
      registrations.push({
        eventId: id,
        username,
        volunteerName,
        createdDate: toLocalIso(new Date(posted.getTime() + spread * (n + 1))),
        attended,
        checkedInAt: attended ? toLocalIso(new Date(from.getTime() - (10 - (n % 20)) * 60 * 1000)) : null,
        hours: attended ? sample.hours : null,
        verificationCode: attended ? randomId() : null,
      });
    });
  });

  return {
    version: VERSION,
    seededOn: todayKey(),
    nextEventId: events.length + 1,
    users: DEMO_ACCOUNTS.map((account) => ({ ...account })),
    categories,
    events,
    registrations,
  };
}

let memory = null;

function load() {
  if (memory && memory.seededOn === todayKey()) return memory;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored && stored.version === VERSION && stored.seededOn === todayKey()) {
      memory = stored;
      return memory;
    }
  } catch (e) {
    // Unreadable or blocked storage: start from the sample data.
  }
  memory = seed();
  save();
  return memory;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch (e) {
    // Storage is full or blocked: changes last until the page is reloaded.
  }
}

export function resetDemo() {
  memory = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Nothing to clear.
  }
}

// ---- Helpers mirroring the backend's rules ----

const displayName = (user) =>
  (user.role === 'ORGANIZER' && user.organizationName) ? user.organizationName : (user.fullName || user.username);

const authResponse = (user) => ({
  jwt: `demo.${user.username}`,
  username: user.username,
  expiresIn: 24 * HOUR,
  role: user.role,
  fullName: user.fullName,
  organizationName: user.organizationName,
});

function caller(db, token) {
  const username = token && token.startsWith('demo.') ? token.slice(5) : null;
  const user = db.users.find((u) => u.username === username);
  if (!user) throw new ApiError(401, 'Please log in first');
  return user;
}

function requireEvent(db, id) {
  const event = db.events.find((e) => String(e.id) === String(id));
  if (!event) throw new ApiError(404, 'Event not found');
  return event;
}

function requireOwnEvent(db, id, user) {
  const event = requireEvent(db, id);
  if (event.createdBy !== user.username) throw new ApiError(403, "Only this event's organizer can do that");
  return event;
}

const registrationsFor = (db, eventId) => db.registrations.filter((r) => r.eventId === eventId);
const endOf = (event) => parse(event.toDate || event.fromDate);
const opensAt = (event) => new Date(parse(event.fromDate).getTime() - HOUR);
const closesAt = (event) => new Date(endOf(event).getTime() + 3 * HOUR);

function toDto(db, event) {
  const { checkInCode, ...dto } = event;
  return { ...dto, volunteersJoined: registrationsFor(db, event.id).length };
}

function scheduledHours(event) {
  const hours = (parse(event.toDate) - parse(event.fromDate)) / HOUR;
  return Math.max(0.5, Math.round(hours * 2) / 2);
}

function toEntry(db, registration) {
  const event = requireEvent(db, registration.eventId);
  return {
    eventId: event.id,
    eventName: event.name,
    organizerName: event.organizerName,
    category: event.category?.category || null,
    place: event.address?.area || null,
    fromDate: event.fromDate,
    toDate: event.toDate,
    volunteerName: registration.volunteerName || registration.username,
    hours: registration.hours,
    verificationCode: registration.verificationCode,
  };
}

const signupDto = (r) => ({
  username: r.username,
  name: r.volunteerName || r.username,
  joinedAt: r.createdDate,
  attended: r.attended,
  checkedInAt: r.checkedInAt,
  hours: r.hours,
});

function markPresent(registration, event, hours) {
  registration.attended = true;
  registration.hours = hours != null ? hours : scheduledHours(event);
  if (!registration.verificationCode) registration.verificationCode = randomId();
}

function applyDetails(db, event, body) {
  if (!body?.name?.trim()) throw new ApiError(400, 'Please give the event a name');
  if (!body.fromDate || !body.toDate) throw new ApiError(400, 'Please choose when the event starts and ends');
  if (!(parse(body.toDate) > parse(body.fromDate))) throw new ApiError(400, 'The end date must be after the start date');
  const category = db.categories.find((c) => String(c.id) === String(body.categoryId));
  if (!category) throw new ApiError(400, 'Unknown category');
  event.name = body.name.trim();
  event.description = body.description || '';
  event.category = category;
  event.fromDate = toLocalIso(parse(body.fromDate));
  event.toDate = toLocalIso(parse(body.toDate));
  event.noOfParticipant = body.noOfParticipant ?? null;
  if (body.address) {
    event.address = { ...(event.address || {}), ...body.address };
  }
}

const sortByStart = (a, b) => parse(a.fromDate) - parse(b.fromDate);

// ---- Routes ----

const routes = [
  ['POST', /^\/auth\/authorize$/, (db, { body }) => {
    const login = String(body?.username || '').trim().toLowerCase();
    const user = db.users.find((u) => u.username.toLowerCase() === login || (u.email || '').toLowerCase() === login);
    if (!user || user.password !== body?.password) throw new ApiError(401, 'Incorrect username or password');
    return authResponse(user);
  }],

  ['POST', /^\/auth\/register$/, (db, { body }) => {
    const username = String(body?.username || '').trim();
    const email = String(body?.email || '').trim();
    if (!username || !email || !body?.password) throw new ApiError(400, 'Please fill in every field');
    if (!body.fullName?.trim()) throw new ApiError(400, 'Please tell us your name');
    const role = body.role === 'ORGANIZER' ? 'ORGANIZER' : 'VOLUNTEER';
    if (role === 'ORGANIZER' && !body.organizationName?.trim()) throw new ApiError(400, "Please enter your organization's name");
    if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) throw new ApiError(409, 'That username is taken');
    if (db.users.some((u) => (u.email || '').toLowerCase() === email.toLowerCase())) throw new ApiError(409, 'An account with that email already exists');
    const user = {
      username, email, password: body.password, role,
      fullName: body.fullName.trim(),
      organizationName: role === 'ORGANIZER' ? body.organizationName.trim() : null,
    };
    db.users.push(user);
    return authResponse(user);
  }],

  ['GET', /^\/profile\/categories$/, (db) => [...db.categories].sort((a, b) => a.category.localeCompare(b.category))],

  ['GET', /^\/profile\/events$/, (db, { query }) => {
    const now = new Date();
    const upcoming = db.events.filter((e) => e.isActive && endOf(e) > now).sort(sortByStart);
    const size = Number(query.get('size')) || 20;
    const page = Number(query.get('page')) || 0;
    const content = upcoming.slice(page * size, (page + 1) * size).map((e) => toDto(db, e));
    return { content, totalElements: upcoming.length, totalPages: Math.ceil(upcoming.length / size), number: page, size };
  }],

  ['GET', /^\/profile\/events\/categories\/([^/]+)$/, (db, { params, query }) => {
    const now = new Date();
    const size = Number(query.get('size')) || 20;
    const matching = db.events
      .filter((e) => e.isActive && endOf(e) > now && String(e.category?.id) === params[0])
      .sort(sortByStart);
    return { content: matching.slice(0, size).map((e) => toDto(db, e)), totalElements: matching.length };
  }],

  ['POST', /^\/profile\/events$/, (db, { user, body }) => {
    if (user.role !== 'ORGANIZER') throw new ApiError(403, 'Only organizer accounts can post events');
    const event = {
      id: db.nextEventId++,
      bgImage: null,
      isActive: true,
      createdBy: user.username,
      organizerName: displayName(user),
      createdDate: toLocalIso(new Date()),
      checkInCode: null,
    };
    applyDetails(db, event, body);
    db.events.push(event);
    return toDto(db, event);
  }, true],

  ['GET', /^\/profile\/events\/(\d+)$/, (db, { params }) => toDto(db, requireEvent(db, params[0]))],

  ['PUT', /^\/profile\/events\/(\d+)$/, (db, { params, user, body }) => {
    const event = requireOwnEvent(db, params[0], user);
    if (!event.isActive) throw new ApiError(409, "Cancelled events can't be edited");
    const joined = registrationsFor(db, event.id).length;
    if (body?.noOfParticipant != null && body.noOfParticipant < joined) {
      throw new ApiError(400, `${joined} volunteers have already joined, so you need at least ${joined} spots`);
    }
    applyDetails(db, event, body);
    return toDto(db, event);
  }, true],

  ['POST', /^\/profile\/events\/(\d+)\/cancel$/, (db, { params, user }) => {
    const event = requireOwnEvent(db, params[0], user);
    event.isActive = false;
    return toDto(db, event);
  }, true],

  ['GET', /^\/profile\/events\/(\d+)\/volunteers$/, (db, { params, user }) => {
    const event = requireOwnEvent(db, params[0], user);
    return registrationsFor(db, event.id)
      .sort((a, b) => parse(a.createdDate) - parse(b.createdDate))
      .map(signupDto);
  }, true],

  ['POST', /^\/profile\/events\/(\d+)\/volunteers$/, (db, { params, user }) => {
    const event = requireEvent(db, params[0]);
    if (event.createdBy === user.username) throw new ApiError(409, "You're organizing this event");
    if (!event.isActive || endOf(event) < new Date()) throw new ApiError(409, 'This event is no longer taking volunteers');
    const signups = registrationsFor(db, event.id);
    if (signups.some((r) => r.username === user.username)) throw new ApiError(409, 'You have already joined this event');
    if (event.noOfParticipant != null && signups.length >= event.noOfParticipant) throw new ApiError(409, 'This event is full');
    db.registrations.push({
      eventId: event.id, username: user.username, volunteerName: displayName(user), createdDate: toLocalIso(new Date()),
      attended: null, checkedInAt: null, hours: null, verificationCode: null,
    });
    return toDto(db, event);
  }, true],

  ['DELETE', /^\/profile\/events\/(\d+)\/volunteers$/, (db, { params, user }) => {
    const event = requireEvent(db, params[0]);
    db.registrations = db.registrations.filter((r) => !(r.eventId === event.id && r.username === user.username));
    return toDto(db, event);
  }, true],

  ['GET', /^\/profile\/me\/events$/, (db, { user }) => {
    const joined = db.registrations
      .filter((r) => r.username === user.username)
      .map((r) => requireEvent(db, r.eventId))
      .sort(sortByStart)
      .map((e) => toDto(db, e));
    const organizing = db.events.filter((e) => e.createdBy === user.username).sort(sortByStart).map((e) => toDto(db, e));
    return { joined, organizing };
  }, true],

  ['GET', /^\/profile\/events\/(\d+)\/check-in-code$/, (db, { params, user }) => {
    const event = requireOwnEvent(db, params[0], user);
    if (!event.checkInCode) event.checkInCode = newCheckInCode();
    return { code: event.checkInCode, opensAt: toLocalIso(opensAt(event)), closesAt: toLocalIso(closesAt(event)) };
  }, true],

  ['POST', /^\/profile\/events\/(\d+)\/check-in$/, (db, { params, user, body }) => {
    const event = requireEvent(db, params[0]);
    const code = String(body?.code || '').trim();
    if (!event.checkInCode || event.checkInCode.toUpperCase() !== code.toUpperCase()) {
      throw new ApiError(400, "This check-in code isn't valid for this event");
    }
    if (!event.isActive) throw new ApiError(409, 'This event was cancelled');
    const now = new Date();
    if (now < opensAt(event)) throw new ApiError(409, 'Check-in opens an hour before the event starts');
    if (now > closesAt(event)) throw new ApiError(409, 'Check-in for this event has closed');
    if (event.createdBy === user.username) throw new ApiError(409, "You're organizing this event");

    let registration = db.registrations.find((r) => r.eventId === event.id && r.username === user.username);
    if (!registration) {
      if (event.noOfParticipant != null && registrationsFor(db, event.id).length >= event.noOfParticipant) {
        throw new ApiError(409, "This event is full, so walk-in check-in isn't possible");
      }
      registration = {
        eventId: event.id, username: user.username, volunteerName: displayName(user), createdDate: toLocalIso(now),
        attended: null, checkedInAt: null, hours: null, verificationCode: null,
      };
      db.registrations.push(registration);
    }
    const already = registration.attended === true;
    if (!already) {
      registration.checkedInAt = toLocalIso(now);
      markPresent(registration, event, null);
    }
    return {
      eventId: event.id, eventName: event.name, hours: registration.hours,
      verificationCode: registration.verificationCode, alreadyCheckedIn: already,
    };
  }, true],

  ['PUT', /^\/profile\/events\/(\d+)\/volunteers\/([^/]+)\/attendance$/, (db, { params, user, body }) => {
    const event = requireOwnEvent(db, params[0], user);
    if (new Date() < opensAt(event)) throw new ApiError(409, 'Attendance can be recorded once the event is about to start');
    const username = decodeURIComponent(params[1]);
    const registration = db.registrations.find((r) => r.eventId === event.id && r.username === username);
    if (!registration) throw new ApiError(404, "This volunteer hasn't joined the event");
    if (body?.attended) {
      markPresent(registration, event, body.hours);
    } else {
      // A no-show: withdraw any hours and invalidate the certificate.
      registration.attended = false;
      registration.hours = null;
      registration.verificationCode = null;
    }
    return signupDto(registration);
  }, true],

  ['GET', /^\/profile\/me\/hours$/, (db, { user }) => {
    const entries = db.registrations
      .filter((r) => r.username === user.username && r.attended === true)
      .map((r) => toEntry(db, r))
      .sort((a, b) => parse(b.fromDate) - parse(a.fromDate));
    return { totalHours: entries.reduce((sum, e) => sum + (e.hours || 0), 0), entries };
  }, true],

  ['GET', /^\/profile\/verify\/([^/]+)$/, (db, { params }) => {
    const code = decodeURIComponent(params[0]);
    const registration = db.registrations.find((r) => r.verificationCode === code && r.attended === true);
    if (!registration) throw new ApiError(404, 'No verified record matches this code');
    return toEntry(db, registration);
  }],
];

// Answers a request the way the real API would: resolves with the JSON body, or rejects with its error message.
export async function demoRequest(path, { method = 'GET', body, token } = {}) {
  // A short pause, so loading states look the way they will with a real server.
  await new Promise((resolve) => setTimeout(resolve, 120));
  const url = new URL(path, 'http://demo.local');
  const db = load();
  for (const [routeMethod, pattern, handler, needsLogin] of routes) {
    const match = routeMethod === method && url.pathname.match(pattern);
    if (!match) continue;
    try {
      const user = needsLogin ? caller(db, token) : null;
      // Work on a copy, so a request that fails part-way changes nothing.
      const draft = JSON.parse(JSON.stringify(db));
      const result = handler(draft, { params: match.slice(1), query: url.searchParams, body, user });
      memory = draft;
      save();
      return JSON.parse(JSON.stringify(result));
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(500, 'Something went wrong in the demo');
    }
  }
  throw new ApiError(404, 'Not available in the demo');
}
