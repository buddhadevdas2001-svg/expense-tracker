import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";

interface User {
  id: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  initialized: false,
};

export const signUpUser = createAsyncThunk(
  "auth/signup",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return rejectWithValue({ message: error.message });

      return data.user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Signup failed";
      return rejectWithValue({ message });
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return rejectWithValue({ message: error.message });
      }

      return data.user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      return rejectWithValue({ message });
    }
  },
);

export const checkSession = createAsyncThunk("auth/checkSession", async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user || null;
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await supabase.auth.signOut();
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkSession.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(checkSession.fulfilled, (state, action) => {
      state.user = action.payload;
      state.initialized = true;
      state.loading = false;
    });
    builder.addCase(checkSession.rejected, (state) => {
      state.user = null;
      state.initialized = true;
      state.loading = false;
    });

    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.initialized = true;
    });
    builder.addCase(loginUser.rejected, (state) => {
      state.loading = false;
      state.initialized = true;
    });

    builder.addCase(signUpUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(signUpUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.initialized = true;
    });
    builder.addCase(signUpUser.rejected, (state) => {
      state.loading = false;
      state.initialized = true;
    });

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.initialized = true;
    });
  },
});

export const { setUser, setInitialized } = authSlice.actions;
export default authSlice.reducer;
