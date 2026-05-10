package com.example.mobileunsaidcebu

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
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class RegisterActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etAlias = findViewById<EditText>(R.id.etAlias)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val etConfirmPassword = findViewById<EditText>(R.id.etConfirmPassword)
        val btnCreateAccount = findViewById<Button>(R.id.btnCreateAccount)
        val progressBar = findViewById<android.widget.ProgressBar>(R.id.progressBar)

        btnCreateAccount.setOnClickListener {
            val alias = etAlias.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString()
            val confirmPassword = etConfirmPassword.text.toString()

            if (email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(this, "Please fill all required fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    btnCreateAccount.isEnabled = false
                    progressBar.visibility = View.VISIBLE
                    Log.d("RegisterActivity", "Attempting sign up for: $email")
                    // Registration with Supabase Auth
                    SupabaseConfig.client.auth.signUpWith(Email) {
                        this.email = email
                        this.password = password
                        // You can store the alias in user metadata
                        data = buildJsonObject {
                            put("display_name", alias)
                        }
                    }
                    
                    Log.d("RegisterActivity", "Sign up successful")
                    Toast.makeText(this@RegisterActivity, "Registration successful! Please check your email.", Toast.LENGTH_LONG).show()
                    finish() // Back to login
                } catch (e: Exception) {
                    Log.e("RegisterActivity", "Sign up failed", e)
                    Toast.makeText(this@RegisterActivity, "Registration failed: ${e.message}", Toast.LENGTH_SHORT).show()
                } finally {
                    btnCreateAccount.isEnabled = true
                    progressBar.visibility = View.GONE
                }
            }
        }

        val tvSignIn = findViewById<TextView>(R.id.tvSignIn)
        val text = getString(R.string.already_a_whisperer) + getString(R.string.sign_in_link)
        val spannableString = SpannableString(text)

        val signInClick = object : ClickableSpan() {
            override fun onClick(widget: View) {
                finish() // Go back to login
            }

            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.color = getColor(R.color.primary_purple)
                ds.isUnderlineText = false
            }
        }

        val start = text.indexOf(getString(R.string.sign_in_link))
        val end = start + getString(R.string.sign_in_link).length
        spannableString.setSpan(signInClick, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)

        tvSignIn.text = spannableString
        tvSignIn.movementMethod = LinkMovementMethod.getInstance()
    }
}