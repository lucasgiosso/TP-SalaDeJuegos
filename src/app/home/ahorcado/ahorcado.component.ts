import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../src/app/services/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../../../chat/chat.component';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [FormsModule, CommonModule, ChatComponent],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent implements OnInit{

  title = "";
  public btnVolver = 'Volver a Home';
  palabrasSecretas : string[] = ["CASA", "AUTO", "ARBOL", "CIELO", "GATO"];
  palabraSecreta: string = "";
  palabraOculta : string = "";
  palabraOcultaArreglo : string = "";
  intentos = 0;
  currentUser$: Observable<User | null>;
  isDropdownOpen = false;
  showLogoutButton = false;
  puntaje = 0;
  gano = false;
  perdio = false;
  letras = [
    "a","b","c","d","e","f","g","h","i","j","k",
    "l","m","n","o","p","q","r","s","t","u","v",
    "w","x","y","z"
  ];

  constructor(private router: Router, private auth: AuthService,) {
    
      this.currentUser$ = this.auth.getCurrentUser();
  }

  ngOnInit() {
    this.currentUser$ = this.auth.getCurrentUser();
    this.iniciarNuevoJuego();
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  public onClick(event: any): void 
  {
    this.router.navigate(['/home']);
    //console.log(event);
  }
  
  elegirPalabraSecreta() {
    const indiceAleatorio = Math.floor(Math.random() * this.palabrasSecretas.length);
    this.palabraSecreta = this.palabrasSecretas[indiceAleatorio];
    console.log(this.palabraSecreta);
  }
  
  iniciarNuevoJuego() {
    
    this.elegirPalabraSecreta(); 

    this.palabraOculta = "_ ".repeat(this.palabraSecreta.length);
    
    this.title = "Juego del Ahorcado";
    this.intentos = 0;
    this.gano = false;
    this.perdio = false;
    this.letras = [
      "a","b","c","d","e","f","g","h","i","j","k",
      "l","m","n","o","p","q","r","s","t","u","v",
      "w","x","y","z"
    ];
  }

  comprobar(letra: string) {
    if (!this.letras.includes(letra)) {

      return;
    }
  
    let palabraOcultaArr = this.palabraOculta.split(' ');
    let acierto = false;
  
    for (let i = 0; i < this.palabraSecreta.length; i++) {
      if (this.palabraSecreta[i].toLowerCase() === letra.toLowerCase()) {

        palabraOcultaArr[i] = this.palabraSecreta[i];
        acierto = true;
      }
    }
  
    if (!acierto) {

      this.intentos++;
    }
  
    this.letras = this.letras.filter((letraDisponible) => letraDisponible !== letra);

    this.palabraOculta = palabraOcultaArr.join(' ');

    if (this.intentos === 8) {
      this.perdio = true;
      this.mostrarMensajePerdedor();
    }
  
    if (!this.palabraOculta.includes('_')) {
      this.gano = true;
      this.mostrarMensajeGanador();
    }
  }
  
  verificaGanador() {

    const palabraArr = this.palabraOculta.split(" ");
    const palabraEvaluar = palabraArr.join("");
      
    if (palabraEvaluar === this.palabraSecreta) {
      this.gano = true;
      this.puntaje++;
      this.mostrarMensajeGanador();
    }
    if (this.intentos === 9) {
      this.perdio = true;
      this.mostrarMensajePerdedor();
    }
  }

  mostrarMensajeGanador() {
    this.puntaje++;
    Swal.fire({
      icon: 'success',
      title: '¡Ganaste!',
      text: `Has adivinado la palabra correctamente. Puntaje actual: ${this.puntaje}`,
      showCancelButton: true,
      cancelButtonText: 'Volver a jugar',
      confirmButtonText: 'Salir',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        this.iniciarNuevoJuego();
      } else if (result.isConfirmed) {

        this.router.navigate(['/home']);
      }
    });
  }
  
  mostrarMensajePerdedor() {
    
    Swal.fire({
      icon: 'error',
      title: '¡Perdiste!',
      text: 'Has agotado tus intentos.',
      html: `La palabra correcta era: <strong>${this.palabraSecreta}</strong>`,
      showCancelButton: true,
      cancelButtonText: 'Volver a jugar',
      confirmButtonText: 'Salir',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        this.iniciarNuevoJuego();
      } else if (result.isConfirmed) {

        this.router.navigate(['/home']);
      }
    });
  
  }

  existeLetra(letra: string) {

    const letraMinuscula = letra.toLowerCase();
    const palabraSecretaMinuscula = this.palabraSecreta.toLowerCase();
  
    if (palabraSecretaMinuscula.includes(letraMinuscula)) {

    } else {
      this.intentos++;
    }
  }

  onDocumentClick(event: MouseEvent) {
    if (!(<HTMLElement>event.target).closest('.navbar-custom')) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.showLogoutButton = this.isDropdownOpen; 
  }

  async logout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Lamentamos que quieras salir...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log('Route link clicked: logout');
          await this.auth.logout();
          this.router.navigate(['/login']);
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        }
      } else {
        this.router.navigate(['/home/ahorcado']);
      }
    });
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }


}
