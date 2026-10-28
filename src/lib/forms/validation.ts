import 'server-only';
import { NextRequest } from 'next/server';

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().replace(/\0/g, '').slice(0, maxLength) : '';
}

export function validEmail(value: string) {
  return value.length <= 254 && emailPattern.test(value);
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
