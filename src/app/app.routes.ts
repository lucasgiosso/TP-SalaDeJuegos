import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
    },
    {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'home/quiensoy',
        loadComponent: () => import('./home/quiensoy/quiensoy.component').then((m) => m.QuiensoyComponent),
    },
    {
        path: 'register',
        loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'home/ahorcado',
        loadComponent: () => import('./home/ahorcado/ahorcado.component').then(m => m.AhorcadoComponent)
    },
    {
        path: 'chat',
        loadComponent: () => import('../chat/chat.component').then(m => m.ChatComponent)
    },
    {
        path: 'home/mayoromenor',
        loadComponent: () => import('./home/mayoromenor/mayoromenor.component').then(m => m.MayoromenorComponent)
    },
    {
        path: 'home/word-scramble',
        loadComponent: () => import('./home/word-scramble/word-scramble.component').then(m => m.WordScrambleComponent)
    },
    {
        path: 'home/preguntados',
        loadComponent: () => import('./home/preguntados/preguntados.component').then(m => m.PreguntadosComponent)
    },
    {
        path: '**',
        loadComponent: () => import('./error/error.component').then(m => m.ErrorComponent)
    },


];