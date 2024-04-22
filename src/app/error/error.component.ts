import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {

  mensaje: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    
  }

  back() {
    this.router.navigate(['/login']);
  }

}


