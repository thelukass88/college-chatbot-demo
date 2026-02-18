const fs = require('fs');

// Load interim reports for date ranges
const interimReports = JSON.parse(
  fs.readFileSync('./data/interim_reports.json', 'utf8')
);

const pastoralNotes = [];
let noteId = 1;

// Pastoral categories
const categories = [
  'Academic Support',
  'Attendance Concern',
  'Behavioural Issue',
  'Mental Health',
  'Family Issues',
  'Peer Conflict',
  'Positive Recognition',
  'Course Change Request'
];

// Generate realistic pastoral notes for students
// Focus on students we know are struggling or have issues

const studentPatterns = {
  1005: { // Poor attendance, poor grades
    notes: [
      { category: 'Attendance Concern', severity: 'High', note: 'Frequent absences. Called home - family aware.', ir: 2, resolved: false },
      { category: 'Academic Support', severity: 'High', note: 'Struggling in all subjects. Referred to learning support.', ir: 3, resolved: false },
      { category: 'Family Issues', severity: 'Moderate', note: 'Parent meeting - family circumstances affecting attendance.', ir: 4, resolved: false }
    ]
  },
  1013: { // Poor grades
    notes: [
      { category: 'Academic Support', severity: 'High', note: 'Requires additional support in core subjects.', ir: 2, resolved: true },
      { category: 'Mental Health', severity: 'Moderate', note: 'Self-referred to wellbeing team. Ongoing support.', ir: 3, resolved: false }
    ]
  },
  1003: { // Declining performance
    notes: [
      { category: 'Behavioural Issue', severity: 'Low', note: 'Late to lessons. Spoken to student.', ir: 2, resolved: true },
      { category: 'Peer Conflict', severity: 'Moderate', note: 'Issues with group work. Mediation successful.', ir: 3, resolved: true },
      { category: 'Attendance Concern', severity: 'Moderate', note: 'Friday attendance pattern emerging.', ir: 4, resolved: false }
    ]
  },
  1002: { // Improving student
    notes: [
      { category: 'Positive Recognition', severity: 'Low', note: 'Significant improvement in effort and grades. Well done!', ir: 4, resolved: true },
      { category: 'Academic Support', severity: 'Low', note: 'Mentoring program successful - grades improving.', ir: 5, resolved: true }
    ]
  },
  1006: { // Improving student
    notes: [
      { category: 'Positive Recognition', severity: 'Low', note: 'Consistent excellent attendance and effort.', ir: 3, resolved: true },
      { category: 'Academic Support', severity: 'Low', note: 'Extra tutoring paying off. Excellent progress.', ir: 5, resolved: true }
    ]
  },
  1007: { // Inconsistent
    notes: [
      { category: 'Behavioural Issue', severity: 'Moderate', note: 'Disruption in class. Parents contacted.', ir: 2, resolved: true },
      { category: 'Attendance Concern', severity: 'Low', note: 'Medical appointments affecting attendance.', ir: 3, resolved: true }
    ]
  },
  1012: { // Mixed results
    notes: [
      { category: 'Course Change Request', severity: 'Low', note: 'Considering switch from Physics to Psychology.', ir: 3, resolved: true },
      { category: 'Academic Support', severity: 'Moderate', note: 'Transition support for course change.', ir: 4, resolved: true }
    ]
  },
  1009: { // Declining
    notes: [
      { category: 'Family Issues', severity: 'Moderate', note: 'Family relocation causing stress.', ir: 4, resolved: false }
    ]
  },
  1001: { // Stable high performer
    notes: [
      { category: 'Positive Recognition', severity: 'Low', note: 'Consistent high performance. Potential Oxbridge candidate.', ir: 5, resolved: true }
    ]
  },
  1004: { // High performer
    notes: [
      { category: 'Positive Recognition', severity: 'Low', note: 'Leadership qualities. Nominated for Head Student.', ir: 4, resolved: true }
    ]
  }
};

// Generate notes for students with patterns
Object.entries(studentPatterns).forEach(([studentId, data]) => {
  data.notes.forEach(note => {
    const ir = interimReports.find(r => r.id === note.ir);
    const noteDate = new Date(ir.start_date);
    noteDate.setDate(noteDate.getDate() + Math.floor(Math.random() * 30)); // Random date within IR period
    
    pastoralNotes.push({
      note_id: noteId++,
      student_id: parseInt(studentId),
      date: noteDate.toISOString().split('T')[0],
      category: note.category,
      severity: note.severity,
      notes: note.note,
      resolved: note.resolved ? 1 : 0,
      ir_period: note.ir,
      staff_member: `Staff ${Math.floor(Math.random() * 5) + 1}` // Random staff member
    });
  });
});

// Add a few random positive notes for other students
const remainingStudents = [1008, 1010, 1011, 1014, 1015];
remainingStudents.forEach(studentId => {
  if (Math.random() > 0.5) {
    const ir = Math.floor(Math.random() * 5) + 1;
    const irData = interimReports.find(r => r.id === ir);
    const noteDate = new Date(irData.start_date);
    
    pastoralNotes.push({
      note_id: noteId++,
      student_id: studentId,
      date: noteDate.toISOString().split('T')[0],
      category: 'Positive Recognition',
      severity: 'Low',
      notes: 'Good progress this term.',
      resolved: 1,
      ir_period: ir,
      staff_member: `Staff ${Math.floor(Math.random() * 5) + 1}`
    });
  }
});

// Sort by date
pastoralNotes.sort((a, b) => new Date(a.date) - new Date(b.date));

// Write to file
fs.writeFileSync(
  './data/pastoral_notes.json',
  JSON.stringify(pastoralNotes, null, 2)
);

console.log(`Generated ${pastoralNotes.length} pastoral notes`);

// Summary by category
const categoryCounts = {};
pastoralNotes.forEach(note => {
  categoryCounts[note.category] = (categoryCounts[note.category] || 0) + 1;
});

console.log('\nNotes by category:');
Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([category, count]) => {
    console.log(`${category}: ${count}`);
  });

console.log('\nUnresolved concerns:');
pastoralNotes
  .filter(n => n.resolved === 0)
  .forEach(note => {
    console.log(`Student ${note.student_id} - ${note.category} (${note.severity}): ${note.notes}`);
  });
