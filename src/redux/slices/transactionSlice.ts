import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: "income" | "expense";
  category_id: string;
  date: string;
  note?: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
    is_default: boolean;
    type?: "income" | "expense" | "both";
  } | null;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
};

async function ensureProfileExists(userId: string) {
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileCheckError) {
    throw profileCheckError;
  }

  if (existingProfile) return;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw authError;
  }

  const { error: profileInsertError } = await supabase.from("profiles").insert({
    id: userId,
    email: authData.user?.email ?? null,
  });

  if (profileInsertError) {
    throw profileInsertError;
  }
}

export const fetchTransactions = createAsyncThunk(
  "transactions/fetch",
  async (userId: string) => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        category:categories(
          id,
          name,
          icon,
          color,
          is_default,
          type
        )
      `)
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    
    return data || [];
  },
);

export const addTransaction = createAsyncThunk(
  "transactions/add",
  async (transaction: Omit<Transaction, "id">) => {
    try {
      await ensureProfileExists(transaction.user_id);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to validate profile before transaction insert.";
      throw new Error(
        `Cannot add transaction because profile sync failed. ${message}`,
      );
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert([{
        user_id: transaction.user_id,
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.category_id,
        note: transaction.note,
        date: transaction.date,
      }])
      .select(`
        *,
        category:categories(
          id,
          name,
          icon,
          color,
          is_default,
          type
        )
      `)
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      if (error.code === "23503" && error.message.includes("transactions_user_id_fkey")) {
        throw new Error(
          "Profile record not found for this user. Create it in Supabase (profiles table) and try again.",
        );
      }
      throw error;
    }
    return data;
  },
);

export const updateTransaction = createAsyncThunk(
  "transactions/update",
  async ({ id, amount, type, note, category_id, date, user_id }: Partial<Transaction> & { id: string; user_id: string }) => {
    const updateData: Partial<Pick<Transaction, "amount" | "type" | "note" | "category_id" | "date">> = {};
    if (amount !== undefined) updateData.amount = amount;
    if (type !== undefined) updateData.type = type;
    if (note !== undefined) updateData.note = note;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (date !== undefined) updateData.date = date;

    const { data, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user_id)
      .select(`
        *,
        category:categories(
          id,
          name,
          icon,
          color,
          is_default,
          type
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },
);

export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async ({ id, user_id }: { id: string; user_id: string }) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user_id);

    if (error) throw error;
    return id;
  },
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransactions.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (t) => t.id === action.payload.id,
        );
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.payload,
        );
      });
  },
});

export default transactionSlice.reducer;
