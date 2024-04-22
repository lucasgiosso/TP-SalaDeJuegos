import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  nombre: string = '';
  password: string = '';
  repetirPassword: string = '';
  username: string = '';
  email: string = '';

  constructor(private router: Router, private auth: AuthService) {}


  async register() {
    if (!this.nombre || !this.password || !this.repetirPassword || !this.username || !this.email) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, completa todos los campos obligatorios.'
      });
      return;
    }
  
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    if (!emailPattern.test(this.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el correo electrónico',
        text: 'El formato del correo electrónico es incorrecto. Por favor, verifica.',
      });
      return;
    }
  
    if (this.password !== this.repetirPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden. Por favor, inténtalo de nuevo.'
      });
      return;
    }
  
    try {
      if (this.password.length < 6) {
        throw { code: 'auth/weak-password' };
      }
  
      // Verificar si el usuario ya está registrado
      const userExists = await this.auth.checkIfUserExists(this.email);
  
      if (userExists) {
        Swal.fire({
          icon: 'error',
          title: 'Usuario existente',
          text: 'El correo electrónico ya está registrado. Inicia sesión en lugar de registrarte.',
        });
        return;
      }
  
      // Intentar registrar al usuario
      const userCredential = await this.auth.register(this.email, this.password);
  
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: '¡Bienvenido!',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/home']);
      });
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        Swal.fire({
          icon: 'error',
          title: 'Error en el correo electrónico',
          text: 'El formato del correo electrónico es incorrecto. Por favor, verifica.',
        });
      } else if (error.code === 'auth/weak-password') {
        Swal.fire({
          icon: 'error',
          title: 'Contraseña débil',
          text: 'La contraseña es demasiado débil. Debe contener al menos 6 caracteres.',
        });
      } else if (error.code === 'auth/email-already-in-use') {
        Swal.fire({
          icon: 'error',
          title: 'Usuario existente',
          text: 'El correo electrónico ya está registrado. Inicia sesión en lugar de registrarte.',
        });
      } else {
        console.error('Error en el registro:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error en el registro',
          text: 'Hubo un error al registrar tu cuenta. Por favor, verifica tus datos.',
        });
      }
    }
  }
  
  
  
  
  goToLogin(){
    this.router.navigate(['/login']);
  }
}
