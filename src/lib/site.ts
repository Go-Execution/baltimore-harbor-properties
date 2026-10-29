const fallbackSiteUrl = 'https://baltimore-harbor-properties.vercel.app';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, '');

