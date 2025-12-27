import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  checkAuthStatus,
  getUserDetails,
  refreshTokens,
  logoutUser,
} from "@/lib/api/userApi";

interface UserDetails {
  _id?: string;
  userName?: string;
  email?: string;
  fullName?: string;
  avatar?: string;
  coverImage?: string;
}

interface LoginState {
  isLoading: boolean;
  userDetails: UserDetails | null;
  isLoggedIn: boolean;
  isError: boolean;
}

const initialState: LoginState = {
  isLoading: true,
  userDetails: null,
  isLoggedIn: false,
  isError: false,
};

export const checkAuth = createAsyncThunk("checkAuth", async (_, thunkAPI) => {
  try {
    const isAuth = await checkAuthStatus();

    if (isAuth) {
      const details = await getUserDetails();
      return details.data;
    }

    const refreshed = await refreshTokens();

    if (!refreshed) {
      return thunkAPI.rejectWithValue("Not authenticated");
    }

    const retryAuth = await checkAuthStatus();

    if (retryAuth) {
      const details = await getUserDetails();
      return details.data;
    }

    return thunkAPI.rejectWithValue("Authentication failed");
  } catch (error) {
    console.error("Error checking auth status:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk("logout", async (_, thunkAPI) => {
  try {
    const result = await logoutUser();
    return result;
  } catch (error) {
    console.error("Error during logout:", error);
    const message = error instanceof Error ? error.message : "Logout failed";
    return thunkAPI.rejectWithValue(message);
  }
});

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    changeIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.userDetails = action.payload.userDetails;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.userDetails = action.payload;
    });
    builder.addCase(checkAuth.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.isLoggedIn = false;
      state.userDetails = null;
      state.isError = false;
    });
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.rejected, (state) => {
      state.isLoading = false;
      state.isError = true;
    });
  },
});

export const { changeIsLoggedIn } = loginSlice.actions;

export default loginSlice.reducer;
