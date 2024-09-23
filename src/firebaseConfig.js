// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAxrmGxA_bCb407tZKLBccK5-Dll9avP7k',
  authDomain: 'itergo.firebaseapp.com',
  projectId: 'itergo',
  storageBucket: 'itergo.appspot.com',
  messagingSenderId: '780368276744',
  appId: '1:780368276744:web:c5150388c121b9542290bd',
  // measurementId: 'G-5447LH9K2H',
  databaseURL: 'https://itergo-default-rtdb.europe-west1.firebasedatabase.app',
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getDatabase(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCcfFhpSISNpxnVD_PFXutL-0OxoqErPlM';
