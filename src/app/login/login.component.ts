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
  defaultEmail = 'admin@test.com';
  defaultPassword = '123456';

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

  async forgotPassword() {
    const { value: email } = await Swal.fire({
      title: 'Ingrese su correo electrónico',
      input: 'email',
      inputLabel: 'Correo electrónico',
      inputPlaceholder: 'Ingrese su correo electrónico',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      inputValidator: (value) => {
        if (!value) {
          return 'Debe ingresar su correo electrónico';
        }
        return null;
      }
    });
  
    if (email) {
      try {
        await this.auth.sendPasswordResetEmail(email);
        Swal.fire({
          icon: 'success',
          title: 'Correo electrónico enviado',
          text: 'Se ha enviado un correo electrónico con instrucciones para restablecer su contraseña.',
        });
      } catch (error: any) {
        console.error('Error al enviar correo electrónico:', error);
        if (error.message === 'El correo electrónico no está asociado a ninguna cuenta') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El correo electrónico no está asociado a ninguna cuenta. Por favor, verifique su correo electrónico e inténtelo de nuevo.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al enviar el correo electrónico. Por favor, inténtelo de nuevo más tarde.',
          });
        }
      }
    }
  }

  loginLoad() {
    this.credenciales.email = 'admin@test.com';
    this.credenciales.password = '123456';
  }
  
  
  register() {
    this.router.navigate(['register']);
  }
}
