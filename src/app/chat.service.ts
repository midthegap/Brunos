import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { Message } from './chat/chat.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messageSubject = new Subject<Message>();
  message$ = this.messageSubject.asObservable();
  
  constructor(private socketIo: Socket) {
    this.registerSocketEvents();
  }
  
  private registerSocketEvents() {
    this.socketIo.on("post", (message: Message) => { this.messageSubject.next(message) });
  }
  
  post(message: Message) {
    this.socketIo.emit('post', message);
  }
}
