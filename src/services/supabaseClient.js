import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xuqkqvgkxwrprymfzaog.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CtYkYpylV8I5d2aZcGuIyQ_bfGzih0q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
