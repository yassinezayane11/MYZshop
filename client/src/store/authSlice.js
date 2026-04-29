import { createSlice } from '@reduxjs/toolkit';

const loadAuth = () => {
  try {
    const token = localStorage.getItem('dbach_admin_token');
    const username = localStorage.getItem('dbach_admin_user');
    return { token, username, isAuthenticated: !!token };
  } catch { return { token: null, username: null, isAuthenticated: false }; }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuth(),
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.isAuthenticated = true;
      localStorage.setItem('dbach_admin_token', action.payload.token);
      localStorage.setItem('dbach_admin_user', action.payload.username);
    },
    logout(state) {
      state.token = null;
      state.username = null;
      state.isAuthenticated = false;
      localStorage.removeItem('dbach_admin_token');
      localStorage.removeItem('dbach_admin_user');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
export const selectAdminUsername = (state) => state.auth.username;
export default authSlice.reducer;
