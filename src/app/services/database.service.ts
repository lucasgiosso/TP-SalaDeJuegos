import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private firestore: Firestore) { }

  guardarLogin(email: string | null) {
  
    const firebaseCollection = 'userLogin';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const loginDate = new Date().toLocaleDateString('es-ES', options);
    const loginData = {
      Usuario: email,
      Fecha_Ingreso: loginDate,
    };
  
    const collectionRef = collection(this.firestore, firebaseCollection);
  
    setDoc(doc(collectionRef), loginData)
      .then(() => {
        console.log('Inicio de sesión guardado en Firestore');
      })
      .catch((error: any) => {
        console.error('Error al guardar en Firestore: ', error);
      });
    }
}
