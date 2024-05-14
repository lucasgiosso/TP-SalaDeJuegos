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
  failedAttempts: number = 0;

  words: Word[] = [
    {
      word: "angular",
      hint: "Plataforma de desarrollo, construida sobre TypeScript."
    },
    {
      word: "encuentro",
      hint: "Evento en el que se reúnen personas."
    },
    {
      word: "numero",
      hint: "Simbolo matemático usado para contar."
    },
    {
      word: "montaña",
      hint: "Elevación natural del terreno de gran altura.",
    },
    {
      word: "computadora",
      hint: "Dispositivo electrónico utilizado para procesar información.",
    },
    {
      word: "jirafa",
      hint: "Animal de cuello largo y patas largas originario de África.",
    },
    {
      word: "telescopio",
      hint: "Instrumento óptico para observar objetos lejanos.",
    },
    {
      word: "aventura",
      hint: "Experiencia emocionante o arriesgada.",
    },

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

    });

    document.addEventListener('click', this.onDocumentClick.bind(this));
    
    this.checkBtn?.addEventListener("click", () => {
      this.checkWord();
    });

  }

  public onClick(event: any): void {
    this.stopTimer();
    this.router.navigate(['/home']);

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

  checkWord(): void 
  {

      if (!this.inputField) {
        Swal.fire({
          icon: 'error',
          title: 'Uh...',
          text: 'Por favor, ingrese la palabra para chequear!',
        });
        return;
      }
      const userWord = this.inputField.value.toLowerCase();
      
      if (userWord !== this.correctWord) {
        this.failedAttempts++;
        const remainingAttempts = 3 - this.failedAttempts;
        if (this.failedAttempts >= 3) {
          this.stopTimer();
          Swal.fire({
            icon: 'error',
            title: 'Lo siento...',
            text: `Has superado el límite de intentos. La palabra correcta era ${this.correctWord.toUpperCase()}. ¿Quieres seguir jugando?`,
            confirmButtonText: 'Si!',
            showCancelButton: true, 
            cancelButtonText: 'Salir',
            allowOutsideClick: false
            
          }).then((result) => {
            if (result.isConfirmed) {
              this.failedAttempts = 0;
              this.score++;
              this.initGame();
            }
            else if (result.dismiss === Swal.DismissReason.cancel) {
              this.router.navigate(['/home']); 
            }
          });
        } else {

          Swal.fire({
            icon: 'error',
            title: 'Mmmm... no',
            html: `<strong>${userWord.toUpperCase()}</strong> no es la palabra correcta. Te quedan <strong>${remainingAttempts}</strong> intentos. <strong>Recorda que el tiempo sigue pasando...</strong>`,
            position: 'top',
          });
          this.clearInputField();
        }
      }
      else {
        this.stopTimer();
        Swal.fire({
          icon: 'success',
          title: 'Felicitaciones!',
          html: `<strong>${this.correctWord.toUpperCase()}</strong> es la palabra correcta. ¿Quieres seguir jugando?`,
          confirmButtonText: 'Si!',
          showCancelButton: true, 
          cancelButtonText: 'Salir',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            
            this.score++;
            this.initGame();
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            this.router.navigate(['/home']); 
          }
        });
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
