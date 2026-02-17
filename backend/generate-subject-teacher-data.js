const fs = require('fs');

// Define subjects and teachers
const subjects = [
  { subject_code: 'MAT', subject_name: 'Mathematics', teacher_id: 'T001', teacher_name: 'Ms. Johnson' },
  { subject_code: 'ENG', subject_name: 'English Literature', teacher_id: 'T002', teacher_name: 'Mr. Thompson' },
  { subject_code: 'BIO', subject_name: 'Biology', teacher_id: 'T003', teacher_name: 'Dr. Martinez' },
  { subject_code: 'HIS', subject_name: 'History', teacher_id: 'T004', teacher_name: 'Ms. Chen' },
  { subject_code: 'CHE', subject_name: 'Chemistry', teacher_id: 'T005', teacher_name: 'Mr. Williams' },
  { subject_code: 'PHY', subject_name: 'Physics', teacher_id: 'T006', teacher_name: 'Dr. Patel' },
  { subject_code: 'PSY', subject_name: 'Psychology', teacher_id: 'T007', teacher_name: 'Ms. Brown' },
  { subject_code: 'GEO', subject_name: 'Geography', teacher_id: 'T008', teacher_name: 'Mr. Davis' },
  { subject_code: 'ART', subject_name: 'Art & Design', teacher_id: 'T009', teacher_name: 'Ms. Wilson' },
  { subject_code: 'EDA', subject_name: 'Economics', teacher_id: 'T010', teacher_name: 'Mr. Anderson' }
];

// Load existing student reports to map class codes to subjects
const studentReports = JSON.parse(
  fs.readFileSync('./data/student_interim_reports.json', 'utf8')
);

// Extract unique class codes
const uniqueClassCodes = [...new Set(studentReports.map(r => r.class_code))];

// Map each class code to a subject
const subjectTeacherMap = [];
let mapId = 1;

uniqueClassCodes.forEach(classCode => {
  // Extract subject code from class_code (e.g., "U-MAT-5A" -> "MAT")
  const parts = classCode.split('-');
  const subjectCode = parts[1];
  
  // Find the subject details
  const subject = subjects.find(s => s.subject_code === subjectCode);
  
  if (subject) {
    // Extract level (U or L) and class identifier
    const level = parts[0]; // U (Upper) or L (Lower)
    const classId = parts[2]; // e.g., "5A"
    
    subjectTeacherMap.push({
      id: mapId++,
      class_code: classCode,
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      teacher_id: subject.teacher_id,
      teacher_name: subject.teacher_name,
      level: level === 'U' ? 'Upper' : 'Lower',
      class_identifier: classId,
      year_group: level === 'U' ? 'Year 13' : 'Year 12'
    });
  }
});

// Write to file
fs.writeFileSync(
  './data/subject_teacher_map.json',
  JSON.stringify(subjectTeacherMap, null, 2)
);

console.log(`Generated ${subjectTeacherMap.length} subject-teacher mappings`);

// Display summary
console.log('\nSubjects and Teachers:');
const teacherSummary = {};

subjectTeacherMap.forEach(mapping => {
  if (!teacherSummary[mapping.teacher_name]) {
    teacherSummary[mapping.teacher_name] = {
      subject: mapping.subject_name,
      classes: []
    };
  }
  teacherSummary[mapping.teacher_name].classes.push(mapping.class_code);
});

Object.entries(teacherSummary).forEach(([teacher, data]) => {
  console.log(`${teacher} teaches ${data.subject}: ${data.classes.join(', ')}`);
});
