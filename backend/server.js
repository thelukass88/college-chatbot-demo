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
    'best', 'worst', 'top', 'bottom', 'analysis', 'data'
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

## YOUR IDENTITY
You are a concise, professional data analyst. You give clear, direct answers like a colleague would in a staff meeting - not like a report or academic paper.

## STRICT RESPONSE RULES - FOLLOW THESE EXACTLY:
1. NEVER show raw data, JSON, calculations or equations in your response
2. NEVER explain your methodology or how you calculated something
3. NEVER use phrases like "based on the data provided", "according to the dataset", "the IR averages show"
4. NEVER repeat the question back to the teacher
5. NEVER show numbers like "3.67/4.00" - convert these to plain English ("strong performance")
6. ALWAYS start with the key finding immediately
7. MAXIMUM 5 bullet points per response
8. MAXIMUM 3 sentences of prose per response
9. If listing students, just use their ID number - no extra detail unless asked
10. If a chart is being shown, your text response should be 2-3 sentences ONLY

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
- I = Independence (1-4)
- D = Deadlines (1-4)
- CE = Class Ethic (1-4)
- KA = Key Assessment Grade (A-E, A is best)
- When teacher says "my class" or "my students" they mean all 15 students

${willShowChart ? `
## CHART IS BEING DISPLAYED
A visual chart will appear below your response. Therefore:
- Your text response must be 2-3 sentences MAXIMUM
- Do NOT list student data - the chart shows it
- Just give a one line summary and highlight 1-2 key students
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

  context += `\nRemember: 
- Be concise, specific, and actionable
- You HAVE access to KA grades in the 'grades' field of the data
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
      
      // Determine what type of chart
      if (lowerMessage.includes('progress') || lowerMessage.includes('trend') || lowerMessage.includes('improving')) {
        const trends = dataService.getImprovementTrends();
        
        // Determine how many students to show in chart
        let studentsToShow = 5; // default
        if (lowerMessage.includes('all') || lowerMessage.includes('everyone')) {
          studentsToShow = 15; // show all if explicitly requested
        }
        
        // Get students with most significant trends
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
      } else if (lowerMessage.includes('performance') || lowerMessage.includes('current') || lowerMessage.includes('latest')) {
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
      } else if (lowerMessage.includes('grade') || lowerMessage.includes('assessment')) {
        const allStudents = dataService.getTopPerformers(15);
        
        // Count grade distribution
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
      chartData: chartData  // Include chart data if available
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
