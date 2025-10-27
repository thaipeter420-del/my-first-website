// ระบบ Authentication
class Auth {
    constructor() {
        this.auth = firebase.auth();
        this.currentUser = null;
        
        // ติดตามสถานะการ login
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                // ผู้ใช้ login แล้ว
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('main-content').style.display = 'block';
                document.getElementById('user-profile').textContent = user.email;
            } else {
                // ยังไม่ได้ login
                document.getElementById('login-section').style.display = 'block';
                document.getElementById('main-content').style.display = 'none';
            }
        });
    }

    // ฟังก์ชัน Login
    async login(email, password) {
        try {
            await this.auth.signInWithEmailAndPassword(email, password);
            showAlert('เข้าสู่ระบบสำเร็จ', 'success');
        } catch (error) {
            showAlert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message, 'error');
        }
    }

    // ฟังก์ชัน Logout
    async logout() {
        try {
            await this.auth.signOut();
            showAlert('ออกจากระบบสำเร็จ', 'success');
        } catch (error) {
            showAlert('ออกจากระบบไม่สำเร็จ: ' + error.message, 'error');
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