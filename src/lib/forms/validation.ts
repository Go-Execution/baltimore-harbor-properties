import 'server-only';
import { NextRequest } from 'next/server';

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().replace(/\0/g, '').slice(0, maxLength) : '';
}

export function validEmail(value: string) {
  return value.length <= 254 && emailPattern.test(value);
}

export function validDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function cleanMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).slice(0, 20).map(([key, entry]) => [
    cleanText(key, 60),
    typeof entry === 'number' || typeof entry === 'boolean' ? entry : cleanText(entry, 500),
  ]).filter(([key]) => Boolean(key)));
}

export function validRequestOrigin(request: NextRequest) {
  const suppliedOrigin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const candidate = suppliedOrigin || referer;
  if (!candidate) return process.env.NODE_ENV !== 'production';
  try {
    const origin = new URL(candidate).origin;
    return origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export function jsonError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
