// ระบบ Authentication (clean implementation)
// ระบบ Authentication (clean implementation)
class Auth {
    constructor() {
        this.auth = firebase.auth();
        this.currentUser = null;

        // Setup when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.showLoginForm();
            this.setupLoginForm();
        });

        // Listen for auth state changes
        this.auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? `User ${user.email} logged in` : 'No user');
            this.currentUser = user;
            if (user) {
                this.showLoginSuccess('เข้าสู่ระบบสำเร็จ');
                this.showMainContent(user);
            } else {
                this.showLoginForm();
            }
        });
    }

    showLoginForm() {
        const login = document.getElementById('login-section');
        const main = document.getElementById('main-content');
        if (login) login.style.display = 'block';
        if (main) main.style.display = 'none';
    }

    showMainContent(user) {
        const login = document.getElementById('login-section');
        const main = document.getElementById('main-content');
        const emailSpan = document.getElementById('current-user-email');
        if (login) login.style.display = 'none';
        if (main) main.style.display = 'block';
        if (emailSpan) emailSpan.textContent = user.email;
    }

    setupLoginForm() {
        const form = document.getElementById('login-form');
        if (!form) {
            console.warn('Login form not found');
            return;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value || '';
            const password = document.getElementById('login-password')?.value || '';

            if (!email || !password) {
                this.showLoginError('กรุณากรอกอีเมลและรหัสผ่าน');
                return;
            }

            this.setLoading(true);
            try {
                await this.login(email, password);
                // onAuthStateChanged will handle UI on success
            } catch (err) {
                console.error('Login failed', err);
                this.showLoginError(this.getErrorMessage(err));
            } finally {
                this.setLoading(false);
            }
        });
    }

    async login(email, password) {
        return this.auth.signInWithEmailAndPassword(email, password);
    }

    async logout() {
        try {
            await this.auth.signOut();
            this.showLoginSuccess('ออกจากระบบสำเร็จ');
            this.showLoginForm();
        } catch (err) {
            console.error('Logout failed', err);
            this.showLoginError('ออกจากระบบไม่สำเร็จ: ' + this.getErrorMessage(err));
        }
    }

    setLoading(isLoading) {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = isLoading ? 'block' : 'none';
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        const errorMessage = document.getElementById('login-error-message');
        if (errorDiv && errorMessage) {
            errorMessage.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => (errorDiv.style.display = 'none'), 5000);
        } else {
            alert(message);
        }
    }

    showLoginSuccess(message) {
        const successDiv = document.getElementById('login-success');
        const successMessage = document.getElementById('login-success-message');
        if (successDiv && successMessage) {
            successMessage.textContent = message;
            successDiv.style.display = 'block';
            setTimeout(() => (successDiv.style.display = 'none'), 3000);
        }
    }

    getErrorMessage(error) {
        if (!error) return 'เกิดข้อผิดพลาด';
        switch (error.code) {
            case 'auth/user-not-found':
                return 'ไม่พบบัญชีผู้ใช้นี้';
            case 'auth/wrong-password':
                return 'รหัสผ่านไม่ถูกต้อง';
            case 'auth/invalid-email':
                return 'อีเมลไม่ถูกต้อง';
            case 'auth/user-disabled':
                return 'บัญชีนี้ถูกระงับการใช้งาน';
            default:
                return error.message || String(error);
        }
    }
}

// Create and expose global controller so inline handlers like onclick="auth.logout()" work
window.authController = new Auth();
window.auth = window.authController;
