export function generateInviteCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
