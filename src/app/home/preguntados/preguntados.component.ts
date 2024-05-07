import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../../../src/app/services/auth.service';
import { ApiService } from '../../../../src/app/services/api.service';
import { Observable, Subject, Subscription, of, takeUntil, timer } from 'rxjs';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from '../../../chat/chat.component';
import { CommonModule } from '@angular/common';

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
  secondsLeft: number = 40; 
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
  private timerSubscription: Subscription | undefined;
  
selectedQuestion: any;

  preguntas = [
    {
      nombre:'France',
      pregunta: '¿Cuál es la capital de Francia?',
      respuestaCorrecta: 'París',
      respuestaIncorrecta1: 'Londres',
      respuestaIncorrecta2: 'Berlín',
      respuestaIncorrecta3: 'Madrid',
      sector: 2, 
      flagUrl:'https://flagcdn.com/fr.svg'

    },
    {
      nombre:'Argentina',
      pregunta: '¿Cuál es la capital de Argentina?',
      respuestaCorrecta: 'Buenos Aires',
      respuestaIncorrecta1: 'Chile',
      respuestaIncorrecta2: 'Rosario',
      respuestaIncorrecta3: 'Rio Negro',
      sector: 1, 
      flagUrl:'https://flagcdn.com/ar.svg'

    },
    {
      nombre:'Germany',
      pregunta: '¿Cuál es la capital de Alemania?',
      respuestaCorrecta: 'Berlín',
      respuestaIncorrecta1: 'Kabul',
      respuestaIncorrecta2: 'Argel',
      respuestaIncorrecta3: 'Viena',
      sector: 7, 
      flagUrl:'https://flagcdn.com/de.svg'

    },
    {
      nombre:'Albania',
      pregunta: '¿Cuál es la capital de Albania?',
      respuestaCorrecta: 'Tirana',
      respuestaIncorrecta1: 'Luanda',
      respuestaIncorrecta2: 'Ereván',
      respuestaIncorrecta3: 'Camberra',
      sector: 6, 
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
      sector: 4, 
      flagUrl:'https://flagcdn.com/br.svg'

    },
    {
      nombre:'Canada',
      pregunta: '¿Cuál es la capital de Canadá?',
      respuestaCorrecta: 'Ottawa',
      respuestaIncorrecta1: 'Doha',
      respuestaIncorrecta2: 'Yamena',
      respuestaIncorrecta3: 'Praia',
      sector: 3, 
      flagUrl:'https://flagcdn.com/ca.svg'
    },
  ];

  constructor(private auth: AuthService, private router: Router, private apiService : ApiService, private http: HttpClient) 
    {
      this.currentUser$ = this.auth.getCurrentUser();
      this.obtenerDatosDeTodosLosPaises();
    }

    // ngOnInit() {
    //   this.apiService.obtenerPaises();
    //   this.startTimer();
    // }

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
        //this.loadQuestionAutomatically();
      });
      this.startTimer();
    }
 

    obtenerDatosDeTodosLosPaises() {
      const paisesSeleccionados = ['Argentina', 'Francia', 'Albania', 'Bélgica', 'Brasil', 'Canadá', 'Alemania'];
      this.paises = this.paises.filter(pais => paisesSeleccionados.includes(pais.name));
    }
    
    public onClick(event: any): void 
    {
      this.router.navigate(['/home']);
    }
  
    getFlagUrlForSector(sector: number): Observable<string | undefined> {
      const sectorInfo = this.preguntas.find(info => info.sector === sector);
      if (sectorInfo) {
        return this.http.get<string>(sectorInfo.flagUrl);
      }
      return of(undefined); 
    }

    checkAnswer(selectedAnswer: string) {
      const currentQuestion = this.preguntas.find(question => question.pregunta === this.questionText);
    
      if (currentQuestion) {
        if (selectedAnswer === currentQuestion.respuestaCorrecta) {
          this.increaseScore(10);
          this.gameActive = false;
          this.resetGame();
          
          Swal.fire({
            icon: 'success',
            title: '¡Respuesta correcta!',
            text: 'Has ganado puntos.',
            confirmButtonText: 'OK'
          }).then(() => {
            this.resetGame();
          });
  
        } else {
  
          Swal.fire({
            icon: 'error',
            title: 'Respuesta incorrecta',
            html: `La respuesta correcta es: <strong>${currentQuestion.respuestaCorrecta}</strong>`,
            confirmButtonText: 'OK'
          }).then(() => {
            this.resetGame();
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
  
    // spinRoulette() {
    //   if (this.isSpinning) {
    //     return;
    //   }
    
    //   const spinButton = document.querySelector('.spin-button') as HTMLButtonElement;
    
    //   if (spinButton) {
    //     this.isSpinning = true;
    //     spinButton.disabled = true;
    
    //     const roulette = document.querySelector('.roulette') as HTMLElement;
    
    //     if (roulette) {
    //       roulette.style.transition = 'none';
    //       const currentRotation = roulette.style.transform;
    //       const matches = currentRotation.match(/-?\d+/);
    //       const currentRotationValue = matches ? parseInt(matches[0]) : 0;
    
    //       const numSectors = 7;
    
    //       const randomRotations = 2 + Math.floor(Math.random() * 2);
    
    //       const totalRotation = 360 * randomRotations + Math.floor(Math.random() * 360);
    
    //       const degreesPerSector = totalRotation / numSectors;
    
    //       const rotationValue = currentRotationValue + totalRotation;
    
    //       roulette.style.transition = 'transform 4s ease-in-out';
    //       roulette.style.transform = `rotate(${rotationValue}deg`;
    
    //       setTimeout(() => {
    //         const randomSector = Math.floor(Math.random() * 7) + 1;
    //         const selectedQuestion = this.preguntas.find(
    //           (item) => item.sector === randomSector
    //         );
  
    //         console.log('Random Sector:', randomSector);
    //         console.log('Selected Question:', selectedQuestion);
    
    //         if (selectedQuestion) {
              
    //           this.selectedPregunta = selectedQuestion.pregunta;
    //           this.answerOptions = this.getAnswerOptionsForQuestion(selectedQuestion);
    //           this.showRoulette = false;
    //           this.isAnswered = true;
  
    //           const sectorElement = document.querySelector('.sector-' + randomSector + ' .bandera-img') as HTMLImageElement;
    //           if (sectorElement) {
    //             sectorElement.src = selectedQuestion.flagUrl;
    //           }
  
    //           this.loadQuestionAutomatically();
    //           this.gameActive = true;
    //           this.startTimer();
    //         }
    
    //         this.isSpinning = false;
    //         spinButton.disabled = false;
    //       }, 4000);
    //     }
    //   }
    // }

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
          roulette.style.transition = 'none';
          const currentRotation = roulette.style.transform;
          const matches = currentRotation.match(/-?\d+/);
          const currentRotationValue = matches ? parseInt(matches[0]) : 0;
    
          const numSectors = 7;
    
          const randomRotations = 2 + Math.floor(Math.random() * 2);

          console.log('Selected Question:', randomRotations);
    
          const totalRotation = 360 * randomRotations + Math.floor(Math.random() * 360);
    
          const degreesPerSector = totalRotation / numSectors;
    
          const rotationValue = currentRotationValue + totalRotation;
    
          roulette.style.transition = 'transform 4s ease-in-out';
          roulette.style.transform = `rotate(${rotationValue}deg`;
    
          // setTimeout(() => {
            
          //   const randomSector = Math.floor(Math.random() * 7) + 1;
          //   const selectedQuestion = this.preguntas.find(
          //     (item) => item.sector === randomSector
          //   );
  
          //   console.log('Random Sector:', randomSector);
          //   console.log('Selected Question:', selectedQuestion);
    
          //   if (selectedQuestion) {
              
          //     this.selectedPregunta = selectedQuestion.pregunta;
          //     this.answerOptions = this.getAnswerOptionsForQuestion(selectedQuestion);
          //     this.showRoulette = false;
          //     this.isAnswered = true;
  
          //     const sectorElement = document.querySelector('.sector-' + randomSector + ' .bandera-img') as HTMLImageElement;
          //     if (sectorElement) {
          //       sectorElement.src = selectedQuestion.flagUrl;
          //     }
  
          //     this.loadQuestionAutomatically(randomSector);
          //     this.gameActive = true;
          //     this.startTimer();
          //   }
    
          //   this.isSpinning = false;
          //   spinButton.disabled = false;
          // }, 4000);

          setTimeout(() => {
            const randomSector = Math.floor(Math.random() * 7) + 1;

            console.log('Random Sector:', randomSector);
            
            // const sectorElement = document.querySelector('.sector-' + randomSector + ' .bandera-img') as HTMLImageElement;
            
            this.loadQuestionAutomatically(randomSector);
            
            // console.log('Selected Question:', sectorElement);
            
            // if (sectorElement) {
            //   const selectedQuestion = this.preguntas.find(question => question.sector === randomSector);
            //   if (selectedQuestion) {
            //     sectorElement.src = selectedQuestion.flagUrl;
            //   }
            // }
    
            this.showRoulette = false;
            this.isAnswered = true;
            this.gameActive = true;
            this.startTimer();
    
            this.isSpinning = false;
            spinButton.disabled = false;
          }, 4000);
        }
      }
    }
    
    // loadQuestionAutomatically() {

    //   const randomIndex = Math.floor(Math.random() * this.preguntas.length);
    //   const selectedQuestion = this.preguntas[randomIndex];
      
    //   if (selectedQuestion) {

    //     this.questionText = selectedQuestion.pregunta;
    //     this.answerOptions = this.getAnswerOptionsForQuestion(selectedQuestion);
    //   }
    //   this.secondsLeft = 40;
    //   this.startTimer();
    // }

    loadQuestionAutomatically(selectedSector: number) 
    {
      const selectedQuestion = this.preguntas.find(question => question.sector === selectedSector);
      
      if (selectedQuestion) {
        this.questionText = selectedQuestion.pregunta;
        this.answerOptions = this.getAnswerOptionsForQuestion(selectedQuestion);
      }
      
      this.secondsLeft = 40;
      this.startTimer();
    }
  
    resetGame() {
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
    
      this.secondsLeft = 40;
      this.timer$ = timer(0, 1000).pipe(
        takeUntil(this.destroy$)
      );
    
      this.timerSubscription = this.timer$.subscribe(() => {
        if (this.secondsLeft > 0) {
          this.secondsLeft--;
        } else {
          // this.timeIsUp();
        }
      });
    }
    
    timeIsUp() {
      if (!this.isAnswered) {
        const currentQuestion = this.preguntas.find(question => question.pregunta === this.selectedPregunta);
        if (currentQuestion) {
          Swal.fire({
            icon: 'info',
            title: '¡Se acabó el tiempo!',
            text: 'La respuesta correcta es: ' + currentQuestion.respuestaCorrecta,
            confirmButtonText: 'OK',
          }).then(() => {
            this.spinRoulette();
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
            console.log('Route link clicked: logout');
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
