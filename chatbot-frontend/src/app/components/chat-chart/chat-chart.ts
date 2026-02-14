import { Component, Input, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'line_grades';
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
export class ChatChart implements AfterViewInit, OnDestroy {
  @Input() chartData!: ChartData;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  ngAfterViewInit() {
    if (this.chartData) {
      setTimeout(() => this.renderChart(), 100);
    }
  }

  downloadChart() {
    if (!this.chart) return;

    const canvas = this.chartCanvas.nativeElement;
    const url = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${this.chartData.title.replace(/\s+/g, '_')}.png`;
    link.href = url;
    link.click();
  }

  renderChart() {
    if (!this.chartCanvas) return;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    if (this.chartData.type === 'line_grades') {
      this.renderGradeChart(ctx);
    } else if (this.chartData.type === 'line') {
      this.renderLineChart(ctx);
    } else if (this.chartData.type === 'bar') {
      this.renderBarChart(ctx);
    } else if (this.chartData.type === 'pie') {
      this.renderPieChart(ctx);
    }
  }

  renderGradeChart(ctx: CanvasRenderingContext2D) {
    const colors = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565', '#38b2ac', '#d69e2e', '#e53e3e', '#667eea', '#fc8181', '#68d391', '#fbd38d', '#90cdf4', '#b794f4', '#feb2b2'];

    const datasets = this.chartData.students!.map((student: any, index: number) => ({
      label: `Student ${student.student_id}`,
      data: student.data.map((d: any) => d.grade_numeric),
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
            labels: { font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const gradeMap: Record<number, string> = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E' };
                const grade = gradeMap[context.parsed.y];
                return `${context.dataset.label}: Grade ${grade}`;
              }
            }
          }
        },
        scales: {
          y: {
            min: 0.5,
            max: 5.5,
            ticks: {
              stepSize: 1,
              callback: (value: any) => {
                if (value === 5) return 'A';
                if (value === 4) return 'B';
                if (value === 3) return 'C';
                if (value === 2) return 'D';
                if (value === 1) return 'E';
                return '';
              }
            },
            title: {
              display: true,
              text: 'KA Grade',
              font: { size: 11 }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Interim Report',
              font: { size: 11 }
            }
          }
        }
      }
    });
  }

  renderLineChart(ctx: CanvasRenderingContext2D) {
    const colors = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565'];

    const datasets = this.chartData.students!.map((student: any, index: number) => ({
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
            labels: { font: { size: 11 } }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 4.5,
            title: {
              display: true,
              text: 'Average Score',
              font: { size: 11 }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Interim Report',
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
        labels: students.map((s: any) => `${s.student_id}`),
        datasets: [{
          label: 'Average Score',
          data: students.map((s: any) => s.score),
          backgroundColor: students.map((s: any) =>
            s.score >= 3.5 ? '#48bb78' :
            s.score >= 2.5 ? '#4299e1' :
            '#ed8836'
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
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0,
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
        labels: data.map((d: any) => `Grade ${d.grade}`),
        datasets: [{
          data: data.map((d: any) => d.count),
          backgroundColor: data.map((d: any) => gradeColors[d.grade] || '#cbd5e0')
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
            labels: { font: { size: 11 } }
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