package com.example.mobileunsaidcebu.features.auth

import android.content.Intent
import android.os.Bundle
import android.text.SpannableString
import android.text.Spanned
import android.text.TextPaint
import android.text.method.LinkMovementMethod
import android.text.style.ClickableSpan
import android.view.View
import android.util.Log
import android.widget.TextView
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.mobileunsaidcebu.R
import com.example.mobileunsaidcebu.core.config.SupabaseConfig
import com.example.mobileunsaidcebu.features.main.MainActivity
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check if user is already logged in
        val session = SupabaseConfig.client.auth.currentSessionOrNull()
        if (session != null) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        Log.d("LoginActivity", "onCreate started")
        try {
            setContentView(R.layout.activity_login)
            Log.d("LoginActivity", "setContentView successful")
        } catch (e: Exception) {
            Log.e("LoginActivity", "Error setting content view", e)
        }

        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnSignIn = findViewById<Button>(R.id.btnSignIn)
        val progressBar = findViewById<android.widget.ProgressBar>(R.id.progressBar)

        btnSignIn.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString()

            Log.d("LoginActivity", "Sign In clicked: email=$email")

            if (email.isNotEmpty() && password.isNotEmpty()) {
                lifecycleScope.launch {
                    try {
                        btnSignIn.isEnabled = false
                        progressBar.visibility = View.VISIBLE
                        Log.d("LoginActivity", "Attempting Supabase sign in...")
                        SupabaseConfig.client.auth.signInWith(Email) {
                            this.email = email
                            this.password = password
                        }
                        Log.d("LoginActivity", "Sign in successful!")
                        startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                        finish()
                    } catch (e: Exception) {
                        Log.e("LoginActivity", "Sign in failed", e)
                        Toast.makeText(this@LoginActivity, "Login failed: ${e.message}", Toast.LENGTH_SHORT).show()
                    } finally {
                        btnSignIn.isEnabled = true
                        progressBar.visibility = View.GONE
                    }
                }
            } else {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            }
        }

        val tvCreateAccount = findViewById<TextView>(R.id.tvCreateAccount)
        val text = getString(R.string.new_to_unsaid) + getString(R.string.create_account)
        val spannableString = SpannableString(text)
        
        val createAccountClick = object : ClickableSpan() {
            override fun onClick(widget: View) {
                startActivity(Intent(this@LoginActivity, RegisterActivity::class.java))
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.color = getColor(R.color.primary_purple)
                ds.isUnderlineText = false
            }
        }

        val start = text.indexOf(getString(R.string.create_account))
        val end = start + getString(R.string.create_account).length
        spannableString.setSpan(createAccountClick, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)

        tvCreateAccount.text = spannableString
        tvCreateAccount.movementMethod = LinkMovementMethod.getInstance()
    }
}