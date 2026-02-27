export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  note?: string;  
  created_at?: string;
}