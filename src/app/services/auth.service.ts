import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from '@angular/fire/auth';
import { User, UserCredential, sendPasswordResetEmail } from 'firebase/auth';
import { Observable } from 'rxjs';
import { DatabaseService } from './database.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private authFirebase: Auth, private dataBase: DatabaseService) { }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.authFirebase, email, password)
      .then((userCredential: UserCredential) => {
        const user = userCredential.user;
        if (user) {
          const { email } = user;
          this.dataBase.guardarLogin(email)
        }
        return userCredential;
      })
  }

  async register(email: string, password: string) {
    const user = await createUserWithEmailAndPassword(this.authFirebase, email, password);
    return await signInWithEmailAndPassword(this.authFirebase, email, password);
  }


  async checkIfUserExists(email: string) {
    return fetchSignInMethodsForEmail(this.authFirebase, email)
      .then((signInMethods) => signInMethods && signInMethods.length > 0)
      .catch((error) => {
        console.error('Error al verificar el usuario:', error);
        return false;
      });
  }

  async sendPasswordResetEmail(email: string) {
    try {
      const userExists = await this.checkIfUserExists(email);
      if (userExists) {
        return sendPasswordResetEmail(this.authFirebase, email);
      } else {
        throw new Error('El correo electrónico no está asociado a ninguna cuenta');
      }
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser(): Observable<User | null> {
    return new Observable((observer) => {
      const unsubscribe = this.authFirebase.onAuthStateChanged((user: User | null) => {
        observer.next(user);
      });
      return () => {
        unsubscribe();
      };
    });
  }

  logout() {
    return this.authFirebase.signOut();
  }
}
