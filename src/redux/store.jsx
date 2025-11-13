import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import { combineReducers } from 'redux'

const persistConfig = {
	key: 'root',
	storage,
}

const rootReducer = combineReducers({
	auth: authReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
	reducer: persistedReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [
					'persist/PERSIST',
					'persist/REHYDRATE',
					'persist/PAUSE',
					'persist/FLUSH',
					'persist/PURGE',
					'persist/REGISTER',
				],
			},
		}),
})

export const persistor = persistStore(store)
