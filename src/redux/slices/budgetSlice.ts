import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";

interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string;
}

interface BudgetState {
  budgets: Budget[];
  loading: boolean;
}

const initialState: BudgetState = {
  budgets: [],
  loading: false,
};

export const fetchBudgets = createAsyncThunk(
  "budgets/fetch",
  async ({ userId, month }: { userId: string; month: string }) => {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("month", month);

    if (error) throw error;
    return data || [];
  },
);

export const upsertBudget = createAsyncThunk(
  "budgets/upsert",
  async (budget: Omit<Budget, "id">) => {
    const { data, error } = await supabase
      .from("budgets")
      .upsert([budget], {
        onConflict: "user_id,category_id,month",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
);

export const deleteBudget = createAsyncThunk(
  "budgets/delete",
  async ({ id, user_id }: { id: string; user_id: string }) => {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)
      .eq("user_id", user_id);

    if (error) throw error;
    return id;
  },
);

const budgetSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.budgets = action.payload;
        state.loading = false;
      })
      .addCase(fetchBudgets.rejected, (state) => {
        state.loading = false;
      })
      .addCase(upsertBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex(
          (b) => b.id === action.payload.id,
        );
        if (index !== -1) {
          state.budgets[index] = action.payload;
        } else {
          state.budgets.push(action.payload);
        }
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
      });
  },
});

export default budgetSlice.reducer;