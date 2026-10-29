import 'server-only';
import { NextRequest } from 'next/server';

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().replace(/\0/g, '').slice(0, maxLength) : '';
}

export function validEmail(value: string) {
  return value.length <= 254 && emailPattern.test(value);
}

export function cleanMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).slice(0, 20).map(([key, entry]) => [
    cleanText(key, 60),
    typeof entry === 'number' || typeof entry === 'boolean' ? entry : cleanText(entry, 500),
  ]).filter(([key]) => Boolean(key)));
}

export function validRequestOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

export function jsonError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
