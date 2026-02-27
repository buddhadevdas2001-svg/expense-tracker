import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export type Tables = {
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    currency: string;
    created_at: string;
    updated_at: string;
  };
  categories: {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense' | 'both';
    is_default: boolean;
    created_at: string;
  };
  transactions: {
    id: string;
    user_id: string;
    type: 'income' | 'expense';
    amount: number;
    category_id: string;
    date: string;
    note: string | null;
    created_at: string;
  };
  budgets: {
    id: string;
    user_id: string;
    category_id: string;
    amount: number;
    month: string;
    created_at: string;
  };
};
