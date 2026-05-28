package com.example.mobileunsaidcebu

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

/** Redirects to FeedActivity. Kept for backward compatibility. */
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        startActivity(Intent(this, FeedActivity::class.java))
        finish()
    }
}
