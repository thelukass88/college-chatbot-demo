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
  let context = `You are analyzing student performance data from interim reports. Here's the context:

**Scoring System:**
- Independence (I), Deadlines (D), Class Ethic (CE): Scored 1-4 (4 is best)
- Key Assessment (KA): Graded A-E (A is best)
- Each student takes 3 classes
- There are 5 interim reports (IRs) per academic year

**Your Role:** You're helping a teacher analyze their students' performance.

`;

  let data = {};

  // Determine what data to fetch based on the question
  if (lowerMessage.includes('improving') || lowerMessage.includes('progress')) {
    const trends = dataService.getImprovementTrends();
    data.trends = trends;
    context += `**Student Improvement Trends:**\n${JSON.stringify(trends, null, 2)}\n\n`;
  }

  if (lowerMessage.includes('struggling') || lowerMessage.includes('worst') || lowerMessage.includes('concern')) {
    const struggling = dataService.getStrugglingStudents();
    data.struggling = struggling;
    context += `**Struggling Students (Latest IR):**\n${JSON.stringify(struggling, null, 2)}\n\n`;
  }

  if (lowerMessage.includes('best') || lowerMessage.includes('top') || lowerMessage.includes('achieving')) {
    const topPerformers = dataService.getTopPerformers();
    data.topPerformers = topPerformers;
    context += `**Top Performers (Latest IR):**\n${JSON.stringify(topPerformers, null, 2)}\n\n`;
  }

  if (lowerMessage.includes('effort') && (lowerMessage.includes('grade') || lowerMessage.includes('reflect'))) {
    const highEffort = dataService.getHighEffortLowGrades();
    data.highEffort = highEffort;
    context += `**High Effort, Lower Grades:**\n${JSON.stringify(highEffort, null, 2)}\n\n`;
  }

  // If no specific query matched, provide overview
  if (Object.keys(data).length === 0) {
    const trends = dataService.getImprovementTrends();
    const struggling = dataService.getStrugglingStudents();
    const topPerformers = dataService.getTopPerformers(3);
    
    context += `**Overview Data:**\n`;
    context += `Improvement Trends: ${JSON.stringify(trends, null, 2)}\n`;
    context += `Struggling Students: ${JSON.stringify(struggling, null, 2)}\n`;
    context += `Top Performers: ${JSON.stringify(topPerformers, null, 2)}\n\n`;
  }

  context += `**Instructions:** Analyze this data and provide clear, actionable insights. Focus on specific student IDs and concrete numbers. Be concise but thorough.`;

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
