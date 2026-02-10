import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ChartData {
  type: 'line' | 'bar' | 'pie';
  title: string;
  students?: any[];
  data?: any[];
}

@Component({
  selector: 'app-chat-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-chart.html',
  styleUrl: './chat-chart.css'
})
export class ChatChartComponent implements AfterViewInit {
  @Input() chartData!: ChartData;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  ngAfterViewInit() {
    if (this.chartData) {
      setTimeout(() => this.renderChart(), 100);
    }
  }

  renderChart() {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    if (this.chartData.type === 'line') {
      this.renderLineChart(ctx);
    } else if (this.chartData.type === 'bar') {
      this.renderBarChart(ctx);
    } else if (this.chartData.type === 'pie') {
      this.renderPieChart(ctx);
    }
  }

  renderLineChart(ctx: CanvasRenderingContext2D) {
    const colors = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565'];
    
    const datasets = this.chartData.students!.map((student, index) => ({
      label: `Student ${student.student_id} (${student.trend})`,
      data: student.data.map((d: any) => d.score),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '40',
      tension: 0.3,
      fill: false
    }));

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['IR1', 'IR2', 'IR3', 'IR4', 'IR5'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.chartData.title,
            font: { size: 14 }
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { size: 11 }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 4.5,
            title: {
              display: true,
              text: 'Average Score',
              font: { size: 11 }
            }
          }
        }
      }
    });
  }

  renderBarChart(ctx: CanvasRenderingContext2D) {
    const students = this.chartData.students!;
    
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: students.map(s => `${s.student_id}`),
        datasets: [{
          label: 'Average Score',
          data: students.map(s => s.score),
          backgroundColor: students.map(s => 
            s.score >= 3.5 ? '#48bb78' :
            s.score >= 2.5 ? '#4299e1' :
            '#ed8936'
          )
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.chartData.title,
            font: { size: 14 }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 4.5,
            title: {
              display: true,
              text: 'Score',
              font: { size: 11 }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Student ID',
              font: { size: 11 }
            }
          }
        }
      }
    });
  }

  renderPieChart(ctx: CanvasRenderingContext2D) {
    const data = this.chartData.data!;
    const gradeColors: Record<string, string> = {
      A: '#48bb78',
      B: '#4299e1',
      C: '#ecc94b',
      D: '#ed8936',
      E: '#f56565'
    };
    
    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(d => `Grade ${d.grade}`),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: data.map(d => gradeColors[d.grade] || '#cbd5e0')
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.chartData.title,
            font: { size: 14 }
          },
          legend: {
            position: 'right',
            labels: {
              font: { size: 11 }
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}