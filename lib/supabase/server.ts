import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // On the server, we prefer the service role key for full DB access, but fallback to anon key
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
        throw new Error("Supabase server environment variables are missing");
    }

    return createSupabaseClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
