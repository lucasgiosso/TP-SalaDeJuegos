import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"saladejuegos-f63ca","appId":"1:188644992726:web:c7cf521ab9198de30f0b77","storageBucket":"saladejuegos-f63ca.appspot.com","apiKey":"AIzaSyBA-vZk1vTzwoUyStb2Rf7lk2Oem1X_r9Q","authDomain":"saladejuegos-f63ca.firebaseapp.com","messagingSenderId":"188644992726"}))), importProvidersFrom(provideAuth(() => getAuth()))]
};
