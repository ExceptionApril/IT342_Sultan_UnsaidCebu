package com.example.mobileunsaidcebu

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import io.github.jan.supabase.auth.auth
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btnLogout = findViewById<Button>(R.id.btnLogout)

        btnLogout.setOnClickListener {
            lifecycleScope.launch {
                try {
                    SupabaseConfig.client.auth.signOut()
                    startActivity(Intent(this@MainActivity, LoginActivity::class.java))
                    finish()
                } catch (e: Exception) {
                    // Handle error
                }
            }
        }
    }
}