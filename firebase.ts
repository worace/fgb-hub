// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth, User } from "firebase/auth";
import {
  collection,
  Firestore,
  getDocs,
  getFirestore,
} from "firebase/firestore/lite";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

export interface Fgb {
  url: string;
}

export class FireStore {
  public app: FirebaseApp;
  public db: Firestore;
  public auth: Auth;
  constructor(app: FirebaseApp, db: Firestore, auth: Auth) {
    this.app = app;
    this.db = db;
    this.auth = auth;
  }

  async getFgbs(): Promise<Fgb[]> {
    const col = collection(this.db, "fgbs");
    const snapshot = await getDocs(col);
    let docs = [];
    snapshot.docs.forEach((d) => docs.push(d.data() as Fgb));
    return docs;
  }

  currentUser(): User | null {
    const auth = getAuth();
    return auth.currentUser;
  }
}

export default {
  firebaseConfig: {
    apiKey: "AIzaSyCyG0WXAEM5RR6GnHo26vej-XRmwunJTQk",
    authDomain: "fgbhub-d8c91.firebaseapp.com",
    projectId: "fgbhub-d8c91",
    storageBucket: "fgbhub-d8c91.appspot.com",
    messagingSenderId: "634624353664",
    appId: "1:634624353664:web:19ed129093c6e18bb2cd65",
  },
  init(): FireStore {
    const app = initializeApp(this.firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth();
    return new FireStore(app, db, auth);
  },
};
