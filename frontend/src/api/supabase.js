import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const getSupabaseClient = (schema = "public") => {
  console.log(`🛠 getSupabaseClient 실행됨: ${schema}`);
  return createClient(supabaseUrl, supabaseKey, {
    db: { schema },
  });
};

export default supabase;