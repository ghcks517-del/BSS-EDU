import { User } from './types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

export const loadUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
};

export const saveUser = async (user: User) => {
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
  }
};

export const deleteUserAuth = async (userId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'users');
  }
};

export const getAdminPassword = async () => {
  try {
    // If we want a dynamic admin password, we could store it in Firestore
    // For simplicity, we just use a hardcoded fallback or document
    const d = await getDoc(doc(db, 'settings', 'admin'));
    if (d.exists()) {
      return d.data().password as string;
    }
  } catch (e) {
    // ignore
  }
  return '2026';
};

