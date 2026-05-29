package com.example.mobileunsaidcebu

import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ── Auth ──────────────────────────────────────────────────────────────────

    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiEnvelope<AuthResponse>>

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiEnvelope<AuthResponse>>

    // ── Posts ─────────────────────────────────────────────────────────────────

    @GET("api/posts")
    suspend fun getPosts(@Query("userId") userId: Long? = null): Response<List<PostDto>>

    @POST("api/posts")
    suspend fun createPost(@Body request: CreatePostRequest): Response<PostDto>

    @POST("api/posts/{id}/vote")
    suspend fun vote(@Path("id") postId: Long, @Body request: VoteRequest): Response<PostDto>

    @POST("api/posts/{id}/flag")
    suspend fun flag(@Path("id") postId: Long, @Body request: FlagRequest): Response<PostDto>
}
