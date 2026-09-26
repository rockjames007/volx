// The causes a user picked during onboarding. Kept in this browser for now; used to recommend events.
const key = (username) => `volx.interests.${username}`;

export function getInterests(username) {
  if (!username) return [];
  try {
    return JSON.parse(localStorage.getItem(key(username))) || [];
  } catch (e) {
    return [];
  }
}

export function saveInterests(username, categoryIds) {
  try {
    localStorage.setItem(key(username), JSON.stringify(categoryIds.map(String)));
  } catch (e) {
    // Storage unavailable (e.g. private mode): recommendations just won't be personalised.
  }
}
