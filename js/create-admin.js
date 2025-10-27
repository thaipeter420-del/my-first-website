// เช็คว่ามี admin อยู่แล้วหรือไม่
async function checkForExistingAdmin() {
    try {
        console.log('Checking for existing admin...');
        const usersSnapshot = await firebase.firestore().collection('users').where('role', '==', 'admin').limit(1).get();
        
        if (usersSnapshot.empty) {
            console.log('No admin found, showing admin creation form');
            // ถ้ายังไม่มี admin ให้แสดงฟอร์มสร้าง
            document.getElementById('create-admin-section').style.display = 'block';
            document.getElementById('login-section').style.display = 'none';
        } else {
            console.log('Admin exists, showing login form');
            // ถ้ามี admin แล้ว ให้แสดงฟอร์ม login
            document.getElementById('create-admin-section').style.display = 'none';
            document.getElementById('login-section').style.display = 'block';
        }
    } catch (error) {
        console.error('Error checking for admin:', error);
        // ถ้าเกิด error ให้แสดงฟอร์ม login เป็นค่าเริ่มต้น
        document.getElementById('create-admin-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
    }
}

// เริ่มต้นตรวจสอบเมื่อโหลดเพจ
document.addEventListener('DOMContentLoaded', () => {
    checkForExistingAdmin();
    
    // จัดการการส่งฟอร์มสร้าง admin
    document.getElementById('create-admin-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const confirmPassword = document.getElementById('admin-confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
            return;
        }
        
        await createFirstAdmin(email, password);
    });
});

// ฟังก์ชันสำหรับสร้าง Admin User ครั้งแรก
async function createFirstAdmin(email, password) {
    try {
        // สร้างผู้ใช้ใน Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // สร้างข้อมูลใน Firestore
        await firebase.firestore().collection('users').doc(user.uid).set({
            email: email,
            role: 'admin',
            active: true,
            created: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Created admin user successfully:', email);
        alert('สร้างผู้ดูแลระบบสำเร็จ! กรุณาล็อกอินด้วยอีเมลและรหัสผ่านที่สร้าง');
        
        // ล็อกเอาท์เพื่อให้ล็อกอินใหม่
        await firebase.auth().signOut();
        
        // ซ่อนฟอร์มสร้าง admin
        document.getElementById('create-admin-section').style.display = 'none';
        
    } catch (error) {
        console.error('Error creating admin:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}