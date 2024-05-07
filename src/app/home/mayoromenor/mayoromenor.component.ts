import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../src/app/services/auth.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { ChatComponent } from '../../../chat/chat.component';

@Component({
  selector: 'app-mayoromenor',
  standalone: true,
  imports: [FormsModule,CommonModule,ChatComponent],
  templateUrl: './mayoromenor.component.html',
  styleUrl: './mayoromenor.component.css'
})
export class MayoromenorComponent {

  title = "";
  btnVolver = 'Volver a Home';
  currentCard: number = 0;
  currentCard1: number = 0;
  nextCard: number = 0;
  nextCard1: number = 0;
  lastCard: number | null = null;
  currentUser$: Observable<User | null>;
  resultMessageText: string = ''; 
  score: number = 0;
  lastCards: number[] = [];
  isDropdownOpen = false;
  showLogoutButton = false;
  
  @ViewChild('resultMessage', { static: false }) resultMessageElement: ElementRef | undefined;

  constructor(private auth: AuthService, private router: Router) 
  {
    this.currentUser$ = this.auth.getCurrentUser();

  }
    
  ngOnInit() {
    this.currentUser$ = this.auth.getCurrentUser();
    this.startGame();
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  onDocumentClick(event: MouseEvent) {
    if (!(<HTMLElement>event.target).closest('.navbar-custom')) {
      this.isDropdownOpen = false;
    }
  }

  startGame() {
    this.title = "Juego del Mayor o Menor";
    this.currentCard = this.getRandomCard();
    this.currentCard1 = this.getRandomCard1();
    this.nextCard = this.getRandomCard();
    this.resultMessageText = '';

    //console.log("Carta inicio: " + this.currentCard + "-" + this.currentCard1);

  }

  getRandomCard(): number {
    let card: number;
    do {
      card = Math.floor(Math.random() * 10) + 1;
    } while (card === this.lastCard);

  
    this.lastCard = card; 
    return card;
  }

  getRandomCard1(): number {
    let card: number;
    do {
      card = Math.floor(Math.random() * 4) + 1;
    } while (card === this.lastCard);
  
    this.lastCard = card; 
    return card;
  }

  makeGuess(guess: 'mayor' | 'menor') {
    this.nextCard = this.getRandomCard();
    this.nextCard1 = this.getRandomCard1();
    
    //console.log("Carta a adivinar: " + this.nextCard + "-" + this.nextCard1 );

    if (this.nextCard === this.currentCard) {
      this.resultMessageText = '¡Las cartas son iguales! Recorda que no sumas puntos.';
    } 
    else if ((guess === 'mayor' && this.nextCard > this.currentCard) ||
        (guess === 'menor' && this.nextCard < this.currentCard)) {
      this.resultMessageText = '¡Correcto!'; 
      this.score++;
    } 
    else {
      this.resultMessageText = '¡Incorrecto!'; 
    }

    this.currentCard = this.nextCard;
    this.currentCard1 = this.nextCard1;

    this.showResult();
  }

  showResult() {

    this.resultMessageElement?.nativeElement.classList.add('show');
    setTimeout(() => {

      this.resultMessageElement?.nativeElement.classList.remove('show');
    }, 1000);
  }

  public onClick(event: any): void {
    this.router.navigate(['/home']);
    //console.log(event);
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
        this.router.navigate(['/home/mayorOMenor']);
      }
    });
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

}
