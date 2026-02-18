const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const cors = require('cors');
require('dotenv').config();
const dataService = require('./dataService');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to detect if message is about student data
function isDataQuery(message) {
  const dataKeywords = [
    'student', 'improving', 'struggling', 'progress', 'performance',
    'grades', 'achievement', 'effort', 'trend', 'interim', 'report',
    'best', 'worst', 'top', 'bottom', 'analysis', 'data', 'attendance',
    'absent', 'present'
  ];
  
  const lowerMessage = message.toLowerCase();
  return dataKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Helper function to build context for Claude based on query
function buildDataContext(message) {
  const lowerMessage = message.toLowerCase();
  
  const willShowChart = lowerMessage.includes('chart') || 
                        lowerMessage.includes('graph') || 
                        lowerMessage.includes('visualize') ||
                        lowerMessage.includes('show me') ||
                        lowerMessage.includes('plot');

  let context = `You are a teacher's assistant helping analyse sixth form student performance data.

<critical_instructions>
NEVER UNDER ANY CIRCUMSTANCES:
- Output JSON, code blocks, or data structures
- Show raw numbers in structured format
- Create chart specifications or configurations
- Use markdown code fences (\`\`\`) in your response
- Generate chart.js syntax or configurations

The system handles ALL chart generation. You ONLY provide natural language analysis.
If you include JSON or code blocks, the system will fail.
</critical_instructions>

## YOUR IDENTITY
You are a concise, professional data analyst. You give clear, direct answers like a colleague would in a staff meeting - not like a report or academic paper.

## STRICT RESPONSE RULES - FOLLOW THESE EXACTLY:
1. NEVER show raw data, JSON, calculations or equations in your response
2. NEVER explain your methodology or how you calculated something
3. NEVER use phrases like "based on the data provided", "according to the dataset", "the IR averages show"
4. NEVER repeat the question back to the teacher
5. NEVER show numbers like "3.67/4.00" - convert these to plain English ("strong performance")
6. NEVER use code blocks, markdown fences, or structured data formats
7. ALWAYS start with the key finding immediately
8. MAXIMUM 5 bullet points per response
9. MAXIMUM 3 sentences of prose per response
10. If listing students, just use their ID number - no extra detail unless asked
11. If a chart is being shown, your text response should be 2-3 sentences ONLY

## TONE
- Professional but conversational
- Like a colleague giving a quick update
- Direct and actionable
- No jargon, no raw numbers unless specifically helpful

## GOOD RESPONSE EXAMPLES:

Question: "Who is struggling?"
Good: "Three students need your attention right now: 1005, 1013, and 1003. Students 1005 and 1013 have been consistently underperforming across all five reports. I'd recommend prioritising 1005 for a pastoral check-in."

Bad: "Based on the data provided, I have calculated the average of Independence (I), Deadlines (D) and Class Ethic (CE) scores across IR5 to identify students with averages below the threshold of 2.5/4.00..."

Question: "Show me a progress chart"
Good: "Here's the progress chart for your top 5 students by change. Students 1002 and 1006 have improved the most this year."

Bad: "I have generated a line chart showing the IR averages (calculated as I+D+CE/3) for the students with the highest absolute change amount across IR1-IR5..."

## DATA CONTEXT:
- You are analysing 15 sixth form students (IDs 1001-1015)
- Each student takes 3 classes
- 5 Interim Reports (IRs) per year
- When teacher says "my class" or "my students" they mean all 15 students

## TWO COMPLETELY SEPARATE SCORING SYSTEMS - NEVER MIX THESE UP:

### Attitude & Behaviour Scores (effort based):
- I = Independence (scored 1-4, where 4 = excellent, 1 = poor)
- D = Deadlines (scored 1-4, where 4 = excellent, 1 = poor)
- CE = Class Ethic (scored 1-4, where 4 = excellent, 1 = poor)
- When asked about these, describe them as "Attitude & Behaviour scores"
- NEVER display these as grades - they are numeric scores only
- Describe scores as: 4 = Excellent, 3 = Good, 2 = Needs Improvement, 1 = Poor

### Academic Grades:
- KA = Key Assessment Grade (A, B, C, D, or E - A is best, E is worst)
- These are LETTER grades only - NEVER convert to numbers in your response
- When asked about grades, ONLY refer to KA grades
- Describe grades as: A = Excellent, B = Good, C = Satisfactory, D = Below Expected, E = Serious Concern

## CRITICAL RULES FOR RESPONDING ABOUT DATA:
- If asked about "grades" or "KA" → only discuss KA letter grades (A-E)
- If asked about "attitude", "behaviour", "effort", "independence", "deadlines", "class ethic" → only discuss I, D, CE scores (1-4)
- NEVER show both together unless specifically asked to compare them
- NEVER say things like "average score of 3.67/4" - say "strong performance" or "good effort scores"
- NEVER show the numeric conversion of KA grades in your response

${willShowChart ? `
<chart_mode>
A VISUAL CHART IS ALREADY BEING GENERATED BY THE SYSTEM.

YOUR ROLE: Provide 2-3 sentences of text analysis ONLY.

FORBIDDEN in your response:
- JSON data
- Code blocks (\`\`\`json or any other fence)
- Chart specifications
- Structured data of any kind

The chart appears automatically. You just provide human-readable insights.
</chart_mode>
` : ''}

`;
  let data = {};

  // Determine what data to fetch based on the question
  if (lowerMessage.includes('improving') || lowerMessage.includes('progress') || lowerMessage.includes('trend')) {
    const trends = dataService.getImprovementTrends();
    data.trends = trends;
    context += `\n**IMPROVEMENT TRENDS DATA:**\n`;
    context += `Note: This shows average effort scores (I+D+CE)/3 across IRs. To see actual grades, check the struggling/top performers data.\n`;
    context += `${JSON.stringify(trends, null, 2)}\n`;
  }

  if (lowerMessage.includes('struggling') || lowerMessage.includes('worst') || lowerMessage.includes('concern') || lowerMessage.includes('low') || lowerMessage.includes('help')) {
    const struggling = dataService.getStrugglingStudents();
    data.struggling = struggling;
    context += `\n**STRUGGLING STUDENTS (IR5 - Latest):**\n`;
    context += `Note: 'grades' field shows KA (Key Assessment) grades for each of their 3 classes.\n`;
    context += `${JSON.stringify(struggling, null, 2)}\n`;
  }

  if (lowerMessage.includes('best') || lowerMessage.includes('top') || lowerMessage.includes('achieving') || lowerMessage.includes('high')) {
    const topPerformers = dataService.getTopPerformers();
    data.topPerformers = topPerformers;
    context += `\n**TOP PERFORMERS (IR5 - Latest):**\n`;
    context += `Note: 'grades' field shows KA (Key Assessment) grades for each of their 3 classes.\n`;
    context += `${JSON.stringify(topPerformers, null, 2)}\n`;
  }

  if (lowerMessage.includes('effort') || lowerMessage.includes('trying')) {
    const highEffort = dataService.getHighEffortLowGrades();
    data.highEffort = highEffort;
    context += `\n**HIGH EFFORT BUT LOWER GRADES:**\n`;
    context += `Note: 'grades' field shows KA (Key Assessment) grades. These students have high effort scores (I, D, CE) but their KA grades are C, D, or E.\n`;
    context += `${JSON.stringify(highEffort, null, 2)}\n`;
  }

  // Check if asking about grades specifically
  if (lowerMessage.includes('grade') || lowerMessage.includes('assessment') || lowerMessage.includes('ka')) {
    // Make sure we have grade data
    if (!data.struggling && !data.topPerformers) {
      const allStudents = dataService.getTopPerformers(15); // Get all for grade analysis
      context += `\n**ALL STUDENT GRADES (IR5 - Latest):**\n`;
      context += `Each student has 3 KA grades (one per class). The 'grades' array shows these.\n`;
      context += `${JSON.stringify(allStudents, null, 2)}\n`;
    }
  }

  // Check for attendance queries
  if (lowerMessage.includes('attendance') || lowerMessage.includes('absent') || lowerMessage.includes('present')) {
    const attendanceConcerns = dataService.getAttendanceConcerns();
    const allRates = dataService.getAllStudentAttendanceRates(5); // Latest IR
    
    context += `\n**ATTENDANCE DATA (Latest IR):**\n`;
    context += `Students with attendance concerns (< 85%):\n${JSON.stringify(attendanceConcerns, null, 2)}\n\n`;
    context += `All student attendance rates:\n${JSON.stringify(allRates, null, 2)}\n`;
  }

  // Check for correlation queries
  if (lowerMessage.includes('correlation') || lowerMessage.includes('relationship') || 
      (lowerMessage.includes('attendance') && (lowerMessage.includes('grade') || lowerMessage.includes('performance')))) {
    
    // Get attendance-grade correlation for struggling students
    const struggling = dataService.getStrugglingStudents();
    const correlations = struggling.slice(0, 5).map(s => 
      dataService.getAttendanceGradeCorrelation(s.student_id)
    );
    
    context += `\n**ATTENDANCE vs GRADE CORRELATION (Struggling Students):**\n`;
    context += `${JSON.stringify(correlations, null, 2)}\n`;
  }

  // If asking about "class" or "students" in general, provide overview
  if ((lowerMessage.includes('class') || lowerMessage.includes('students') || lowerMessage.includes('overview')) 
      && Object.keys(data).length === 0) {
    const trends = dataService.getImprovementTrends();
    const improving = trends.filter(t => t.trend === 'improving').length;
    const declining = trends.filter(t => t.trend === 'declining').length;
    const stable = trends.filter(t => t.trend === 'stable').length;
    
    const topPerformers = dataService.getTopPerformers(3);
    const struggling = dataService.getStrugglingStudents();
    
    context += `\n**CLASS OVERVIEW:**\n`;
    context += `Total students: 15\n`;
    context += `Improving: ${improving} students\n`;
    context += `Stable: ${stable} students\n`;
    context += `Declining: ${declining} students\n\n`;
    context += `Top 3 performers with their KA grades:\n${JSON.stringify(topPerformers, null, 2)}\n\n`;
    context += `Struggling students with their KA grades:\n${JSON.stringify(struggling, null, 2)}\n`;
  }

  // Check for subject-specific queries
  if (lowerMessage.includes('subject') || lowerMessage.includes('maths') || lowerMessage.includes('english') || 
      lowerMessage.includes('science') || lowerMessage.includes('compare subject')) {
    const subjectComparison = dataService.compareSubjects(5);
    
    context += `\n**SUBJECT PERFORMANCE COMPARISON (Latest IR):**\n`;
    context += `${JSON.stringify(subjectComparison, null, 2)}\n`;
  }

  // Check for teacher-specific queries
  if (lowerMessage.includes('teacher') || lowerMessage.includes('compare teacher') || 
      lowerMessage.includes('which teacher')) {
    const teacherComparison = dataService.compareTeachers(5);
    
    context += `\n**TEACHER PERFORMANCE COMPARISON (Latest IR):**\n`;
    context += `${JSON.stringify(teacherComparison, null, 2)}\n`;
  }

  // Check for pastoral queries
  if (lowerMessage.includes('pastoral') || lowerMessage.includes('concern') || 
      lowerMessage.includes('wellbeing') || lowerMessage.includes('support')) {
    const unresolvedConcerns = dataService.getUnresolvedConcerns();
    const highNeedStudents = dataService.getHighPastoralNeedStudents();
    
    context += `\n**PASTORAL DATA:**\n`;
    context += `Unresolved concerns:\n${JSON.stringify(unresolvedConcerns, null, 2)}\n\n`;
    context += `Students with high pastoral needs:\n${JSON.stringify(highNeedStudents, null, 2)}\n`;
  }

  // Check for intervention impact queries
  if ((lowerMessage.includes('intervention') || lowerMessage.includes('pastoral')) && 
      (lowerMessage.includes('impact') || lowerMessage.includes('effective') || lowerMessage.includes('work'))) {
    
    // Get impact analysis for students with pastoral notes
    const highNeedStudents = dataService.getHighPastoralNeedStudents();
    const impacts = highNeedStudents.slice(0, 5).map(s => 
      dataService.getPastoralImpact(s.student_id)
    ).filter(i => i !== null);
    
    context += `\n**PASTORAL INTERVENTION IMPACT:**\n`;
    context += `${JSON.stringify(impacts, null, 2)}\n`;
  }

  context += `\nRemember: 
- Be concise, specific, and actionable
- You HAVE access to KA grades in the 'grades' field of the data
- You HAVE access to attendance data when asked
- When discussing student performance, reference both effort scores (I, D, CE) AND their KA grades
- The teacher wants quick insights, not lengthy explanations`;

  return context;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received message:', req.body.message);
    const { message } = req.body;

    let systemPrompt = '';
    let userMessage = message;
    let chartData = null;

    // Check if this is a data-related query
    if (isDataQuery(message)) {
      console.log('Data query detected - building context...');
      systemPrompt = buildDataContext(message);
      console.log('Context built, querying Claude...');
    }

    // Detect if user wants a chart/visualization
    const lowerMessage = message.toLowerCase();
    const wantsChart = lowerMessage.includes('chart') || 
                       lowerMessage.includes('graph') || 
                       lowerMessage.includes('visualize') ||
                       lowerMessage.includes('show me') ||
                       lowerMessage.includes('plot');

    if (wantsChart && isDataQuery(message)) {
      console.log('Chart requested - preparing chart data...');
    
      // Determine how many students to show
      let studentsToShow = 5;
      if (lowerMessage.includes('all') || lowerMessage.includes('everyone')) {
        studentsToShow = 15;
      }
    
      // CHECK GRADES FIRST - before progress/trend
      if (lowerMessage.includes('grade') || lowerMessage.includes('ka') || lowerMessage.includes('assessment') || lowerMessage.includes('key assessment')) {
        console.log('Grade chart requested...');
        
        const studentReports = dataService.getAllStudentData();
        
        // Group by student and IR
        const gradesByStudent = {};
        studentReports.forEach(entry => {
          if (!gradesByStudent[entry.student_id]) {
            gradesByStudent[entry.student_id] = {};
          }
          if (!gradesByStudent[entry.student_id][entry.IR]) {
            gradesByStudent[entry.student_id][entry.IR] = [];
          }
          gradesByStudent[entry.student_id][entry.IR].push(entry.KA);
        });
    
        // Convert grades to numbers for charting
        const gradeToNumber = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
        const numberToGrade = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E' };
    
        const studentGradeData = Object.keys(gradesByStudent)
          .slice(0, studentsToShow)
          .map(studentId => {
            const irData = [];
            for (let ir = 1; ir <= 5; ir++) {
              const grades = gradesByStudent[studentId][ir] || [];
              const numericGrades = grades.map(g => gradeToNumber[g]);
              const avgNumeric = numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length;
              irData.push({
                ir: ir,
                grade_numeric: Math.round(avgNumeric),
                grade_letter: numberToGrade[Math.round(avgNumeric)],
                all_grades: grades
              });
            }
            return {
              student_id: parseInt(studentId),
              data: irData
            };
          });
    
        chartData = {
          type: 'line_grades',
          title: `Student KA Grade Progress (A-E)`,
          students: studentGradeData
        };
    
      } else if (lowerMessage.includes('performance') || lowerMessage.includes('current') || lowerMessage.includes('latest')) {
        console.log('Performance bar chart requested...');
        
        const topPerformers = dataService.getTopPerformers(15);
        
        chartData = {
          type: 'bar',
          title: 'Current Student Performance (Latest IR)',
          students: topPerformers.map(student => ({
            student_id: student.student_id,
            score: parseFloat(student.average_score),
            grades: student.grades
          }))
        };
    
      } else if (lowerMessage.includes('distribution')) {
        console.log('Grade distribution pie chart requested...');
        
        const allStudents = dataService.getTopPerformers(15);
        const gradeCount = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        
        allStudents.forEach(student => {
          student.grades.forEach((grade) => {
            if (gradeCount[grade] !== undefined) {
              gradeCount[grade]++;
            }
          });
        });
    
        chartData = {
          type: 'pie',
          title: 'Grade Distribution (All Classes, Latest IR)',
          data: Object.entries(gradeCount).map(([grade, count]) => ({
            grade,
            count
          }))
        };
    
      } else if (lowerMessage.includes('progress') || lowerMessage.includes('trend') || lowerMessage.includes('improving')) {
        console.log('Progress line chart requested...');
        
        const trends = dataService.getImprovementTrends();
        
        const sortedByChange = trends
          .map(t => ({
            ...t,
            absChange: Math.abs(parseFloat(t.change_amount))
          }))
          .sort((a, b) => b.absChange - a.absChange)
          .slice(0, studentsToShow);
    
        chartData = {
          type: 'line',
          title: `Student Progress Over Time (Top ${studentsToShow})`,
          students: sortedByChange.map(student => ({
            student_id: student.student_id,
            trend: student.trend,
            data: student.ir_details.map(ir => ({
              ir: ir.ir,
              score: parseFloat(ir.overall_avg)
            }))
          }))
        };
      }
    }

    console.log('Calling Anthropic API...');
    
    const messages = [
      {
        role: 'user',
        content: userMessage,
      }
    ];

    // Build the API request
    const apiRequest = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: messages
    };

    // Add system prompt if we have one
    if (systemPrompt) {
      apiRequest.system = systemPrompt;
    }

    const response = await anthropic.messages.create(apiRequest);

    console.log('Got response from Claude');
    
    res.json({
      reply: response.content[0].text,
      chartData: chartData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// New endpoint: Get raw data (optional, for debugging)
app.get('/api/data/students', (req, res) => {
  try {
    const allData = dataService.getAllStudentData();
    res.json(allData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// New endpoint: Get specific student data
app.get('/api/data/student/:id', (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const studentData = dataService.getStudentData(studentId);
    const progress = dataService.getStudentProgress(studentId);
    
    res.json({
      entries: studentData,
      progress: progress
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
