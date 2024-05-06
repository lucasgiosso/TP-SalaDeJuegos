import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../app/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { collection, onSnapshot,addDoc, query, orderBy } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

const options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy{

  @ViewChild('contenedorMensajes') contenedorMensajesRef!: ElementRef;

 
  collectionPath: string = 'msjs';
  mostrarChat = false; 
  loginDate: string = '';
  usuarioLogueado: any;
  nuevoMensaje:string = "";
  messagesRef = collection(this.firestore, this.collectionPath);
  mensajes: any = []
  scrollDownEnabled = true;
  tieneNuevosMensajes = false;
  coloresUsuarios: any = {};

  constructor(private auth: AuthService, private firestore: Firestore) 
  {

   }

  ngOnInit(): void {
    this.auth.getCurrentUser().subscribe((usuario) => {
      this.usuarioLogueado = usuario;
      this.loginDate = this.formatDate(new Date());
    });
    this.getMessages();
    
  }

  ngOnDestroy(): void {}
  
  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', options);
  }

  enviarMensaje() {
    
    if (this.nuevoMensaje === "") return;
  
    const fecha = new Date();
  
    const mensaje = {
      emisor: this.usuarioLogueado.uid,
      texto: this.nuevoMensaje,
      timestamp: fecha.getTime(),
      fecha: fecha.toLocaleTimeString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
      nombreUsuario: this.usuarioLogueado.email
    };
  
    addDoc(collection(this.firestore, this.collectionPath), mensaje)
      .then(() => {
        //console.log('Mensaje guardado en Firestore');
        this.nuevoMensaje = "";
        this.scrollChatToTop();
        this.tieneNuevosMensajes = true;
      })
      .catch((error) => {
        console.error('Error al guardar el mensaje en Firestore:', error);
      });
  
    this.nuevoMensaje = "";
  
    setTimeout(() => {
      this.getMessages();
    }, 0);
  }
  
  getMessages() {

    const q = query(collection(this.firestore, this.collectionPath), orderBy('timestamp', 'asc'));

    onSnapshot(q, (snapshot) => {

      const newMessages = this.mensajes = snapshot.docs.map((doc) => doc.data());
      this.mensajes = newMessages;

      if (!this.mostrarChat) {
        const lastMessage = this.mensajes[this.mensajes.length - 1];
        if (lastMessage.emisor !== this.usuarioLogueado.uid) {
          this.tieneNuevosMensajes = true;
        }
      }

      if (this.mostrarChat) {
        setTimeout(() => {
          this.scrollChatToBottom();
        }, 100);
      }

    });

    if (this.mensajes.length > 0) {
      const lastMessage = this.mensajes[this.mensajes.length - 1];
      if (lastMessage.emisor !== this.usuarioLogueado.uid) {
        this.mostrarChat = true;
        this.tieneNuevosMensajes = false;
      }
    }
  }


  scrollChatToBottom() {
    if (this.contenedorMensajesRef) {
      const contenedor = this.contenedorMensajesRef.nativeElement;
      contenedor.scrollTop = contenedor.scrollHeight;
    }
  }

  scrollChatToTop() {
    const contenedor = this.contenedorMensajesRef.nativeElement;
    if (contenedor.scrollTop === 0) {
      this.tieneNuevosMensajes = false;
      //this.getMessages();
    }
  }

  getChatColor(uid: string) {
    if (!this.coloresUsuarios[uid]) {
      this.coloresUsuarios[uid] = this.getRandomColor();
    }
    return this.coloresUsuarios[uid];
  }

  getRandomColor(): string {
    const minBrightness = 50; 
    const letters = '0123456789ABCDEF';
    let color = '#';
  

    do {
      color = '#';
      for (let i = 0; i < 3; i++) {
        const channel = Math.floor(Math.random() * 256);
        const hex = channel.toString(16).padStart(2, '0'); 
        color += hex;
      }
    } while (this.getLightness(color) > minBrightness);
  
    return color;
  }
  
  getLightness(color: string): number {

    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
  
    return (0.2126 * r + 0.7152 * g + 0.0722 * b);
  }

}
