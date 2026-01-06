import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	user: null,
	accessToken: null,
	refreshToken: null,
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		// ✅ Login (set user and tokens)
		login: (state, action) => {
			const { user, accessToken, refreshToken } = action.payload
			state.user = user
			state.accessToken = accessToken
			state.refreshToken = refreshToken
		},

		// ✅ Logout (clear all)
		logout: state => {
			state.user = null
			state.accessToken = null
			state.refreshToken = null
		},

		// ✅ Update tokens
		updateTokens: (state, action) => {
			const { accessToken, refreshToken } = action.payload
			state.accessToken = accessToken
			if (refreshToken) state.refreshToken = refreshToken
		},
	},
})

export const { login, logout, updateTokens } = authSlice.actions
export default authSlice.reducer
