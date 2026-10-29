import { isServerAdmin } from '@/lib/supabase/admin';
import { jsonError } from '@/lib/forms/validation';

export async function GET() {
  if (!(await isServerAdmin())) return jsonError('Administrator access required.', 403);
  return Response.json({
    success: true,
    services: {
      siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY),
      emailProvider: Boolean(process.env.RESEND_API_KEY),
      emailSender: Boolean(process.env.EMAIL_FROM),
      adminNotifications: Boolean(process.env.ADMIN_NOTIFICATION_EMAIL),
      payments: false,
    },
  });
}
