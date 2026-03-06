import { initializeApp, getApps, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let _app: App | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

function getAdminApp(): App {
    if (_app) return _app;

    if (getApps().length > 0) {
        _app = getApps()[0];
        return _app;
    }

    const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
        clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    _app = initializeApp({
        credential: cert(serviceAccount),
    });

    return _app;
}

export function getAdminAuth(): Auth {
    if (!_auth) {
        getAdminApp();
        _auth = getAuth();
    }
    return _auth;
}

export function getAdminDb(): Firestore {
    if (!_db) {
        getAdminApp();
        _db = getFirestore();
    }
    return _db;
}
