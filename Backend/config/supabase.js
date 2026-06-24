import dotenv from "dotenv"
import { createClient, SupabaseClient } from "@supabase/supabase-js/dist/index.cjs";
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
);

export default supabase;