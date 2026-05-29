package com.example.mobileunsaidcebu

import com.google.gson.annotations.SerializedName

// ── API envelope ──────────────────────────────────────────────────────────────
// The backend wraps auth responses as { success, data, error, timestamp }.
data class ApiEnvelope<T>(
    val success: Boolean = false,
    val data: T? = null,
    val error: ApiError? = null,
    val timestamp: String? = null
)

data class ApiError(
    val code: String? = null,
    val message: String? = null
)

// ── Auth ─────────────────────────────────────────────────────────────────────

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val userId: Long?,
    val name: String?,
    val email: String?,
    val message: String?,
    val token: String?
)

// ── Posts ─────────────────────────────────────────────────────────────────────

data class PostDto(
    val id: Long,
    val userId: Long,
    val anonName: String?,
    val content: String,
    val latitude: Double?,
    val longitude: Double?,
    val upvotes: Int,
    val downvotes: Int,
    val flagCount: Int,
    @SerializedName("isHidden") val isHidden: Boolean,
    val createdAt: String?,
    val userVote: String?,
    val userFlagged: Boolean,
    val replyCount: Int
)

data class CreatePostRequest(
    val userId: Long,
    val content: String,
    val latitude: Double,
    val longitude: Double
)

data class VoteRequest(
    val userId: Long,
    val voteType: String  // "UPVOTE" or "DOWNVOTE"
)

data class FlagRequest(
    val userId: Long,
    val reason: String = "INAPPROPRIATE"
)
