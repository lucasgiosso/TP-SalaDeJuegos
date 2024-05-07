import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { navbarData } from './home-data';
import { User } from 'firebase/auth';
import Swal from 'sweetalert2';
import { ChatComponent } from '../../chat/chat.component';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink,RouterLinkActive, ChatComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  navData = navbarData;
  currentUser$: Observable<User | null>;
  isDropdownOpen = false;
  imagenAhorcado: string = "https://firebasestorage.googleapis.com/v0/b/saladejuegos-f63ca.appspot.com/o/Ahorcado.png?alt=media&token=6d0320d2-cce3-4121-8a9c-2ce821a0b4e0";
  imagenMayorOMenor: string ="https://firebasestorage.googleapis.com/v0/b/saladejuegos-f63ca.appspot.com/o/mayor.png?alt=media&token=3b9ec590-927a-46a5-9f88-320dbc83c92c";
  imagenPreguntados: string = "https://firebasestorage.googleapis.com/v0/b/saladejuegos-f63ca.appspot.com/o/preguntados.png?alt=media&token=c55ab4d1-b859-4e28-aa5d-6a1651723f76";
  imagenWS: string = "https://firebasestorage.googleapis.com/v0/b/saladejuegos-f63ca.appspot.com/o/wordScramble.png?alt=media&token=e4c37d15-bcf9-404b-a431-6e35fde2d224";

  constructor(private router: Router, private auth: AuthService) 
  {
    this.currentUser$ = this.auth.getCurrentUser();

   }
  ngOnInit(): void {
    this.screenWidth = window.innerWidth;

    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  logout() {
    Swal.fire({
      title: '¿Quieres cerrar sesión?',
      text: 'Lamentamos que quieras salir...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.logout();
        this.router.navigate(['login']);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.router.navigate(['home']);
        Swal.fire('Que bueno, volviste!', 'Tu sesión sigue abierta :)', 'info');
      }
    });
  }

  onDocumentClick(event: MouseEvent) {
    if (!(<HTMLElement>event.target).closest('.navbar-custom')) {
      this.isDropdownOpen = false;
    }
  }

  toggleCollapse(): void{
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;

  }

  closeSidenav(): void{
    this.collapsed = false;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  handleNavigation(routeLink: string) {
    // console.log('Route Link Clicked:', routeLink);
    if (routeLink === 'logout') {
      this.logout();
    }
  }

  highlightButton(event: any) {
    const cardBody = event.target.nextElementSibling;
    cardBody.classList.add('highlight');
  }
  
  unhighlightButton(event: any) {
    const cardBody = event.target.nextElementSibling;
    cardBody.classList.remove('highlight');
  }

  ahorcado() {
    this.router.navigate(['home/ahorcado']);
  }

  mayorOMenor() {
    this.router.navigate(['home/mayoromenor']);
  }

  preguntados() {
    this.router.navigate(['home/preguntados']);
  }

  ws() {
    this.router.navigate(['home/word-scramble']);
  }


  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }


}
