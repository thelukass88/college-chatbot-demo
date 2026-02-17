const fs = require('fs');

// Load interim reports to get date ranges
const interimReports = JSON.parse(
  fs.readFileSync('./data/interim_reports.json', 'utf8')
);

// Generate attendance records
const attendance = [];
let attendanceId = 1;

// For each student (1001-1015)
for (let studentId = 1001; studentId <= 1015; studentId++) {
  
  // Determine student attendance pattern
  const pattern = Math.random();
  let baseAttendanceRate;
  
  if (pattern < 0.15) {
    // 15% of students: poor attendance (60-75%)
    baseAttendanceRate = 0.60 + Math.random() * 0.15;
  } else if (pattern < 0.3) {
    // 15% of students: concerning attendance (75-85%)
    baseAttendanceRate = 0.75 + Math.random() * 0.10;
  } else if (pattern < 0.8) {
    // 50% of students: good attendance (85-95%)
    baseAttendanceRate = 0.85 + Math.random() * 0.10;
  } else {
    // 20% of students: excellent attendance (95-100%)
    baseAttendanceRate = 0.95 + Math.random() * 0.05;
  }
  
  // Generate attendance for each interim report period
  interimReports.forEach(ir => {
    const startDate = new Date(ir.start_date);
    const endDate = new Date(ir.end_date);
    
    // Calculate number of school days (roughly 5 per week)
    const weeks = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 7));
    const schoolDays = weeks * 5;
    
    // Add some variance to attendance across IRs (students might decline/improve)
    let irVariance = (Math.random() - 0.5) * 0.1; // +/- 5%
    
    // Special case: some students decline in attendance over time
    if (studentId === 1005 || studentId === 1013) {
      irVariance = -0.05 * ir.id; // Progressive decline
    }
    
    // Some students improve
    if (studentId === 1002 || studentId === 1006) {
      irVariance = 0.03 * ir.id; // Progressive improvement
    }
    
    const irAttendanceRate = Math.min(1, Math.max(0, baseAttendanceRate + irVariance));
    
    // Generate individual day records
    for (let day = 0; day < schoolDays; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (day * 7 / 5)); // Approximate school days
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const isPresent = Math.random() < irAttendanceRate;
      
      let absenceReason = null;
      if (!isPresent) {
        const reasons = ['Illness', 'Medical appointment', 'Family emergency', 'Unauthorized', 'Other'];
        const weights = [0.4, 0.15, 0.1, 0.25, 0.1]; // Illness most common
        
        let rand = Math.random();
        let cumulative = 0;
        for (let i = 0; i < reasons.length; i++) {
          cumulative += weights[i];
          if (rand < cumulative) {
            absenceReason = reasons[i];
            break;
          }
        }
      }
      
      // Friday absence pattern (slightly higher for some students)
      const isFriday = date.getDay() === 5;
      const fridayPenalty = (studentId % 3 === 0 && isFriday) ? 0.15 : 0;
      
      const finalPresent = isPresent && (Math.random() > fridayPenalty);
      
      attendance.push({
        attendance_id: attendanceId++,
        student_id: studentId,
        date: date.toISOString().split('T')[0],
        present: finalPresent ? 1 : 0,
        absence_reason: finalPresent ? null : absenceReason,
        ir_period: ir.id
      });
    }
  });
}

// Write to file
fs.writeFileSync(
  './data/attendance.json',
  JSON.stringify(attendance, null, 2)
);

console.log(`Generated ${attendance.length} attendance records`);

// Calculate and display summary stats
const studentStats = {};
for (let studentId = 1001; studentId <= 1015; studentId++) {
  const studentRecords = attendance.filter(a => a.student_id === studentId);
  const presentCount = studentRecords.filter(a => a.present === 1).length;
  const rate = ((presentCount / studentRecords.length) * 100).toFixed(1);
  studentStats[studentId] = rate;
}

console.log('\nAttendance rates by student:');
Object.entries(studentStats)
  .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]))
  .forEach(([id, rate]) => {
    console.log(`Student ${id}: ${rate}%`);
  });
