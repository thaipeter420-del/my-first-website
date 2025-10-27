// ระบบ Authentication
class Auth {
    constructor() {
        console.log('Initializing Auth system...');
        this.auth = firebase.auth();
        this.currentUser = null;
        
        // เริ่มต้นซ่อนทุกหน้า
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
        
        // ติดตามสถานะการ login
        this.auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            this.currentUser = user;
            
            if (user) {
                // ผู้ใช้ login แล้ว
                this.showLoginSuccess('เข้าสู่ระบบสำเร็จ');
                
                // ซ่อนหน้า login และแสดงหน้าหลัก
                setTimeout(() => {
                    document.getElementById('login-section').style.display = 'none';
                    document.getElementById('main-content').style.display = 'block';
                    document.getElementById('current-user-email').textContent = user.email;
                }, 1000);
            } else {
                // ยังไม่ได้ login แสดงหน้า login
                document.getElementById('login-section').style.display = 'block';
                document.getElementById('main-content').style.display = 'none';
            }
        });
        });

        // จัดการ form login
        this.setupLoginForm();
    }

    setupLoginForm() {
        console.log('Setting up login form...');
        const form = document.getElementById('login-form');
        if (form) {
            console.log('Login form found, adding submit handler');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Login form submitted');
                
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                if (!email || !password) {
                    this.showLoginError('กรุณากรอกอีเมลและรหัสผ่าน');
                    return;
                }
                
                // แสดง loading
                this.setLoading(true);
                
                try {
                    console.log('Attempting login for:', email);
                    await this.login(email, password);
                    console.log('Login successful');
                    // รีเซ็ตฟอร์ม
                    form.reset();
                } catch (error) {
                    console.error('Login error:', error);
                    this.showLoginError(this.getErrorMessage(error));
                } finally {
                    this.setLoading(false);
                }
            });
        } else {
            console.error('Login form not found!');
        }
    }

    // ฟังก์ชัน Login
    async login(email, password) {
        try {
            await this.auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // ฟังก์ชัน Logout
    async logout() {
        try {
            await this.auth.signOut();
            this.showLoginSuccess('ออกจากระบบสำเร็จ');
        } catch (error) {
            console.error('Logout error:', error);
            this.showLoginError('ออกจากระบบไม่สำเร็จ: ' + this.getErrorMessage(error));
        }
    }

    // Helper functions
    setLoading(isLoading) {
        const spinner = document.querySelector('.loading-spinner');
        const submitButton = document.querySelector('#login-form button[type="submit"] span');
        if (spinner && submitButton) {
            spinner.style.display = isLoading ? 'block' : 'none';
            submitButton.style.opacity = isLoading ? '0.7' : '1';
        }
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        const errorMessage = document.getElementById('login-error-message');
        if (errorDiv && errorMessage) {
            errorMessage.textContent = message;
            errorDiv.style.display = 'block';
            // ซ่อน error หลังจาก 5 วินาที
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    showLoginSuccess(message) {
        const successDiv = document.getElementById('login-success');
        const successMessage = document.getElementById('login-success-message');
        if (successDiv && successMessage) {
            successMessage.textContent = message;
            successDiv.style.display = 'block';
            // ซ่อน success message หลังจาก 3 วินาที
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        }
    }

    getErrorMessage(error) {
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
                return error.message;
        }
    }

    // เพิ่มผู้ใช้ใหม่ (สำหรับ Admin)
    async register(email, password) {
        try {
            await this.auth.createUserWithEmailAndPassword(email, password);
            showAlert('สร้างบัญชีผู้ใช้สำเร็จ', 'success');
        } catch (error) {
            showAlert('สร้างบัญชีผู้ใช้ไม่สำเร็จ: ' + error.message, 'error');
        }
    }

    // ตรวจสอบว่า login แล้วหรือยัง
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    getCurrentUser() {
        return this.currentUser;
    }
}