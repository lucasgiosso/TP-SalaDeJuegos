import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private authFirebase: Auth) { }

  login(email: string, password: string)
  {
    return signInWithEmailAndPassword(this.authFirebase,email,password)
  }

  async register(email: string, password: string) 
  {
    const user = await createUserWithEmailAndPassword(this.authFirebase,email, password);
    return await signInWithEmailAndPassword(this.authFirebase,email, password);
  }


  async checkIfUserExists(email: string) {
    return fetchSignInMethodsForEmail(this.authFirebase, email)
      .then((signInMethods) => signInMethods && signInMethods.length > 0)
      .catch((error) => {
        console.error('Error al verificar el usuario:', error);
        return false;
      });
  }

  logout() {
    return this.authFirebase.signOut();
  }
}
