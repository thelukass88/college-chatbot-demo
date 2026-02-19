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

  downloadChart(format: 'standard' | 'highres' | 'withdata' = 'standard') {
    if (!this.chart) return;

    const canvas = this.chartCanvas.nativeElement;
    
    if (format === 'highres') {
      // Create a temporary high-res canvas
      const tempCanvas = document.createElement('canvas');
      const scale = 3; // 3x resolution
      tempCanvas.width = canvas.width * scale;
      tempCanvas.height = canvas.height * scale;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCtx.scale(scale, scale);
        // Re-render chart at higher resolution
        const imgData = canvas.toDataURL('image/png');
        const img = new Image();
        img.onload = () => {
          tempCtx.drawImage(img, 0, 0);
          const highResUrl = tempCanvas.toDataURL('image/png', 1.0);
          this.downloadImage(highResUrl, 'highres');
        };
        img.src = imgData;
      }
    } else if (format === 'withdata') {
      // Download chart with data table
      this.downloadChartWithData();
    } else {
      // Standard download
      const url = canvas.toDataURL('image/png');
      this.downloadImage(url, 'standard');
    }
  }

  private downloadImage(url: string, quality: string) {
    const link = document.createElement('a');
    const filename = `${this.chartData.title.replace(/\s+/g, '_')}_${quality}.png`;
    link.download = filename;
    link.href = url;
    link.click();
  }

  private downloadChartWithData() {
    // Create a container with chart and data table
    const container = document.createElement('div');
    container.style.cssText = 'background: white; padding: 20px; font-family: Arial, sans-serif;';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = this.chartData.title;
    title.style.cssText = 'margin: 0 0 20px 0; color: #1a202c;';
    container.appendChild(title);
    
    // Add chart image
    const chartImg = document.createElement('img');
    chartImg.src = this.chartCanvas.nativeElement.toDataURL('image/png');
    chartImg.style.cssText = 'max-width: 100%; margin-bottom: 30px;';
    container.appendChild(chartImg);
    
    // Add data table
    const tableTitle = document.createElement('h3');
    tableTitle.textContent = 'Data Table';
    tableTitle.style.cssText = 'margin: 20px 0 10px 0; color: #2d3748;';
    container.appendChild(tableTitle);
    
    const table = this.createDataTable();
    container.appendChild(table);
    
    // Add timestamp
    const timestamp = document.createElement('p');
    timestamp.textContent = `Generated: ${new Date().toLocaleString()}`;
    timestamp.style.cssText = 'margin-top: 20px; color: #718096; font-size: 12px;';
    container.appendChild(timestamp);
    
    // Convert to image and download
    document.body.appendChild(container);
    
    // Use html2canvas library (we'll need to install this)
    import('html2canvas').then(html2canvas => {
      html2canvas.default(container, {
        backgroundColor: '#ffffff',
        scale: 2
      }).then(canvas => {
        const url = canvas.toDataURL('image/png');
        this.downloadImage(url, 'with_data');
        document.body.removeChild(container);
      });
    }).catch(err => {
      console.error('html2canvas not available, falling back to chart only');
      document.body.removeChild(container);
      this.downloadChart('highres');
    });
  }

  private createDataTable(): HTMLTableElement {
    const table = document.createElement('table');
    table.style.cssText = 'border-collapse: collapse; width: 100%; font-size: 14px;';
    
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Build table based on chart type
    if (this.chartData.type === 'line_grades' || this.chartData.type === 'line') {
      // Header
      const headerRow = document.createElement('tr');
      const headers = ['Student ID', 'IR1', 'IR2', 'IR3', 'IR4', 'IR5', 'Trend'];
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        th.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px; background: #edf2f7; text-align: left;';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      
      // Data rows
      this.chartData.students?.forEach((student: any) => {
        const row = document.createElement('tr');
        
        const idCell = document.createElement('td');
        idCell.textContent = student.student_id.toString();
        idCell.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px;';
        row.appendChild(idCell);
        
        student.data.forEach((d: any) => {
          const cell = document.createElement('td');
          if (this.chartData.type === 'line_grades') {
            cell.textContent = d.grade_letter || '-';
          } else {
            cell.textContent = d.score?.toFixed(2) || '-';
          }
          cell.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px;';
          row.appendChild(cell);
        });
        
        const trendCell = document.createElement('td');
        trendCell.textContent = student.trend || '-';
        trendCell.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px;';
        row.appendChild(trendCell);
        
        tbody.appendChild(row);
      });
      
    } else if (this.chartData.type === 'bar') {
      // Header
      const headerRow = document.createElement('tr');
      ['Student ID', 'Score', 'Grades'].forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        th.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px; background: #edf2f7; text-align: left;';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      
      // Data rows
      this.chartData.students?.forEach((student: any) => {
        const row = document.createElement('tr');
        
        ['student_id', 'score'].forEach(key => {
          const cell = document.createElement('td');
          cell.textContent = key === 'score' ? student[key].toFixed(2) : student[key];
          cell.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px;';
          row.appendChild(cell);
        });
        
        const gradesCell = document.createElement('td');
        gradesCell.textContent = student.grades?.join(', ') || '-';
        gradesCell.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px;';
        row.appendChild(gradesCell);
        
        tbody.appendChild(row);
      });
      
    } else if (this.chartData.type === 'pie') {
      // Header
      const headerRow = document.createElement('tr');
      ['Grade', 'Count', 'Percentage'].forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        th.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px; background: #edf2f7; text-align: left;';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      
      // Calculate total
      const total = this.chartData.data?.reduce((sum: number, d: any) => sum + d.count, 0) || 1;
      
      // Data rows
      this.chartData.data?.forEach((item: any) => {
        const row = document.createElement('tr');
        
        const gradeCell = document.createElement('td');
        gradeCell.textContent = item.grade;
        gradeCell.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px;';
        row.appendChild(gradeCell);
        
        const countCell = document.createElement('td');
        countCell.textContent = item.count.toString();
        countCell.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px;';
        row.appendChild(countCell);
        
        const percentCell = document.createElement('td');
        percentCell.textContent = `${((item.count / total) * 100).toFixed(1)}%`;
        percentCell.style.cssText = 'border: 1px solid #cbd5e0; padding: 8px;';
        row.appendChild(percentCell);
        
        tbody.appendChild(row);
      });
    }
    
    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
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