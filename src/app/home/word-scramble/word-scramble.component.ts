import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../src/app/services/auth.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from '../../../chat/chat.component';
import { CommonModule } from '@angular/common';


interface Word {
  word: string;
  hint: string;
}

@Component({
  selector: 'app-word-scramble',
  standalone: true,
  imports: [FormsModule, CommonModule, ChatComponent],
  templateUrl: './word-scramble.component.html',
  styleUrl: './word-scramble.component.css'
})
export class WordScrambleComponent implements OnInit{

  wordText: HTMLElement | null = null;
  hintText: HTMLElement | null = null;
  timeText: HTMLElement | null = null;
  inputField: HTMLInputElement | null = null;
  refreshBtn: HTMLElement | null = null;
  checkBtn: HTMLElement | null = null;
  resultMessageText: string = ''; 
  score: number = 0;

  correctWord = '';
  timer: any;
  title = "";
  btnVolver = 'Volver a Home';
  currentUser$: Observable<User | null>;
  isDropdownOpen = false;
  showLogoutButton = false;
  gameStarted: boolean = false;

  words: Word[] = [
    {
      word: "sumar",
      hint: "El proceso de agregar numeros"
    },
    {
      word: "encuentro",
      hint: "Evento en el que se reúnen personas"
    },
    {
      word: "numero",
      hint: "Simbolo matematico usado para contar"
    }
  ];

  constructor(private auth: AuthService, private router: Router) 
  {
    this.currentUser$ = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.wordText = document.querySelector(".word");
    this.hintText = document.querySelector(".hint span");
    this.timeText = document.querySelector(".time b");
    this.inputField = document.querySelector("input");
    this.refreshBtn = document.querySelector(".refresh-word");
    this.checkBtn = document.querySelector(".check-word");
    this.currentUser$ = this.auth.getCurrentUser();
    this.refreshBtn?.addEventListener("click", () => {
      //this.initGame();
    });

    document.addEventListener('click', this.onDocumentClick.bind(this));
    
    this.checkBtn?.addEventListener("click", () => {
      this.checkWord();
    });

    //this.initGame();
  }

  public onClick(event: any): void {
    this.stopTimer();
    this.router.navigate(['/home']);
    //console.log(event);
  }

  onDocumentClick(event: MouseEvent) {
    if (!(<HTMLElement>event.target).closest('.navbar-custom')) {
      this.isDropdownOpen = false;
    }
  }

  initGame(): void {
    this.initTimer(30);
    const randomObj = this.words[Math.floor(Math.random() * this.words.length)];
    const wordArray = randomObj.word.split("");
    for (let i = wordArray.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }
    if (this.wordText && this.hintText) {
      this.wordText.innerText = wordArray.join("");
      this.hintText.innerText = randomObj.hint;
    }
    this.correctWord = randomObj.word.toLowerCase();
    if (this.inputField) {
      this.inputField.value = "";
    }
  }

  clearInputField(): void {
    if (this.inputField) {
      this.inputField.value = '';
    }
  }

  checkWord(): void {

    if (!this.inputField) {
      Swal.fire({
        icon: 'error',
        title: 'Uh...',
        text: 'Por favor, ingrese la palabra para chequear!',
      });
      return;
    }
    const userWord = this.inputField.value.toLowerCase();
    
    if (userWord !== this.correctWord) 
    {
      Swal.fire({
        icon: 'error',
        title: 'Mmmm... no',
        text: `${userWord} no es la palabra correcta.`,
      });
      this.clearInputField();
    } 
    else {
      Swal.fire({
        icon: 'success',
        title: 'Felicitaciones!',
        text: `${this.correctWord.toUpperCase()} es la palabra correcta.`,
      });
      this.score++;
      this.initGame();
  }

  }

  refreshGame(): void {
    this.initGame();
  }

  async initTimer(maxTime: number): Promise<void> {
    clearInterval(this.timer);
    let timeUp = false;
  
    this.timer = setInterval(async () => {
      if (maxTime > 0 && !timeUp) {
        maxTime--;
        if (this.timeText) {
          this.timeText.innerText = maxTime.toString();
        }
      } else if (!timeUp) {
        timeUp = true;
        const swalResult = await Swal.fire({
          icon: 'error',
          title: 'Uh...perdiste',
          text: `Tiempo finalizado! ${this.correctWord.toUpperCase()} era la palabra correcta. ¿Quieres continuar jugando con otra palabra?`,
          showCancelButton: true,
          confirmButtonText: 'Si!',
          cancelButtonText: 'No',
        });
  
        if (swalResult.isConfirmed) {
          this.initGame();
        }
        else {
          this.router.navigate(['/home']);
      }
    }
    }, 1000);
  }

  startGame() {

    this.gameStarted = true;
    this.initGame();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
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
          //console.log('Route link clicked: logout');
          await this.auth.logout();
          this.stopTimer();
          this.router.navigate(['/login']);
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        }
      } else {
        this.router.navigate(['/home/word-scramble']);
      }
    });
  }

  stopTimer(): void {
    clearInterval(this.timer);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }


}
