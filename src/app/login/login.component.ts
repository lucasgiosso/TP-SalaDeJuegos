import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private router: Router, private auth: AuthService) { }

  credenciales = { email: '', password: '' }

  async login() {
    // console.log('credenciales ->', this.credenciales);
    try {
      await this.auth.login(this.credenciales.email, this.credenciales.password);
      Swal.fire({
        icon: 'success',
        title: 'Inicio de sesión exitoso',
        showConfirmButton: false,
        timer: 1500
      });
      this.router.navigate(['home']);
    } catch (error: any) {
      if (error.code !== 'auth/invalid-email') {
        console.error('Error al iniciar sesión', error);
      }
      let errorMessage = 'Credenciales incorrectas';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      }
      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: errorMessage,
        timer: 1500
      });
    }
  }
  
  
  register() {
    this.router.navigate(['register']);
  }
}
