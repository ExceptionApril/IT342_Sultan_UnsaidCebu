package com.example.mobileunsaidcebu.core.config

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.auth

object SupabaseConfig {
    const val SUPABASE_URL = "https://ddybaipugbtjeyyvdkgz.supabase.co"
    const val SUPABASE_KEY = "sb_publishable_O6s4wJm0zZunfmDU3Dl1iw_fw4L44Ex"

    val client: SupabaseClient = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_KEY
    ) {
        install(Auth)
    }
}