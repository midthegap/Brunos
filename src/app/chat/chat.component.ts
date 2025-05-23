import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  enter() {
    if (this.post.trim()) {
      let author = this.sender ? this.sender : '<anonymous>';
      this.messages.push({
        author: author,
        post: this.post
      });
      this.post = '';
    }
  }
}
