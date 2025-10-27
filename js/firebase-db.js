// Database Operations
const dbOperations = {
    // Parts
    async getParts() {
        try {
            const snapshot = await db.collection('parts').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting parts:', error);
            return [];
        }
    },

    async saveParts(parts) {
        try {
            const batch = db.batch();
            parts.forEach(part => {
                const ref = db.collection('parts').doc(part.id || generateSimpleId());
                batch.set(ref, part);
            });
            await batch.commit();
        } catch (error) {
            console.error('Error saving parts:', error);
            throw error;
        }
    },

    // Transactions
    async getTransactions() {
        try {
            const snapshot = await db.collection('transactions').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    },

    async saveTransactions(transactions) {
        try {
            const batch = db.batch();
            transactions.forEach(transaction => {
                const ref = db.collection('transactions').doc(transaction.id || generateSimpleId());
                batch.set(ref, transaction);
            });
            await batch.commit();
        } catch (error) {
            console.error('Error saving transactions:', error);
            throw error;
        }
    },

    // Settings
    async getSettings() {
        try {
            const doc = await db.collection('settings').doc('appSettings').get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting settings:', error);
            return null;
        }
    },

    async saveSettings(settings) {
        try {
            await db.collection('settings').doc('appSettings').set(settings);
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    },

    // Logs
    async getLogs() {
        try {
            const snapshot = await db.collection('logs').orderBy('timestamp', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting logs:', error);
            return [];
        }
    },

    async saveLogs(logs) {
        try {
            const batch = db.batch();
            logs.forEach(log => {
                const ref = db.collection('logs').doc(log.id || generateSimpleId());
                batch.set(ref, log);
            });
            await batch.commit();
        } catch (error) {
            console.error('Error saving logs:', error);
            throw error;
        }
    },

    async addLog(action, details) {
        try {
            const log = {
                action,
                details,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                id: generateSimpleId()
            };
            await db.collection('logs').doc(log.id).set(log);
        } catch (error) {
            console.error('Error adding log:', error);
            throw error;
        }
    }
};