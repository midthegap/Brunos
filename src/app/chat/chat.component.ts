import { NgFor } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat.service';

export interface Message {
  author: string;
  post: string;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule, NgFor],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  post: string = '';
  messages: Message[] = [];

  @Input() sender: string = ''

  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.chatService.message$.subscribe(m => {
      this.add(m);
    });
  }

  enter() {
    if (this.post.trim()) {
      const author = this.sender ? this.sender : 'anonymous';
      const message: Message = {
        author: author,
        post: this.post
      };
      this.add(message);
      this.chatService.post(message);

      this.post = '';
    }
  }

  private add(message: Message) {
    this.messages.push(message);
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private scrollToBottom() {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }
}
