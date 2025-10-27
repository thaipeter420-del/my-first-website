// ระบบ Auto Backup แบบละเอียด
class EnhancedBackup extends BackupRestore {
    constructor() {
        super();
        this.storageRef = firebase.storage().ref();
    }

    // สร้าง Backup และเก็บใน Firebase Storage
    async createCloudBackup() {
        try {
            const backup = await this.generateBackupData();
            
            // สร้างชื่อไฟล์ด้วยวันที่และเวลา
            const timestamp = new Date().toISOString();
            const filename = `backups/${timestamp}-stock-system.json`;
            
            // อัพโหลดไปยัง Firebase Storage
            const backupRef = this.storageRef.child(filename);
            await backupRef.putString(JSON.stringify(backup), 'raw', {
                contentType: 'application/json',
            });

            // บันทึกข้อมูล Backup ใน Firestore
            await this.db.collection('backups').add({
                filename: filename,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                size: JSON.stringify(backup).length,
                createdBy: firebase.auth().currentUser?.email || 'system'
            });

            // บันทึก log
            await dbOperations.addLog('cloud_backup', `สร้าง Cloud Backup: ${filename}`);

            return { success: true, filename };
        } catch (error) {
            console.error('Error creating cloud backup:', error);
            throw error;
        }
    }

    // ดึงรายการ Backup
    async getBackupList() {
        try {
            const snapshot = await this.db.collection('backups')
                .orderBy('timestamp', 'desc')
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting backup list:', error);
            throw error;
        }
    }

    // ลบ Backup เก่า
    async cleanupOldBackups(daysToKeep = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const snapshot = await this.db.collection('backups')
                .where('timestamp', '<', cutoffDate)
                .get();

            // ลบไฟล์และข้อมูล
            const batch = this.db.batch();
            for (const doc of snapshot.docs) {
                const data = doc.data();
                
                // ลบจาก Storage
                await this.storageRef.child(data.filename).delete();
                
                // เตรียมลบจาก Firestore
                batch.delete(doc.ref);
            }

            await batch.commit();
            await dbOperations.addLog('cleanup_backups', `ลบ Backup เก่ากว่า ${daysToKeep} วัน`);

            return { success: true, deleted: snapshot.size };
        } catch (error) {
            console.error('Error cleaning up old backups:', error);
            throw error;
        }
    }

    // ตั้งเวลา Auto Backup
    setupAutoBackup(intervalHours = 24) {
        setInterval(async () => {
            try {
                const lastBackup = (await this.getBackupList())[0];
                const now = new Date();
                
                // ถ้าไม่มี backup หรือ backup ล่าสุดเก่ากว่า intervalHours
                if (!lastBackup || 
                    (now - lastBackup.timestamp.toDate()) > (intervalHours * 60 * 60 * 1000)) {
                    await this.createCloudBackup();
                    await this.cleanupOldBackups();
                }
            } catch (error) {
                console.error('Error in auto backup:', error);
            }
        }, 60 * 60 * 1000); // เช็คทุกชั่วโมง
    }

    // กู้คืนจาก Cloud Backup
    async restoreFromCloud(backupId) {
        try {
            const backupDoc = await this.db.collection('backups').doc(backupId).get();
            if (!backupDoc.exists) throw new Error('ไม่พบ Backup ที่ระบุ');

            const backupData = backupDoc.data();
            const fileRef = this.storageRef.child(backupData.filename);
            
            // ดาวน์โหลดไฟล์
            const url = await fileRef.getDownloadURL();
            const response = await fetch(url);
            const backup = await response.json();

            // ทำการกู้คืน
            await this.restoreFromData(backup);
            
            await dbOperations.addLog('cloud_restore', `กู้คืนข้อมูลจาก Cloud Backup: ${backupData.filename}`);

            return { success: true };
        } catch (error) {
            console.error('Error restoring from cloud:', error);
            throw error;
        }
    }
}