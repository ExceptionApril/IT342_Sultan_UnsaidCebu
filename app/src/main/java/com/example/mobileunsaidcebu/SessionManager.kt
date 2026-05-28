package com.example.mobileunsaidcebu

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("unsaidcebu_session", Context.MODE_PRIVATE)

    fun saveSession(userId: Long, name: String, email: String, token: String) {
        prefs.edit()
            .putLong(KEY_USER_ID, userId)
            .putString(KEY_NAME, name)
            .putString(KEY_EMAIL, email)
            .putString(KEY_TOKEN, token)
            .apply()
    }

    fun isLoggedIn(): Boolean = prefs.contains(KEY_TOKEN) && getToken() != null

    fun getUserId(): Long = prefs.getLong(KEY_USER_ID, -1L)
    fun getUserName(): String = prefs.getString(KEY_NAME, "") ?: ""
    fun getUserEmail(): String = prefs.getString(KEY_EMAIL, "") ?: ""
    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun clearSession() = prefs.edit().clear().apply()

    companion object {
        private const val KEY_USER_ID = "user_id"
        private const val KEY_NAME    = "name"
        private const val KEY_EMAIL   = "email"
        private const val KEY_TOKEN   = "token"
    }
}
