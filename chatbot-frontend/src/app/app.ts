import { Component, signal } from '@angular/core';
import { ChatComponent } from './components/chat/chat';
import { StudentChartsComponent } from './components/student-charts/student-charts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatComponent, StudentChartsComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('chatbot-frontend');
  currentView: 'chat' | 'charts' = 'chat';
}