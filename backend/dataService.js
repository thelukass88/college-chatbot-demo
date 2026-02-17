const fs = require('fs');
const path = require('path');

// Load data files
const interimReports = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/interim_reports.json'), 'utf8')
);

const studentReports = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/student_interim_reports.json'), 'utf8')
);

const attendance = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/attendance.json'), 'utf8')
);

const subjectTeacherMap = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/subject_teacher_map.json'), 'utf8')
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

  // Get attendance for a specific student
  getStudentAttendance(studentId, irId = null) {
    let data = attendance.filter(a => a.student_id === studentId);
    
    if (irId) {
      data = data.filter(a => a.ir_period === irId);
    }
    
    return data;
  }

  // Calculate attendance rate for a student
  getStudentAttendanceRate(studentId, irId = null) {
    const records = this.getStudentAttendance(studentId, irId);
    
    if (records.length === 0) return null;
    
    const presentCount = records.filter(r => r.present === 1).length;
    const rate = (presentCount / records.length * 100).toFixed(1);
    
    return {
      student_id: studentId,
      total_days: records.length,
      present_days: presentCount,
      absent_days: records.length - presentCount,
      attendance_rate: parseFloat(rate),
      ir_period: irId
    };
  }

  // Get attendance summary for all students
  getAllStudentAttendanceRates(irId = null) {
    const students = [...new Set(attendance.map(a => a.student_id))];
    
    return students.map(studentId => 
      this.getStudentAttendanceRate(studentId, irId)
    ).sort((a, b) => a.attendance_rate - b.attendance_rate);
  }

  // Correlate attendance with grades
  getAttendanceGradeCorrelation(studentId) {
    const studentGrades = this.getImprovementTrends()
      .find(t => t.student_id === studentId);
    
    if (!studentGrades) return null;
    
    const correlation = [];
    
    for (let ir = 1; ir <= 5; ir++) {
      const attendanceData = this.getStudentAttendanceRate(studentId, ir);
      const gradeData = studentGrades.ir_details.find(ird => ird.ir === ir);
      
      if (attendanceData && gradeData) {
        correlation.push({
          ir: ir,
          attendance_rate: attendanceData.attendance_rate,
          grade_average: parseFloat(gradeData.overall_avg),
          independence: parseFloat(gradeData.independence_avg),
          deadlines: parseFloat(gradeData.deadlines_avg),
          grades: gradeData.grades
        });
      }
    }
    
    return {
      student_id: studentId,
      correlation_data: correlation
    };
  }

  // Find students with attendance concerns
  getAttendanceConcerns(threshold = 85) {
    const latestIR = 5;
    const rates = this.getAllStudentAttendanceRates(latestIR);
    
    return rates
      .filter(r => r.attendance_rate < threshold)
      .map(r => ({
        ...r,
        concern_level: r.attendance_rate < 75 ? 'High' : 'Moderate'
      }));
  }

  // Get subject/teacher information for a class code
  getClassInfo(classCode) {
    return subjectTeacherMap.find(m => m.class_code === classCode);
  }

  // Get all classes taught by a specific teacher
  getTeacherClasses(teacherId) {
    return subjectTeacherMap.filter(m => m.teacher_id === teacherId);
  }

  // Get performance data by subject
  getSubjectPerformance(subjectCode, irId = null) {
    // Get all class codes for this subject
    const subjectClasses = subjectTeacherMap
      .filter(m => m.subject_code === subjectCode)
      .map(m => m.class_code);
    
    // Get student data for these classes
    let data = studentReports.filter(r => subjectClasses.includes(r.class_code));
    
    if (irId) {
      data = data.filter(r => r.IR === irId);
    }
    
    if (data.length === 0) return null;
    
    // Calculate averages
    const avgI = (data.reduce((sum, r) => sum + r.I, 0) / data.length).toFixed(2);
    const avgD = (data.reduce((sum, r) => sum + r.D, 0) / data.length).toFixed(2);
    const avgCE = (data.reduce((sum, r) => sum + r.CE, 0) / data.length).toFixed(2);
    const avgEffort = ((parseFloat(avgI) + parseFloat(avgD) + parseFloat(avgCE)) / 3).toFixed(2);
    
    // Grade distribution
    const grades = data.map(r => r.KA);
    const gradeCount = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    grades.forEach(g => {
      if (gradeCount[g] !== undefined) gradeCount[g]++;
    });
    
    return {
      subject_code: subjectCode,
      subject_name: subjectTeacherMap.find(m => m.subject_code === subjectCode)?.subject_name,
      ir_period: irId,
      student_count: [...new Set(data.map(r => r.student_id))].length,
      entry_count: data.length,
      avg_independence: parseFloat(avgI),
      avg_deadlines: parseFloat(avgD),
      avg_class_ethic: parseFloat(avgCE),
      avg_effort_score: parseFloat(avgEffort),
      grade_distribution: gradeCount
    };
  }

  // Get performance data by teacher
  getTeacherPerformance(teacherId, irId = null) {
    const teacherClasses = this.getTeacherClasses(teacherId);
    const classCodes = teacherClasses.map(c => c.class_code);
    
    let data = studentReports.filter(r => classCodes.includes(r.class_code));
    
    if (irId) {
      data = data.filter(r => r.IR === irId);
    }
    
    if (data.length === 0) return null;
    
    const avgI = (data.reduce((sum, r) => sum + r.I, 0) / data.length).toFixed(2);
    const avgD = (data.reduce((sum, r) => sum + r.D, 0) / data.length).toFixed(2);
    const avgCE = (data.reduce((sum, r) => sum + r.CE, 0) / data.length).toFixed(2);
    const avgEffort = ((parseFloat(avgI) + parseFloat(avgD) + parseFloat(avgCE)) / 3).toFixed(2);
    
    const grades = data.map(r => r.KA);
    const gradeCount = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    grades.forEach(g => {
      if (gradeCount[g] !== undefined) gradeCount[g]++;
    });
    
    const teacherInfo = teacherClasses[0];
    
    return {
      teacher_id: teacherId,
      teacher_name: teacherInfo?.teacher_name,
      subject: teacherInfo?.subject_name,
      classes: classCodes,
      ir_period: irId,
      student_count: [...new Set(data.map(r => r.student_id))].length,
      entry_count: data.length,
      avg_independence: parseFloat(avgI),
      avg_deadlines: parseFloat(avgD),
      avg_class_ethic: parseFloat(avgCE),
      avg_effort_score: parseFloat(avgEffort),
      grade_distribution: gradeCount
    };
  }

  // Compare performance across all subjects
  compareSubjects(irId = 5) {
    const subjects = [...new Set(subjectTeacherMap.map(m => m.subject_code))];
    
    return subjects.map(subjectCode => {
      return this.getSubjectPerformance(subjectCode, irId);
    }).filter(s => s !== null)
      .sort((a, b) => b.avg_effort_score - a.avg_effort_score);
  }

  // Compare performance across all teachers
  compareTeachers(irId = 5) {
    const teachers = [...new Set(subjectTeacherMap.map(m => m.teacher_id))];
    
    return teachers.map(teacherId => {
      return this.getTeacherPerformance(teacherId, irId);
    }).filter(t => t !== null)
      .sort((a, b) => b.avg_effort_score - a.avg_effort_score);
  }

  // Get all subjects
  getAllSubjects() {
    return [...new Set(subjectTeacherMap.map(m => ({
      subject_code: m.subject_code,
      subject_name: m.subject_name
    })))];
  }

  // Get all teachers
  getAllTeachers() {
    return [...new Set(subjectTeacherMap.map(m => ({
      teacher_id: m.teacher_id,
      teacher_name: m.teacher_name,
      subject: m.subject_name
    })))];
  }
}

module.exports = new DataService();
