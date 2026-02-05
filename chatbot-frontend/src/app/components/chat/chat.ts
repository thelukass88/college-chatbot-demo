import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chat } from '../../services/chat.service';

interface Message {
  text: string;
  isUser: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent {
  messages: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;

  constructor(
    private chatService: Chat,
    private cdr: ChangeDetectorRef
  ) {}

  sendMessage() {
    if (!this.userInput.trim()) return;

    // Add user message
    this.messages.push({
      text: this.userInput,
      isUser: true
    });

    const currentMessage = this.userInput;
    this.userInput = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    // Send to backend
    this.chatService.sendMessage(currentMessage).subscribe({
      next: (response: any) => {
        console.log('Response received:', response);
        this.messages.push({
          text: response.reply,
          isUser: false
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.messages.push({
          text: 'Sorry, there was an error. Please try again.',
          isUser: false
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}