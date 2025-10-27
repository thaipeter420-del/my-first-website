// ระบบจัดการผู้ใช้และสิทธิ์
class UserManagement {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
    }

    // สร้างผู้ใช้ใหม่พร้อมกำหนดสิทธิ์
    async createUser(email, password, role = 'user') {
        try {
            // สร้างผู้ใช้ใน Authentication
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;

            // บันทึกข้อมูลผู้ใช้และสิทธิ์ใน Firestore
            await this.db.collection('users').doc(uid).set({
                email: email,
                role: role,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            // บันทึก log
            await dbOperations.addLog('create_user', `สร้างผู้ใช้ใหม่: ${email} (${role})`);

            return { success: true, message: `สร้างผู้ใช้ ${email} สำเร็จ` };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // อัพเดตสิทธิ์ผู้ใช้
    async updateUserRole(uid, newRole) {
        try {
            await this.db.collection('users').doc(uid).update({
                role: newRole,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // บันทึก log
            await dbOperations.addLog('update_role', `อัพเดตสิทธิ์ผู้ใช้ ${uid} เป็น ${newRole}`);

            return { success: true, message: 'อัพเดตสิทธิ์สำเร็จ' };
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }

    // ดึงข้อมูลผู้ใช้ทั้งหมด
    async getAllUsers() {
        try {
            const snapshot = await this.db.collection('users').get();
            return snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }

    // ระงับการใช้งานผู้ใช้
    async deactivateUser(uid) {
        try {
            await this.db.collection('users').doc(uid).update({
                active: false,
                deactivatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // บันทึก log
            await dbOperations.addLog('deactivate_user', `ระงับการใช้งานผู้ใช้ ${uid}`);

            return { success: true, message: 'ระงับการใช้งานผู้ใช้สำเร็จ' };
        } catch (error) {
            console.error('Error deactivating user:', error);
            throw error;
        }
    }

    // เปิดใช้งานผู้ใช้
    async activateUser(uid) {
        try {
            await this.db.collection('users').doc(uid).update({
                active: true,
                activatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // บันทึก log
            await dbOperations.addLog('activate_user', `เปิดใช้งานผู้ใช้ ${uid}`);

            return { success: true, message: 'เปิดใช้งานผู้ใช้สำเร็จ' };
        } catch (error) {
            console.error('Error activating user:', error);
            throw error;
        }
    }

    // ตรวจสอบสิทธิ์ผู้ใช้
    async checkUserPermission(uid, requiredRole = 'user') {
        try {
            const doc = await this.db.collection('users').doc(uid).get();
            if (!doc.exists) return false;

            const userData = doc.data();
            if (!userData.active) return false;

            const roleHierarchy = {
                'admin': 3,
                'manager': 2,
                'user': 1
            };

            return roleHierarchy[userData.role] >= roleHierarchy[requiredRole];
        } catch (error) {
            console.error('Error checking user permission:', error);
            return false;
        }
    }
}