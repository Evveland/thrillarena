import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const SUPABASE_URL = "https://zlslbgtuvjswkeeamxvb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xD8EAe55mT6H6lALeAJSCQ_dZzzrNni";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
