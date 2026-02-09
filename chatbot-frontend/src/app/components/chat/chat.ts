import { Component, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chat } from '../../services/chat.service';
import { ChatChartComponent } from '../chat-chart/chat-chart';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  chartData?: any;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatChartComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  private shouldScroll = false;

  constructor(
    private chatService: Chat,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    // Add user message with timestamp
    this.messages.push({
      text: this.userInput,
      isUser: true,
      timestamp: new Date()
    });

    const currentMessage = this.userInput;
    this.userInput = '';
    this.isLoading = true;
    this.shouldScroll = true;
    this.cdr.detectChanges();

    // Send to backend
    this.chatService.sendMessage(currentMessage).subscribe({
      next: (response: any) => {
        console.log('Response received:', response);
        this.messages.push({
          text: response.reply,
          isUser: false,
          timestamp: new Date(),
          chartData: response.chartData || null
        });
        this.isLoading = false;
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.messages.push({
          text: 'Sorry, there was an error. Please try again.',
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.shouldScroll = true;
        this.cdr.detectChanges();
      }
    });
  }

  clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.messages = [];
      this.cdr.detectChanges();
    }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}