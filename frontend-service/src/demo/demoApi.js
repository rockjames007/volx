// A stand-in for the JoinTeer backend, used by the GitHub Pages demo (REACT_APP_DEMO=true). It answers the same
// requests as the real API from sample data kept in this browser, following the same rules, so every screen works
// without a server. Changes stay in this browser and the sample data starts afresh each day.
import { AREAS, CATEGORIES, DEMO_ACCOUNTS, SAMPLES, VOLUNTEER_NAMES, availabilityOf } from './demoData';
import { DAYS, PARTS } from '../lib/slots';

const STORAGE_KEY = 'jointeer.demo';
const VERSION = 3;
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
    // Past sample events were on Saturdays, like most volunteering (same as DemoEventSeeder).
    if (sample.day < 0) from.setDate(from.getDate() - ((from.getDay() + 1) % 7));
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

  // The fictional volunteers (and the demo volunteer) have opted in to invitations, so organizers can find them.
  const preferences = {};
  const prefer = (username, name, area, interests, availability) => {
    preferences[username] = { username, name, area, interests, availability, discoverable: true, mutedOrganizers: [] };
  };
  VOLUNTEER_NAMES.forEach((name, i) => {
    prefer(usernameOf(name), name, AREAS[i % AREAS.length], [categories[i % 6].id, categories[(i + 2) % 6].id], availabilityOf(i));
  });
  prefer('test', 'Test Volunteer', 'Ang Mo Kio', [categoryByName.Community.id, categoryByName.Environment.id],
    ['SAT_MORNING', 'SUN_MORNING', 'WED_EVENING']);

  return {
    version: VERSION,
    preferences,
    invites: [],
    nextInviteId: 1,
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

// Weekly time slots, Monday morning first (same order as the backend's TimeSlots.ALL).
const ALL_SLOTS = DAYS.flatMap((day) => PARTS.map((part) => `${day.key}_${part.key}`));

// The slot an event starting at this time falls in: morning before noon, afternoon until 5pm, evening after.
const slotOf = (date) => {
  const day = DAYS[(date.getDay() + 6) % 7].key;
  const hour = date.getHours();
  return `${day}_${hour < 12 ? 'MORNING' : hour < 17 ? 'AFTERNOON' : 'EVENING'}`;
};

const INVITES_PER_SPOT = 3;
const MIN_INVITES = 10;
const INVITES_WITHOUT_LIMIT = 50;

const inviteLimit = (event) =>
  (event.noOfParticipant == null ? INVITES_WITHOUT_LIMIT : Math.max(MIN_INVITES, event.noOfParticipant * INVITES_PER_SPOT));

// "Priya Nair" -> "Priya N."
const shortName = (name) => {
  const parts = name.trim().split(/\s+/);
  return parts.length < 2 ? name : `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

function inviteStatus(invite, joined) {
  if (joined.has(invite.username)) return 'JOINED';
  return { PENDING: 'INVITED', DECLINED: 'DECLINED', ACCEPTED: 'LEFT' }[invite.status];
}

function statusesFor(db, event) {
  const joined = new Set(registrationsFor(db, event.id).map((r) => r.username));
  const statuses = {};
  db.invites.filter((i) => i.eventId === event.id).forEach((i) => { statuses[i.username] = inviteStatus(i, joined); });
  joined.forEach((username) => { statuses[username] = 'JOINED'; });
  return statuses;
}

function preferencesDto(db, preference) {
  const organizerName = (organizer) => {
    const posted = db.events.filter((e) => e.createdBy === organizer).sort((a, b) => parse(b.createdDate) - parse(a.createdDate));
    return posted[0]?.organizerName || organizer;
  };
  return {
    interests: [...(preference?.interests || [])].sort((a, b) => Number(a) - Number(b)),
    area: preference?.area || null,
    availability: ALL_SLOTS.filter((slot) => (preference?.availability || []).includes(slot)),
    discoverable: Boolean(preference?.discoverable),
    mutedOrganizers: [...(preference?.mutedOrganizers || [])].sort().map((username) => ({ username, name: organizerName(username) })),
  };
}

function requireOwnInvite(db, id, user) {
  const invite = db.invites.find((i) => String(i.id) === String(id) && i.username === user.username);
  if (!invite) throw new ApiError(404, 'Invitation not found');
  return invite;
}

function joinEventAs(db, event, user) {
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
}

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

  ['POST', /^\/profile\/events\/(\d+)\/volunteers$/, (db, { params, user }) => joinEventAs(db, requireEvent(db, params[0]), user), true],

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

  ['GET', /^\/profile\/me\/preferences$/, (db, { user }) => preferencesDto(db, db.preferences[user.username]), true],

  ['PUT', /^\/profile\/me\/preferences$/, (db, { user, body }) => {
    if (user.role === 'ORGANIZER') throw new ApiError(403, 'Preferences are for volunteer accounts');
    if (!Array.isArray(body?.interests)) throw new ApiError(400, 'interests: must not be null');
    const known = new Set(db.categories.map((c) => String(c.id)));
    const current = db.preferences[user.username] || { username: user.username, mutedOrganizers: [] };
    const area = String(body.area || '').trim().slice(0, 60);
    db.preferences[user.username] = {
      ...current,
      name: displayName(user),
      area: area || null,
      interests: [...new Set(body.interests.map(String).filter((id) => known.has(id)))],
      // Optional, so leaving it out keeps what was saved.
      availability: Array.isArray(body.availability)
        ? [...new Set(body.availability.filter((slot) => ALL_SLOTS.includes(slot)))]
        : (current.availability || []),
      discoverable: Boolean(body.discoverable),
      // Only ever unmute here; muting happens when declining an invitation.
      mutedOrganizers: Array.isArray(body.mutedOrganizers)
        ? current.mutedOrganizers.filter((o) => body.mutedOrganizers.includes(o))
        : current.mutedOrganizers,
    };
    return preferencesDto(db, db.preferences[user.username]);
  }, true],

  ['GET', /^\/profile\/volunteers\/search$/, (db, { user, query }) => {
    if (user.role !== 'ORGANIZER') throw new ApiError(403, 'Only organizer accounts can find volunteers');
    const eventId = query.get('eventId');
    const event = eventId ? requireOwnEvent(db, eventId, user) : null;
    const categoryId = query.get('categoryId');
    const wantedArea = (query.get('area') || '').trim().toLowerCase();
    const experienced = query.get('experienced') === 'true';
    const statuses = event ? statusesFor(db, event) : {};
    const names = Object.fromEntries(db.categories.map((c) => [String(c.id), c.category]));
    const matches = [];
    Object.values(db.preferences)
      .filter((p) => p.discoverable && p.username !== user.username && !p.mutedOrganizers.includes(user.username))
      .forEach((p) => {
        const record = db.registrations.filter((r) => r.username === p.username && r.attended === true)
          .map((r) => ({ ...r, event: requireEvent(db, r.eventId) }));
        const causeEvents = categoryId ? record.filter((r) => String(r.event.category?.id) === categoryId).length : record.length;
        const interested = !categoryId || p.interests.includes(categoryId);
        if (!interested && causeEvents === 0) return;
        if (experienced && causeEvents === 0) return;
        if (wantedArea && !(p.area || '').toLowerCase().includes(wantedArea)) return;
        matches.push({
          username: p.username,
          name: shortName(p.name || p.username),
          area: p.area,
          interests: p.interests.map((id) => names[id]).filter(Boolean).sort(),
          verifiedHours: record.reduce((sum, r) => sum + (r.hours || 0), 0),
          eventsAttended: record.length,
          causeEvents,
          eventsWithYou: record.filter((r) => r.event.createdBy === user.username).length,
          status: statuses[p.username] || null,
        });
      });
    // People who've helped you before first, then the most experienced in this cause.
    matches.sort((a, b) => b.eventsWithYou - a.eventsWithYou || b.causeEvents - a.causeEvents
      || b.verifiedHours - a.verifiedHours || a.name.localeCompare(b.name));
    return matches.slice(0, 100);
  }, true],

  ['GET', /^\/profile\/planning\/best-times$/, (db, { user, query }) => {
    if (user.role !== 'ORGANIZER') throw new ApiError(403, 'Only organizer accounts can plan events');
    const categoryId = query.get('categoryId');
    const wantedArea = (query.get('area') || '').trim().toLowerCase();
    // Only opted-in volunteers count, and only totals are returned.
    const matching = Object.values(db.preferences)
      .filter((p) => p.discoverable && !p.mutedOrganizers.includes(user.username))
      .filter((p) => !categoryId || p.interests.includes(categoryId))
      .filter((p) => !wantedArea || (p.area || '').toLowerCase().includes(wantedArea));
    const count = () => Object.fromEntries(ALL_SLOTS.map((slot) => [slot, 0]));
    const available = count();
    const turnout = count();
    const yourTurnout = count();
    matching.forEach((p) => (p.availability || []).forEach((slot) => { available[slot] += 1; }));
    db.registrations.filter((r) => r.attended === true).forEach((r) => {
      const event = requireEvent(db, r.eventId);
      const slot = slotOf(parse(event.fromDate));
      if (!categoryId || String(event.category?.id) === categoryId) turnout[slot] += 1;
      if (event.createdBy === user.username) yourTurnout[slot] += 1;
    });
    return {
      matchingVolunteers: matching.length,
      withAvailability: matching.filter((p) => (p.availability || []).length > 0).length,
      slots: ALL_SLOTS.map((slot) => ({ slot, available: available[slot], turnout: turnout[slot], yourTurnout: yourTurnout[slot] })),
    };
  }, true],

  ['POST', /^\/profile\/events\/(\d+)\/invites$/, (db, { params, user, body }) => {
    const event = requireOwnEvent(db, params[0], user);
    if (!event.isActive || endOf(event) < new Date()) throw new ApiError(409, 'You can only invite people to upcoming events');
    const usernames = [...new Set(Array.isArray(body?.usernames) ? body.usernames : [])];
    if (usernames.length === 0) throw new ApiError(400, 'usernames: must not be empty');
    let remaining = inviteLimit(event) - db.invites.filter((i) => i.eventId === event.id).length;
    const message = String(body.message || '').trim().slice(0, 500) || null;
    let invited = 0;
    usernames.forEach((username) => {
      const p = db.preferences[username];
      if (!p || !p.discoverable || p.mutedOrganizers.includes(user.username) || remaining <= 0
        || db.invites.some((i) => i.eventId === event.id && i.username === username)
        || registrationsFor(db, event.id).some((r) => r.username === username)) return;
      db.invites.push({
        id: db.nextInviteId++, eventId: event.id, username, volunteerName: p.name, invitedBy: user.username,
        message, status: 'PENDING', createdDate: toLocalIso(new Date()), respondedDate: null,
      });
      invited += 1;
      remaining -= 1;
    });
    return { invited, skipped: usernames.length - invited, remaining: Math.max(0, remaining) };
  }, true],

  ['GET', /^\/profile\/events\/(\d+)\/invites$/, (db, { params, user }) => {
    const event = requireOwnEvent(db, params[0], user);
    const joined = new Set(registrationsFor(db, event.id).map((r) => r.username));
    return db.invites.filter((i) => i.eventId === event.id)
      .sort((a, b) => parse(b.createdDate) - parse(a.createdDate))
      .map((i) => ({ username: i.username, name: i.volunteerName || i.username, status: inviteStatus(i, joined), createdDate: i.createdDate }));
  }, true],

  ['GET', /^\/profile\/me\/invites$/, (db, { user }) => {
    const now = new Date();
    return db.invites
      .filter((i) => i.username === user.username && i.status === 'PENDING')
      .map((i) => ({ invite: i, event: requireEvent(db, i.eventId) }))
      .filter(({ event }) => event.isActive && endOf(event) > now
        && !registrationsFor(db, event.id).some((r) => r.username === user.username))
      .sort((a, b) => parse(b.invite.createdDate) - parse(a.invite.createdDate))
      .map(({ invite, event }) => ({
        id: invite.id, event: toDto(db, event), organizerName: event.organizerName, message: invite.message, createdDate: invite.createdDate,
      }));
  }, true],

  ['POST', /^\/profile\/me\/invites\/(\d+)\/accept$/, (db, { params, user }) => {
    const invite = requireOwnInvite(db, params[0], user);
    const joined = joinEventAs(db, requireEvent(db, invite.eventId), user);
    invite.status = 'ACCEPTED';
    invite.respondedDate = toLocalIso(new Date());
    return joined;
  }, true],

  ['POST', /^\/profile\/me\/invites\/(\d+)\/decline$/, (db, { params, user, body }) => {
    const invite = requireOwnInvite(db, params[0], user);
    invite.status = 'DECLINED';
    invite.respondedDate = toLocalIso(new Date());
    if (body?.muteOrganizer) {
      const current = db.preferences[user.username]
        || { username: user.username, name: displayName(user), area: null, interests: [], discoverable: false, mutedOrganizers: [] };
      if (!current.mutedOrganizers.includes(invite.invitedBy)) current.mutedOrganizers.push(invite.invitedBy);
      db.preferences[user.username] = current;
    }
    return null;
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
