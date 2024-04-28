import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { navbarData } from './home-data';
import { User } from 'firebase/auth';
import Swal from 'sweetalert2';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink,RouterLinkActive],
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

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }


}
