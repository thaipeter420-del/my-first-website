// เปลี่ยน config นี้เป็นของคุณที่ได้จาก Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBFPLcmEpYMQuKarhWk6q1TDdUyr9zSTjI",
    authDomain: "machineheart-inventory.firebaseapp.com",
    projectId: "machineheart-inventory",
    // Use the standard storage bucket hostname for Firebase Storage
    storageBucket: "machineheart-inventory.appspot.com",
    messagingSenderId: "1004371974189",
    appId: "1:1004371974189:web:e887e83999b32bceeb40a4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Expose commonly used Firebase instances as globals so the other non-module scripts
// that expect `firebase`, `db`, `auth`, and `storage` to be available will work.
window.firebaseApp = firebase.app();
window.auth = firebase.auth();
window.db = firebase.firestore();
window.storage = firebase.storage();

console.log('Firebase initialized:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket
});