package com.example.mobileunsaidcebu

import android.content.Intent
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

class LoginActivity : AppCompatActivity() {

    private lateinit var session: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        session = SessionManager(this)
        if (session.isLoggedIn()) {
            goToFeed()
            return
        }

        setContentView(R.layout.activity_login)

        val etEmail    = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnSignIn  = findViewById<Button>(R.id.btnSignIn)

        btnSignIn.setOnClickListener {
            val email    = etEmail.text.toString().trim()
            val password = etPassword.text.toString()
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            btnSignIn.isEnabled = false
            lifecycleScope.launch {
                try {
                    val response = ApiClient.getService().login(LoginRequest(email, password))
                    val auth = response.body()?.data
                    if (response.isSuccessful && auth?.userId != null && auth.token != null) {
                        session.saveSession(auth.userId, auth.name ?: "", auth.email ?: "", auth.token)
                        goToFeed()
                    } else {
                        Toast.makeText(this@LoginActivity, "Invalid email or password", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@LoginActivity, "Connection error: check backend is running", Toast.LENGTH_LONG).show()
                } finally {
                    btnSignIn.isEnabled = true
                }
            }
        }

        val tvCreateAccount = findViewById<TextView>(R.id.tvCreateAccount)
        val fullText = getString(R.string.new_to_unsaid) + getString(R.string.create_account)
        val spannable = SpannableString(fullText)
        val clickSpan = object : ClickableSpan() {
            override fun onClick(widget: View) {
                startActivity(Intent(this@LoginActivity, RegisterActivity::class.java))
            }
            override fun updateDrawState(ds: TextPaint) {
                super.updateDrawState(ds)
                ds.color = getColor(R.color.primary_purple)
                ds.isUnderlineText = false
            }
        }
        val start = fullText.indexOf(getString(R.string.create_account))
        spannable.setSpan(clickSpan, start, start + getString(R.string.create_account).length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        tvCreateAccount.text = spannable
        tvCreateAccount.movementMethod = LinkMovementMethod.getInstance()
    }

    private fun goToFeed() {
        startActivity(Intent(this, FeedActivity::class.java))
        finish()
    }
}
