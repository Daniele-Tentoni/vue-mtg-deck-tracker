import type { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://awvhzmqrqxrqlsohpsqr.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3dmh6bXFycXhycWxzb2hwc3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDM4NTUsImV4cCI6MjA3MTExOTg1NX0.zYMFXOP7Fd-f70UvDuihT4WlGQu8hl5GCA5FPjmQgE8';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
