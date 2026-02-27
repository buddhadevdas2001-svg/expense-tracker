import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";

interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  is_default: boolean;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async (userId: string) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .or(`user_id.eq.${userId},is_default.eq.true`);

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    return data || [];
  },
);

export const addCategory = createAsyncThunk(
  "categories/add",
  async (category: Omit<Category, "id">) => {
    const { data, error } = await supabase
      .from("categories")
      .insert([{
        user_id: category.user_id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        is_default: category.is_default,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }
    return data;
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async ({ id, user_id }: { id: string; user_id: string }) => {
    const { count, error: countError } = await supabase
      .from("transactions")
      .select("*", { count: 'exact', head: true })
      .eq("category_id", id);

    if (countError) throw countError;

    if (count && count > 0) {
      throw new Error("Cannot delete category with existing transactions");
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user_id);

    if (error) throw error;
    return id;
  },
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload,
        );
      });
  },
});

export default categorySlice.reducer;
