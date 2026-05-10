// API Base URL - Update this if your backend is running on a different port
const API_BASE_URL = 'http://localhost:8080/api/auth';

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store user data
                localStorage.setItem('user', JSON.stringify(data));
                
                showNotification(`Welcome back, ${data.name}!`, 'success');
                
                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showNotification(data.message || 'Invalid email or password', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Unable to connect to server. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
}

// Handle Registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Validation
        if (!fullName || !email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (fullName.length < 2) {
            showNotification('Name must be at least 2 characters long', 'error');
            return;
        }
        
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (!agreeTerms) {
            showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: fullName,
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Account created successfully! Redirecting to login...', 'success');
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showNotification(data.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Unable to connect to server. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
}

// Check if user is already logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
        // Uncomment the line below if you want to redirect logged-in users
        // window.location.href = 'dashboard.html';
    }
}

// Run auth check on page load
checkAuth();
