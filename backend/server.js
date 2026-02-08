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
// Helper function to build context for Claude based on query
function buildDataContext(message) {
  const lowerMessage = message.toLowerCase();
  let context = `You are a data analysis assistant helping a sixth form college teacher analyze their students' performance.

**IMPORTANT CONTEXT:**
- The teacher is asking about THEIR class of 15 students (IDs: 1001-1015)
- When they say "my students", "my class", or just ask about students generally, they mean these 15 students
- Each student takes 3 different classes/subjects
- There are 5 Interim Reports (IRs) per academic year (IR1 through IR5)

**SCORING SYSTEM:**
- I = Independence (1-4, where 4 is excellent, 1 is poor)
- D = Deadlines (1-4, where 4 is excellent, 1 is poor)  
- CE = Class Ethic (1-4, where 4 is excellent, 1 is poor)
- KA = Key Assessment Grade (A is best, E is worst)

**CLASS CODES FORMAT:**
- Format: U-XXX-#Y or L-XXX-#Y
- U = Upper level, L = Lower level
- XXX = Subject abbreviation (e.g., MAT=Maths, ENG=English, BIO=Biology)
- # = Number, Y = Letter identifier

**HOW TO RESPOND:**
1. Be concise - 3-5 sentences maximum unless asked for details
2. Lead with the key finding first
3. Use bullet points ONLY for listing student IDs or specific data points
4. Use clear headings (##) if covering multiple topics
5. Always refer to students by their ID number
6. Focus on actionable insights, not just data description
7. When showing trends, mention specific numbers (e.g., "improved from 2.5 to 3.2")

**FORMATTING EXAMPLE:**
"Based on the latest interim report, 3 students are struggling: Students 1003, 1007, and 1012 with averages below 2.5. Student 1003 needs the most support with an average of 1.8 across Independence, Deadlines, and Class Ethic."

`;

  let data = {};

  // Determine what data to fetch based on the question
  if (lowerMessage.includes('improving') || lowerMessage.includes('progress') || lowerMessage.includes('trend')) {
    const trends = dataService.getImprovementTrends();
    data.trends = trends;
    context += `\n**IMPROVEMENT TRENDS DATA:**\n${JSON.stringify(trends, null, 2)}\n`;
  }

  if (lowerMessage.includes('struggling') || lowerMessage.includes('worst') || lowerMessage.includes('concern') || lowerMessage.includes('low') || lowerMessage.includes('help')) {
    const struggling = dataService.getStrugglingStudents();
    data.struggling = struggling;
    context += `\n**STRUGGLING STUDENTS (IR5 - Latest):**\n${JSON.stringify(struggling, null, 2)}\n`;
  }

  if (lowerMessage.includes('best') || lowerMessage.includes('top') || lowerMessage.includes('achieving') || lowerMessage.includes('high')) {
    const topPerformers = dataService.getTopPerformers();
    data.topPerformers = topPerformers;
    context += `\n**TOP PERFORMERS (IR5 - Latest):**\n${JSON.stringify(topPerformers, null, 2)}\n`;
  }

  if (lowerMessage.includes('effort') || lowerMessage.includes('trying')) {
    const highEffort = dataService.getHighEffortLowGrades();
    data.highEffort = highEffort;
    context += `\n**HIGH EFFORT BUT LOWER GRADES:**\n${JSON.stringify(highEffort, null, 2)}\n`;
  }

  // If asking about "class" or "students" in general, provide overview
  if ((lowerMessage.includes('class') || lowerMessage.includes('students') || lowerMessage.includes('overview')) 
      && Object.keys(data).length === 0) {
    const trends = dataService.getImprovementTrends();
    const improving = trends.filter(t => t.trend === 'improving').length;
    const declining = trends.filter(t => t.trend === 'declining').length;
    const stable = trends.filter(t => t.trend === 'stable').length;
    
    context += `\n**CLASS OVERVIEW:**\n`;
    context += `Total students: 15\n`;
    context += `Improving: ${improving} students\n`;
    context += `Stable: ${stable} students\n`;
    context += `Declining: ${declining} students\n\n`;
    context += `Full trend data: ${JSON.stringify(trends, null, 2)}\n`;
  }

  context += `\nRemember: Be concise, specific, and actionable. The teacher wants quick insights, not lengthy explanations.`;

  return context;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received message:', req.body.message);
    const { message } = req.body;

    let systemPrompt = '';
    let userMessage = message;

    // Check if this is a data-related query
    if (isDataQuery(message)) {
      console.log('Data query detected - building context...');
      systemPrompt = buildDataContext(message);
      console.log('Context built, querying Claude...');
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
