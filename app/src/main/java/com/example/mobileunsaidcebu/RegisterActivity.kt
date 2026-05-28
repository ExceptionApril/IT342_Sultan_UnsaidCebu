package com.example.mobileunsaidcebu

import android.os.Bundle
import android.text.SpannableString
import android.text.Spanned
import android.text.TextPaint
import android.text.method.LinkMovementMethod
import android.text.style.ClickableSpan
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etAlias           = findViewById<EditText>(R.id.etAlias)
        val etEmail           = findViewById<EditText>(R.id.etEmail)
        val etPassword        = findViewById<EditText>(R.id.etPassword)
        val etConfirmPassword = findViewById<EditText>(R.id.etConfirmPassword)
        val btnCreateAccount  = findViewById<Button>(R.id.btnCreateAccount)

        btnCreateAccount.setOnClickListener {
            val alias           = etAlias.text.toString().trim()
            val email           = etEmail.text.toString().trim()
            val password        = etPassword.text.toString()
            val confirmPassword = etConfirmPassword.text.toString()

            if (alias.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all required fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (password.length < 6) {
                Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            btnCreateAccount.isEnabled = false
            lifecycleScope.launch {
                try {
                    val response = ApiClient.getService().register(RegisterRequest(alias, email, password))
                    if (response.isSuccessful) {
                        Toast.makeText(this@RegisterActivity,
                            "Account created! Please sign in.", Toast.LENGTH_LONG).show()
                        finish()
                    } else {
                        val msg = response.errorBody()?.string() ?: "Registration failed"
                        Toast.makeText(this@RegisterActivity, msg, Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@RegisterActivity,
                        "Connection error: check backend is running", Toast.LENGTH_LONG).show()
                } finally {
                    btnCreateAccount.isEnabled = true
                }
            }
        }

        val tvSignIn = findViewById<TextView>(R.id.tvSignIn)
        val fullText = getString(R.string.already_a_whisperer) + getString(R.string.sign_in_link)
        val spannable = SpannableString(fullText)
        val signInSpan = object : ClickableSpan() {
            override fun onClick(widget: View) { finish() }
            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.color = getColor(R.color.primary_purple)
                ds.isUnderlineText = false
            }
        }
        val start = fullText.indexOf(getString(R.string.sign_in_link))
        spannable.setSpan(signInSpan, start, start + getString(R.string.sign_in_link).length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        tvSignIn.text = spannable
        tvSignIn.movementMethod = LinkMovementMethod.getInstance()
    }
}
