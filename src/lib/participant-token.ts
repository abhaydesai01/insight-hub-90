const key = (code: string) => `policypoll-p-${code.toUpperCase()}`;

export function getParticipantToken(code: string): string | null {
  return sessionStorage.getItem(key(code));
}

export function setParticipantToken(code: string, token: string) {
  sessionStorage.setItem(key(code.toUpperCase()), token);
}

export function clearParticipantToken(code: string) {
  sessionStorage.removeItem(key(code.toUpperCase()));
}
