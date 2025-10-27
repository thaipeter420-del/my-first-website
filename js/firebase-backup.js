// ระบบ Backup/Restore
class BackupRestore {
    constructor() {
        this.db = firebase.firestore();
    }

    // สร้างไฟล์ Backup
    async createBackup() {
        try {
            const backup = {
                timestamp: new Date().toISOString(),
                data: {}
            };

            // ดึงข้อมูลทั้งหมด
            const collections = ['parts', 'transactions', 'settings', 'logs'];
            for (const collection of collections) {
                const snapshot = await this.db.collection(collection).get();
                backup.data[collection] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }

            // สร้างไฟล์ JSON
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `stock-system-backup-${backup.timestamp}.json`;
            a.click();
            window.URL.revokeObjectURL(url);

            showAlert('สร้างไฟล์สำรองข้อมูลสำเร็จ', 'success');
        } catch (error) {
            showAlert('สร้างไฟล์สำรองข้อมูลไม่สำเร็จ: ' + error.message, 'error');
        }
    }

    // นำเข้าข้อมูลจากไฟล์ Backup
    async restoreFromFile(file) {
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    // ตรวจสอบโครงสร้างข้อมูล
                    if (!backup.data || !backup.timestamp) {
                        throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');
                    }

                    // เริ่มการนำเข้าข้อมูล
                    const batch = this.db.batch();

                    // ลบข้อมูลเก่า
                    for (const collection of Object.keys(backup.data)) {
                        const snapshot = await this.db.collection(collection).get();
                        snapshot.docs.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                    }

                    // เพิ่มข้อมูลใหม่
                    for (const [collection, documents] of Object.entries(backup.data)) {
                        documents.forEach(doc => {
                            const ref = this.db.collection(collection).doc(doc.id);
                            batch.set(ref, doc);
                        });
                    }

                    await batch.commit();
                    showAlert('นำเข้าข้อมูลสำเร็จ', 'success');
                    
                    // บันทึก log
                    await dbOperations.addLog('restore', `นำเข้าข้อมูลจากไฟล์สำรอง ${backup.timestamp}`);
                    
                    // รีเฟรชหน้าเว็บ
                    location.reload();
                } catch (error) {
                    showAlert('นำเข้าข้อมูลไม่สำเร็จ: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        } catch (error) {
            showAlert('นำเข้าข้อมูลไม่สำเร็จ: ' + error.message, 'error');
        }
    }

    // สร้าง Backup อัตโนมัติ (เรียกทุกวัน)
    async scheduleAutoBackup() {
        const now = new Date();
        const last = localStorage.getItem('lastAutoBackup');
        
        if (!last || now - new Date(last) > 24 * 60 * 60 * 1000) {
            await this.createBackup();
            localStorage.setItem('lastAutoBackup', now.toISOString());
        }
    }
}