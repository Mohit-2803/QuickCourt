// utils/session-id.ts
export function getOrCreateSessionId() {
  const key = "qc_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
