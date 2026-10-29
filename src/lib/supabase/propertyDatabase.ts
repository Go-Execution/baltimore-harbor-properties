import { PROPERTIES as SEED_PROPERTIES } from '@/data/properties';
import { Property } from '@/types';
import { DEFAULT_SETTINGS } from '@/utils/propertyStore';
import { getSupabaseClient, isSupabaseConfigured } from './client';

type SiteSettings = typeof DEFAULT_SETTINGS;

function requireSupabase() {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }
  return client;
}

async function requireAdminSession() {
  const supabase = requireSupabase();
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('Sign in with a Supabase admin account in the portal to make cloud changes.');
  }
  const { data: isAdmin, error } = await supabase.rpc('is_admin');
  if (error || !isAdmin) {
    throw new Error('This Supabase account does not have the admin role.');
  }
  return supabase;
}

function mapPropertyRow(row: Record<string, any>): Property {
  const seed = SEED_PROPERTIES.find((property) => property.id === Number(row.id));
  return {
    id: Number(row.id),
    title: row.title,
    subtitle: row.subtitle || seed?.subtitle || '',
    neighborhood: row.neighborhood,
    address: row.address,
    price: Number(row.price),
    cleaningFee: Number(row.cleaning_fee),
    taxRate: Number(row.tax_rate),
    guests: Number(row.guests),
    bedrooms: Number(row.bedrooms),
    beds: Number(row.beds),
    bathrooms: Number(row.bathrooms),
    sqft: Number(row.sqft || 0),
    rating: Number(row.rating || 5),
    reviewsCount: Number(row.reviews_count || 0),
    viewType: row.view_type || seed?.viewType,
    bedType: row.bed_type || seed?.bedType,
    badges: row.badges?.length ? row.badges : seed?.badges || [],
    coverImage: row.cover_image || seed?.coverImage || '',
    gallery: row.gallery?.length ? row.gallery : seed?.gallery || [row.cover_image].filter(Boolean),
    description: row.description,
    amenities: row.amenities?.length ? row.amenities : seed?.amenities || [],
    commute: row.commute?.length ? row.commute : seed?.commute || [],
    reviews: seed?.reviews,
    status: row.status || 'Active',
    featured: Boolean(row.featured),
  };
}

function mapPropertyForDatabase(property: Property) {
  return {
    id: property.id,
    title: property.title,
    subtitle: property.subtitle,
    neighborhood: property.neighborhood,
    address: property.address,
    price: property.price,
    cleaning_fee: property.cleaningFee,
    tax_rate: property.taxRate,
    guests: property.guests,
    bedrooms: property.bedrooms,
    beds: property.beds,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    rating: property.rating,
    reviews_count: property.reviewsCount,
    view_type: property.viewType || null,
    bed_type: property.bedType || null,
    badges: property.badges || [],
    cover_image: property.coverImage,
    gallery: property.gallery || [],
    description: property.description,
    amenities: property.amenities || [],
    commute: property.commute || [],
    status: property.status || 'Active',
    featured: Boolean(property.featured),
  };
}

export async function dbFetchProperties(): Promise<Property[] | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('properties').select('*').order('id');
  if (error) throw new Error(error.message);
  return (data || []).map((row) => mapPropertyRow(row));
}

export async function dbSaveProperty(property: Property): Promise<Property> {
  const supabase = await requireAdminSession();
  const { data, error } = await supabase
    .from('properties')
    .upsert(mapPropertyForDatabase(property), { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw new Error(`Cloud save failed: ${error.message}`);
  return mapPropertyRow(data);
}

export async function dbDeleteProperty(id: number): Promise<void> {
  const supabase = await requireAdminSession();
  const { count, error: reservationError } = await supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', id);
  if (reservationError) throw new Error(`Booking history check failed: ${reservationError.message}`);
  if ((count || 0) > 0) {
    throw new Error('This property has booking history and cannot be deleted. Mark it Inactive instead.');
  }
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw new Error(`Cloud delete failed: ${error.message}`);
}

export async function dbResetProperties(): Promise<Property[]> {
  const supabase = await requireAdminSession();
  const seedIds = SEED_PROPERTIES.map((property) => property.id);
  const { error: upsertError } = await supabase
    .from('properties')
    .upsert(SEED_PROPERTIES.map(mapPropertyForDatabase), { onConflict: 'id' });
  if (upsertError) throw new Error(`Cloud reset failed: ${upsertError.message}`);

  const { error: deleteError } = await supabase.from('properties').delete().not('id', 'in', `(${seedIds.join(',')})`);
  if (deleteError) throw new Error(`Cloud reset cleanup failed: ${deleteError.message}`);
  return SEED_PROPERTIES;
}

export async function dbFetchSettings(): Promise<SiteSettings | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('site_settings').select('settings').eq('id', 'main').maybeSingle();
  if (error) throw new Error(error.message);
  return data?.settings ? { ...DEFAULT_SETTINGS, ...(data.settings as Partial<SiteSettings>) } : null;
}

export async function dbSaveSettings(settings: SiteSettings): Promise<SiteSettings> {
  const supabase = await requireAdminSession();
  const { error } = await supabase.from('site_settings').upsert({
    id: 'main',
    settings,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Cloud settings save failed: ${error.message}`);
  return settings;
}

export async function dbUploadPropertyImages(
  files: Array<{ blob: Blob; name: string }>,
  propertyId?: number,
): Promise<string[]> {
  const supabase = await requireAdminSession();
  const { data: sessionData } = await supabase.auth.getSession();

  const folder = propertyId ? String(propertyId) : `draft-${sessionData.session!.user.id}`;
  const uploaded: string[] = [];

  for (const file of files) {
    const safeStem = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 48) || 'image';
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeStem}.webp`;
    const { error } = await supabase.storage.from('property-images').upload(path, file.blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    });
    if (error) throw new Error(`Image upload failed: ${error.message}`);
    uploaded.push(supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl);
  }

  return uploaded;
}
