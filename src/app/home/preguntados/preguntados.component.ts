import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../../../src/app/services/auth.service';
import { ApiService } from '../../../../src/app/services/api.service';
import { Observable, Subject, Subscription, of, takeUntil, takeWhile, timer } from 'rxjs';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from '../../../chat/chat.component';
import { CommonModule } from '@angular/common';
import { faL } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,ChatComponent],
  templateUrl: './preguntados.component.html',
  styleUrl: './preguntados.component.css'
})
export class PreguntadosComponent {

  @ViewChild('banderaImg') banderaImg!: ElementRef;

  title = "Preguntados";
  explicacion = "Presiona el boton para que aparezca tu pregunta."
  isDropdownOpen = false;
  paises: any[] = [];
  showLogoutButton = false;
  currentUser$: Observable<User | null>;
  btnVolver = 'Volver a Home';
  gameActive: boolean = true;
  data: any[] = [];
  timeIsUpAlertShown: boolean = false;
  questionText: string = '';
  answerText: string = '';
  secondsLeft: number = 30; 
  timer$: Observable<number> = timer(0, 1000);
  destroy$: Subject<void> = new Subject<void>();
  userAnswer: string = '';
  isAnswered: boolean = false;
  score: number = 0;
  answerOptions: string[] = [];
  selectedPregunta: string = '';
  private isSpinning: boolean = false;
  showRoulette = true;
  sectorImages: string[] = [];
  private timerSubscription: Subscription | null = null;
  selectedSector: number = 0;
  currentRotationValue: number = 0;
  selectedQuestion: any;
  isGameReset: boolean = false;

  preguntas = [
    {
      nombre:'France',
      pregunta: '¿Cuál es la capital de Francia?',
      respuestaCorrecta: 'París',
      respuestaIncorrecta1: 'Londres',
      respuestaIncorrecta2: 'Berlín',
      respuestaIncorrecta3: 'Madrid',
      sector: 1, 
      flagUrl:'https://flagcdn.com/fr.svg'

    },
    {
      nombre:'Argentina',
      pregunta: '¿Cuál es la capital de Argentina?',
      respuestaCorrecta: 'Buenos Aires',
      respuestaIncorrecta1: 'Chile',
      respuestaIncorrecta2: 'Rosario',
      respuestaIncorrecta3: 'Rio Negro',
      sector: 2, 
      flagUrl:'https://flagcdn.com/ar.svg'

    },
    {
      nombre:'Germany',
      pregunta: '¿Cuál es la capital de Alemania?',
      respuestaCorrecta: 'Berlín',
      respuestaIncorrecta1: 'Kabul',
      respuestaIncorrecta2: 'Argel',
      respuestaIncorrecta3: 'Viena',
      sector: 3, 
      flagUrl:'https://flagcdn.com/de.svg'

    },
    {
      nombre:'Albania',
      pregunta: '¿Cuál es la capital de Albania?',
      respuestaCorrecta: 'Tirana',
      respuestaIncorrecta1: 'Luanda',
      respuestaIncorrecta2: 'Ereván',
      respuestaIncorrecta3: 'Camberra',
      sector: 4, 
      flagUrl:'https://flagcdn.com/al.svg'

    },
    {
      nombre:'Belgium',
      pregunta: '¿Cuál es la capital de Bélgica?',
      respuestaCorrecta: 'Bruselas',
      respuestaIncorrecta1: 'Belmopán',
      respuestaIncorrecta2: 'Camberra',
      respuestaIncorrecta3: 'Gaborone',
      sector: 5, 
      flagUrl:'https://flagcdn.com/be.svg'

    },
    {
      nombre:'Brazil',
      pregunta: '¿Cuál es la capital de Brasil?',
      respuestaCorrecta: 'Brasilia',
      respuestaIncorrecta1: 'Uagadugú',
      respuestaIncorrecta2: 'Guitega',
      respuestaIncorrecta3: 'Timbu',
      sector: 6, 
      flagUrl:'https://flagcdn.com/br.svg'

    },
    {
      nombre:'Canada',
      pregunta: '¿Cuál es la capital de Canadá?',
      respuestaCorrecta: 'Ottawa',
      respuestaIncorrecta1: 'Doha',
      respuestaIncorrecta2: 'Yamena',
      respuestaIncorrecta3: 'Praia',
      sector: 7, 
      flagUrl:'https://flagcdn.com/ca.svg'
    },
  ];

  constructor(private auth: AuthService, private router: Router, private apiService : ApiService, private http: HttpClient) 
    {
      this.currentUser$ = this.auth.getCurrentUser();
      this.obtenerDatosDeTodosLosPaises();
    }


    ngOnInit() {
      this.apiService.obtenerPaises().subscribe((listaPaises: any) => {
        listaPaises.forEach((auxPais: any) => {
          const pais = {
            nombre: auxPais.name.common,
            region: auxPais.region,
            bandera: auxPais.flags.svg,
            poblacion: auxPais.population,
            capital: auxPais.capital
          };
          this.paises.push(pais);
        });
        this.obtenerDatosDeTodosLosPaises();
      });

    }
 

    obtenerDatosDeTodosLosPaises() {
      const paisesSeleccionados = ['Argentina', 'Francia', 'Albania', 'Bélgica', 'Brasil', 'Canadá', 'Alemania'];
      this.paises = this.paises.filter(pais => paisesSeleccionados.includes(pais.name));
    }
    
    public onClick(event: any): void 
    {
      this.router.navigate(['/home']);
    }
  
    checkAnswer(selectedAnswer: string) {
      const currentQuestion = this.preguntas.find(question => question.pregunta === this.questionText);
    
      if (currentQuestion) {
        if (selectedAnswer === currentQuestion.respuestaCorrecta) {
          this.increaseScore(1);
          this.gameActive = false;
          this.resetGame();
          this.timerSubscription?.unsubscribe();
          
          Swal.fire({
            icon: 'success',
            title: '¡Respuesta correcta!',
            html: '<strong>Has ganado un punto!</strong> ¿Quieres seguir jugando?',
            confirmButtonText: 'Si!',
            showCancelButton: true, 
            cancelButtonText: 'Salir',
            allowOutsideClick: false
          }).then((result) => {
            if (result.isConfirmed) {
              this.resetGame();
            }
            else if (result.dismiss === Swal.DismissReason.cancel) {
              this.router.navigate(['/home']); 
            }
          });
  
        } else {
          this.timerSubscription?.unsubscribe();
          Swal.fire({
            icon: 'error',
            title: 'Respuesta incorrecta',
            html: `La respuesta correcta es: <strong>${currentQuestion.respuestaCorrecta}</strong> ¿Quieres seguir jugando?`,
            confirmButtonText: 'Si!',
            showCancelButton: true, 
            cancelButtonText: 'Salir',
            allowOutsideClick: false
          }).then((result) => {
            if (result.isConfirmed) {
              this.resetGame();
            }
            else if (result.dismiss === Swal.DismissReason.cancel) {
              this.router.navigate(['/home']); 
            }
          });
        }
      }
    
      this.isAnswered = true;
    }

    getScore(): number {
      return this.score;
    }
  
    increaseScore(points: number): void {
      this.score += points;
    }
  
    spinRoulette() {
      if (this.isSpinning) {
        return;
      }
    
      const spinButton = document.querySelector('.spin-button') as HTMLButtonElement;
    
      if (spinButton) {
        this.isSpinning = true;
        spinButton.disabled = true;
    
        const roulette = document.querySelector('.roulette') as HTMLElement;
    
        if (roulette) {
          const numSectors = 7;
          const randomSector = Math.floor(Math.random() * numSectors) + 1;
          const degreesPerSector = 360 / numSectors;
    
          const randomRotations = 2 + Math.floor(Math.random() * 2);
          const totalRotation = 360 * randomRotations + (360 - (randomSector - 1) * degreesPerSector) + Math.floor(Math.random() * degreesPerSector);
    
          roulette.style.transition = 'transform 4s ease-in-out';
          roulette.style.transform = `rotate(${totalRotation}deg`;
    
          setTimeout(() => {
            this.selectedSector = randomSector;
    
            const selectedQuestion = this.preguntas.find(question => question.sector === this.selectedSector);
    
            if (selectedQuestion) {
              this.selectedPregunta = selectedQuestion.pregunta;
              this.answerOptions = this.getAnswerOptionsForQuestion(selectedQuestion);
              this.showRoulette = false;
              this.isAnswered = true;
    
              const sectorElement = document.querySelector('.sector-' + this.selectedSector + ' .bandera-img') as HTMLImageElement;
              if (sectorElement) {
                sectorElement.src = selectedQuestion.flagUrl;
              }
    
              this.loadQuestionAutomatically(this.selectedSector);
              this.gameActive = true;
              this.startTimer();
            }
    
            this.isSpinning = false;
            spinButton.disabled = false;
          }, 4000);
        }
      }
    }
    
    loadQuestionAutomatically(selectedSector: number) {
      const selectedQuestion = this.preguntas.find(question => question.sector === selectedSector);
    
      if (selectedQuestion) {
        this.questionText = selectedQuestion.pregunta;
        this.answerOptions = this.getAnswerOptionsForQuestion(selectedQuestion);
      }
    
    }
  
    resetGame() {
      this.isGameReset = false;
      this.questionText = '';
      this.answerOptions = [];
      this.isAnswered = false;
      this.showRoulette = true;
      this.gameActive = true;
    }
  
    startTimer() {
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
    
      this.secondsLeft = 30;
    
      this.timerSubscription = timer(0, 1000)
        .pipe(
          takeUntil(this.destroy$),
          takeWhile(() => this.secondsLeft >= 0)
        )
        .subscribe(() => {

          if (this.secondsLeft > 0) {
            this.secondsLeft--;
          } else {
            this.isAnswered = false;
            this.timeIsUp();
          }
        });
    }

    timeIsUp() {

      if (!this.isAnswered) {
        this.isAnswered = true;

        const currentQuestion = this.preguntas.find(question => question.sector === this.selectedSector);
        if (currentQuestion) {

          this.timerSubscription?.unsubscribe();
          
          Swal.fire({
            icon: 'info',
            title: '¡Se acabó el tiempo!',
            html: `La respuesta correcta es: <strong>${currentQuestion.respuestaCorrecta}</strong> ¿Quieres seguir jugando?`,
            confirmButtonText: 'Si!',
            showCancelButton: true, 
            cancelButtonText: 'Salir',
            allowOutsideClick: false
          }).then((result) => {
            if (result.isConfirmed) {
              this.resetGame();
            }
            else if (result.dismiss === Swal.DismissReason.cancel) {
              this.router.navigate(['/home']); 
            }
            
          });
        }
      }
    }
    
    getAnswerOptionsForQuestion(question: any): string[] {
      const answers = [
        question.respuestaCorrecta,
        question.respuestaIncorrecta1,
        question.respuestaIncorrecta2,
        question.respuestaIncorrecta3
      ];
    
      const randomComparator = () => Math.random() - 0.5;
    
      const shuffledAnswers = answers.sort(randomComparator);
    
      return shuffledAnswers;
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
            await this.auth.logout();
            this.router.navigate(['/login']);
          } catch (error) {
            console.error('Error al cerrar sesión:', error);
          }
        } else {
          this.router.navigate(['/home/preguntados']);
        }
      });
    }

    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }
}
