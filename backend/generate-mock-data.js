const fs = require('fs');

// Class codes for our 15 students
const classCodes = [
  'U-MAT-5A', 'U-ENG-3B', 'U-BIO-4A',
  'L-HIS-2C', 'U-CHE-5B', 'L-PHY-3A',
  'U-PSY-4B', 'L-GEO-2A', 'U-ART-3C'
];

// Generate student data with realistic patterns
const students = [];
let irEntry = 1;

// 15 students, each with 3 classes, across 5 IRs
for (let studentId = 1001; studentId <= 1015; studentId++) {
  // Assign 3 random classes to each student
  const studentClasses = [
    classCodes[Math.floor(Math.random() * classCodes.length)],
    classCodes[Math.floor(Math.random() * classCodes.length)],
    classCodes[Math.floor(Math.random() * classCodes.length)]
  ];
  
  // Determine student pattern
  const pattern = Math.random();
  
  for (let ir = 1; ir <= 5; ir++) {
    for (let classIndex = 0; classIndex < 3; classIndex++) {
      let I, D, CE, KA;
      
      if (pattern < 0.2) {
        // Pattern 1: Struggling student (20% of students)
        I = Math.max(1, Math.min(4, 2 + Math.floor(Math.random() * 2) - 1));
        D = Math.max(1, Math.min(4, 2 + Math.floor(Math.random() * 2) - 1));
        CE = Math.max(1, Math.min(4, 2 + Math.floor(Math.random() * 2) - 1));
        KA = ['D', 'E'][Math.floor(Math.random() * 2)];
      } else if (pattern < 0.4) {
        // Pattern 2: Improving student (20%)
        const improvement = Math.floor(ir / 2);
        I = Math.min(4, 2 + improvement + Math.floor(Math.random() * 2));
        D = Math.min(4, 2 + improvement + Math.floor(Math.random() * 2));
        CE = Math.min(4, 2 + improvement + Math.floor(Math.random() * 2));
        const grades = ['D', 'C', 'C', 'B', 'A'];
        KA = grades[Math.min(4, ir - 1 + Math.floor(Math.random() * 2))];
      } else if (pattern < 0.5) {
        // Pattern 3: High effort, lower grades (10%)
        I = 4;
        D = 4;
        CE = 4;
        KA = ['C', 'D'][Math.floor(Math.random() * 2)];
      } else if (pattern < 0.7) {
        // Pattern 4: Consistent high achiever (20%)
        I = Math.max(3, Math.min(4, 4 - Math.floor(Math.random() * 2)));
        D = Math.max(3, Math.min(4, 4 - Math.floor(Math.random() * 2)));
        CE = Math.max(3, Math.min(4, 4 - Math.floor(Math.random() * 2)));
        KA = ['A', 'B'][Math.floor(Math.random() * 2)];
      } else {
        // Pattern 5: Average/variable student (30%)
        I = Math.max(1, Math.min(4, 2 + Math.floor(Math.random() * 2)));
        D = Math.max(1, Math.min(4, 2 + Math.floor(Math.random() * 2)));
        CE = Math.max(1, Math.min(4, 2 + Math.floor(Math.random() * 2)));
        KA = ['B', 'C', 'D'][Math.floor(Math.random() * 3)];
      }
      
      students.push({
        ir_entry: irEntry++,
        IR: ir,
        student_id: studentId,
        course_group_id: 100 + classIndex,
        class_code: studentClasses[classIndex],
        I: I,
        D: D,
        CE: CE,
        KA: KA
      });
    }
  }
}

// Write to file
fs.writeFileSync(
  './data/student_interim_reports.json',
  JSON.stringify(students, null, 2)
);

console.log(`Generated ${students.length} student interim report entries`);
console.log('Data saved to ./data/student_interim_reports.json');
