import { randomBytes, randomUUID } from 'crypto';

export function generateId(): string {
  return randomUUID();
}

export function generateShortId(length = 8): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}
