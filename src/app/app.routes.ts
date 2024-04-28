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
        path: '**',
        loadComponent: () => import('./error/error.component').then(m => m.ErrorComponent)
    },


];