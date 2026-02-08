import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface StudentTrend {
  student_id: number;
  ir_averages: { ir: number; avg: string }[];
  trend: string;
}

@Component({
  selector: 'app-student-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-charts.html',
  styleUrl: './student-charts.css'
})
export class StudentChartsComponent implements OnInit {
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceChart') performanceChartRef!: ElementRef<HTMLCanvasElement>;
  
  private trendChart: Chart | null = null;
  private performanceChart: Chart | null = null;

  sampleData: StudentTrend[] = [
    {
      student_id: 1001,
      ir_averages: [
        { ir: 1, avg: '2.67' },
        { ir: 2, avg: '3.00' },
        { ir: 3, avg: '3.33' },
        { ir: 4, avg: '3.67' },
        { ir: 5, avg: '3.89' }
      ],
      trend: 'improving'
    },
    {
      student_id: 1002,
      ir_averages: [
        { ir: 1, avg: '2.00' },
        { ir: 2, avg: '2.33' },
        { ir: 3, avg: '2.00' },
        { ir: 4, avg: '1.89' },
        { ir: 5, avg: '1.78' }
      ],
      trend: 'declining'
    },
    {
      student_id: 1003,
      ir_averages: [
        { ir: 1, avg: '3.67' },
        { ir: 2, avg: '3.78' },
        { ir: 3, avg: '3.89' },
        { ir: 4, avg: '3.89' },
        { ir: 5, avg: '4.00' }
      ],
      trend: 'improving'
    }
  ];

  ngOnInit() {
    // Wait for view to be ready
    setTimeout(() => {
      this.createTrendChart();
      this.createPerformanceChart();
    }, 100);
  }

  createTrendChart() {
    if (!this.trendChartRef) return;

    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.trendChart) {
      this.trendChart.destroy();
    }

    const datasets = this.sampleData.map((student, index) => {
      const colors = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565'];
      
      return {
        label: `Student ${student.student_id}`,
        data: student.ir_averages.map(ir => parseFloat(ir.avg)),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        tension: 0.3,
        fill: false
      };
    });

    this.trendChart = new Chart(ctx, {
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
            text: 'Student Progress Over Time',
            font: { size: 16 }
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 4,
            title: {
              display: true,
              text: 'Average Score (I + D + CE)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Interim Report'
            }
          }
        }
      }
    });
  }

  createPerformanceChart() {
    if (!this.performanceChartRef) return;

    const ctx = this.performanceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.performanceChart) {
      this.performanceChart.destroy();
    }

    const latestScores = this.sampleData.map(student => ({
      id: student.student_id,
      score: parseFloat(student.ir_averages[student.ir_averages.length - 1].avg)
    }));

    this.performanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: latestScores.map(s => `Student ${s.id}`),
        datasets: [{
          label: 'Latest IR Average',
          data: latestScores.map(s => s.score),
          backgroundColor: latestScores.map(s => 
            s.score >= 3.5 ? '#48bb78' :
            s.score >= 2.5 ? '#4299e1' :
            '#ed8936'
          ),
          borderColor: '#2d3748',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Current Performance (Latest IR)',
            font: { size: 16 }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 4,
            title: {
              display: true,
              text: 'Average Score'
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.trendChart) {
      this.trendChart.destroy();
    }
    if (this.performanceChart) {
      this.performanceChart.destroy();
    }
  }
}