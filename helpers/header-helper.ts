export const cmcHeaders = new Headers({
    'X-CMC_PRO_API_KEY': process.env.NEXT_PUBLIC_CMC_KEY || '',
  });
export const supabaseHeaders = new Headers({
  'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
});