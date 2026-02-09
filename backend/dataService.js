const fs = require('fs');
const path = require('path');

// Load data files
const interimReports = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/interim_reports.json'), 'utf8')
);

const studentReports = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/student_interim_reports.json'), 'utf8')
);

class DataService {
  // Get all student data
  getAllStudentData() {
    return studentReports;
  }

  // Get data for a specific student
  getStudentData(studentId) {
    return studentReports.filter(r => r.student_id === studentId);
  }

  // Get data for a specific IR
  getIRData(irId) {
    return studentReports.filter(r => r.IR === irId);
  }

  // Get student progress across all IRs
  getStudentProgress(studentId) {
    const data = this.getStudentData(studentId);
    
    // Group by IR
    const byIR = {};
    data.forEach(entry => {
      if (!byIR[entry.IR]) {
        byIR[entry.IR] = [];
      }
      byIR[entry.IR].push(entry);
    });

    return byIR;
  }

  // Calculate average scores for a student across an IR
  getStudentAverages(studentId, irId = null) {
    let data = this.getStudentData(studentId);
    
    if (irId) {
      data = data.filter(r => r.IR === irId);
    }

    if (data.length === 0) return null;

    const totalI = data.reduce((sum, r) => sum + r.I, 0);
    const totalD = data.reduce((sum, r) => sum + r.D, 0);
    const totalCE = data.reduce((sum, r) => sum + r.CE, 0);

    return {
      avgIndependence: (totalI / data.length).toFixed(2),
      avgDeadlines: (totalD / data.length).toFixed(2),
      avgClassEthic: (totalCE / data.length).toFixed(2),
      entryCount: data.length
    };
  }

  // Identify struggling students (low scores in latest IR)
  getStrugglingStudents(threshold = 2.5) {
    const latestIR = 5; // Current IR
    const latestData = this.getIRData(latestIR);
    
    const studentScores = {};
    
    latestData.forEach(entry => {
      if (!studentScores[entry.student_id]) {
        studentScores[entry.student_id] = {
          student_id: entry.student_id,
          scores: [],
          grades: []
        };
      }
      
      const avgScore = (entry.I + entry.D + entry.CE) / 3;
      studentScores[entry.student_id].scores.push(avgScore);
      studentScores[entry.student_id].grades.push(entry.KA);
    });

    const struggling = [];
    
    Object.values(studentScores).forEach(student => {
      const overallAvg = student.scores.reduce((a, b) => a + b, 0) / student.scores.length;
      if (overallAvg <= threshold) {
        struggling.push({
          student_id: student.student_id,
          average_score: overallAvg.toFixed(2),
          grades: student.grades
        });
      }
    });

    return struggling.sort((a, b) => a.average_score - b.average_score);
  }

  // Identify top performers
  getTopPerformers(limit = 5) {
    const latestIR = 5;
    const latestData = this.getIRData(latestIR);
    
    const studentScores = {};
    
    latestData.forEach(entry => {
      if (!studentScores[entry.student_id]) {
        studentScores[entry.student_id] = {
          student_id: entry.student_id,
          scores: [],
          grades: []
        };
      }
      
      const avgScore = (entry.I + entry.D + entry.CE) / 3;
      studentScores[entry.student_id].scores.push(avgScore);
      studentScores[entry.student_id].grades.push(entry.KA);
    });

    const performers = [];
    
    Object.values(studentScores).forEach(student => {
      const overallAvg = student.scores.reduce((a, b) => a + b, 0) / student.scores.length;
      performers.push({
        student_id: student.student_id,
        average_score: overallAvg.toFixed(2),
        grades: student.grades
      });
    });

    return performers.sort((a, b) => b.average_score - a.average_score).slice(0, limit);
  }

  // Identify students with high effort but lower grades
  getHighEffortLowGrades() {
    const latestIR = 5;
    const latestData = this.getIRData(latestIR);
    
    const studentData = {};
    
    latestData.forEach(entry => {
      if (!studentData[entry.student_id]) {
        studentData[entry.student_id] = {
          student_id: entry.student_id,
          effort_scores: [],
          grades: []
        };
      }
      
      const effortScore = (entry.I + entry.D + entry.CE) / 3;
      studentData[entry.student_id].effort_scores.push(effortScore);
      studentData[entry.student_id].grades.push(entry.KA);
    });

    const results = [];
    
    Object.values(studentData).forEach(student => {
      const avgEffort = student.effort_scores.reduce((a, b) => a + b, 0) / student.effort_scores.length;
      const hasLowGrades = student.grades.some(g => g === 'C' || g === 'D' || g === 'E');
      
      // High effort (>= 3.5) but has some lower grades
      if (avgEffort >= 3.5 && hasLowGrades) {
        results.push({
          student_id: student.student_id,
          effort_score: avgEffort.toFixed(2),
          grades: student.grades
        });
      }
    });

    return results.sort((a, b) => b.effort_score - a.effort_score);
  }

  // Check if students are improving
  // Check if students are improving - WITH FULL DETAILS
  getImprovementTrends() {
    const students = [...new Set(studentReports.map(r => r.student_id))];
    
    const trends = students.map(studentId => {
      const studentData = studentReports.filter(r => r.student_id === studentId);
      const byIR = {};
      
      studentData.forEach(entry => {
        if (!byIR[entry.IR]) {
          byIR[entry.IR] = {
            entries: [],
            scores: [],
            grades: []
          };
        }
        byIR[entry.IR].entries.push(entry);
        byIR[entry.IR].scores.push((entry.I + entry.D + entry.CE) / 3);
        byIR[entry.IR].grades.push(entry.KA);
      });

      const irAverages = Object.keys(byIR)
        .sort()
        .map(ir => {
          const irNum = parseInt(ir);
          const scores = byIR[ir].scores;
          const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
          
          // Calculate individual component averages
          const entries = byIR[ir].entries;
          const avgI = (entries.reduce((sum, e) => sum + e.I, 0) / entries.length).toFixed(2);
          const avgD = (entries.reduce((sum, e) => sum + e.D, 0) / entries.length).toFixed(2);
          const avgCE = (entries.reduce((sum, e) => sum + e.CE, 0) / entries.length).toFixed(2);
          
          return {
            ir: irNum,
            overall_avg: avg,
            independence_avg: avgI,
            deadlines_avg: avgD,
            class_ethic_avg: avgCE,
            grades: byIR[ir].grades,
            class_count: entries.length
          };
        });

      // Calculate trend
      let improving = false;
      let declining = false;
      let changeAmount = 0;
      
      if (irAverages.length >= 2) {
        const firstAvg = parseFloat(irAverages[0].overall_avg);
        const lastAvg = parseFloat(irAverages[irAverages.length - 1].overall_avg);
        changeAmount = (lastAvg - firstAvg).toFixed(2);
        
        if (lastAvg > firstAvg + 0.3) improving = true;
        if (lastAvg < firstAvg - 0.3) declining = true;
      }

      return {
        student_id: studentId,
        ir_details: irAverages,
        trend: improving ? 'improving' : declining ? 'declining' : 'stable',
        change_amount: changeAmount,
        starting_avg: irAverages[0]?.overall_avg || 'N/A',
        current_avg: irAverages[irAverages.length - 1]?.overall_avg || 'N/A'
      };
    });

    return trends;
  }

  // Get interim report details
  getInterimReports() {
    return interimReports;
  }
}

module.exports = new DataService();
