# AI-Powered Student Performance Analysis Tool

An intelligent chatbot system designed specifically for sixth form college teachers to analyse student performance data through natural language queries and interactive visualizations.

## 🎯 Project Overview

This project addresses a real-world challenge in education: helping time-constrained teachers extract meaningful insights from student performance data without requiring technical expertise in data analysis.

### What This Project Includes

- **Frontend**: Angular 19 application with conversational chat interface and interactive charts
- **Backend**: Node.js/Express server that securely handles API calls to Anthropic
- **AI Integration**: Uses Claude Sonnet 4 via the Anthropic API for natural language data analysis
- **Data Visualization**: Chart.js integration for downloadable performance charts
- **Security**: API keys stored securely in environment variables, never exposed to the client

## 🏗️ Architecture
```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Angular App    │────────▶│  Node.js Server  │────────▶│  Anthropic API  │
│  (Port 4200)    │◀────────│  (Port 3000)     │◀────────│  (Claude)       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

**Why this architecture?**
- The backend protects your API key from being exposed in the browser
- Separates concerns: Angular handles UI, Node.js handles API communication and data analysis
- Scalable: Easy to add features like SQL database connections, user authentication, etc.

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js** v22.12 or higher ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** for version control
- **Anthropic API Key** ([Get one here](https://console.anthropic.com/))
- A code editor (VS Code recommended)
- Basic familiarity with terminal/command line

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/college-chatbot-demo.git
cd college-chatbot-demo
```

### 2. Set Up the Backend
```bash
cd backend

# Install dependencies
npm install

# Create environment file
touch .env
```

Open `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
PORT=3000
```

**⚠️ Important**: Never commit your `.env` file to GitHub! It's already in `.gitignore`.

### 3. Set Up the Frontend
```bash
cd ../chatbot-frontend

# Install dependencies
npm install
```

### 4. Generate Mock Data
```bash
cd ../backend
node generate-mock-data.js
```

This creates realistic student performance data: 15 students × 3 classes × 5 interim reports = 225 data entries.

### 5. Run the Application

You need **two terminal windows**:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
You should see: `Backend server running on http://localhost:3000`

**Terminal 2 - Frontend App:**
```bash
cd chatbot-frontend
ng serve
```
You should see: Compiled successfully, available at `http://localhost:4200`

### 6. Use the Chatbot

Open your browser and go to `http://localhost:4200`

Try asking questions like:
- "Who is struggling the most?"
- "Show me a chart of student progress"
- "Which students are putting in effort but not seeing results?"

## 🛠️ Technologies Used

- **Angular 19**: Modern web framework for building the UI
- **Node.js & Express**: Backend server and API handling
- **Anthropic Claude API**: AI language model (Sonnet 4)
- **Chart.js**: Interactive, downloadable data visualizations
- **RxJS**: Reactive programming for handling async operations
- **TypeScript**: Type-safe JavaScript for both frontend and backend

---

## The Problem We're Solving

### Why This Matters for Education

Teachers are expected to analyse complex student performance data as part of their role, yet:

- **No formal training exists** for data analysis in teacher education programmes
- **Time is extremely limited** - teachers have minimal non-contact time for admin tasks
- **Data literacy varies widely** - not all staff are confident interpreting datasets
- **Traditional tools are inadequate** - Excel spreadsheets don't answer questions like "which students need intervention?"
- **AI adoption is unclear** - schools invest in AI tools without understanding how they fit into actual workflows

### The Core Insight

Teachers don't need another dashboard. They need a **colleague who understands data** and can answer questions in plain English while they're making coffee between lessons.

This project demonstrates how AI can be integrated into an existing workflow (interim report analysis) to save time, improve insights, and support pastoral care - without requiring teachers to learn new technical skills.

## What This Tool Does

### Natural Language Data Analysis

Ask questions in plain English:
- "Who is struggling the most?"
- "Show me students who are putting in effort but not seeing results in their grades"
- "Are my students improving across their interim reports?"
- "Which students need immediate intervention?"

### Intelligent Visualizations

The system automatically generates appropriate charts:
- **Line charts** for progress tracking (KA grades A-E or attitude scores 1-4)
- **Bar charts** for current performance snapshots
- **Pie charts** for grade distribution analysis
- **Downloadable** as PNG images for reports or parent meetings

### Real-Time Insights

- Identifies struggling students automatically
- Highlights improvement trends
- Flags students with high effort but lower academic performance
- Provides actionable recommendations for pastoral support

## Data Structure

Based on actual sixth form reporting systems:

**Interim Reports Table:**
- 5 interim reports per academic year
- Date ranges and active status tracking

**Student Interim Reports:**
- Student ID, Class Code, Interim Report ID
- **Attitude & Behaviour Scores** (1-4 scale):
  - Independence (I)
  - Deadlines (D)
  - Class Ethic (CE)
- **Key Assessment Grades** (A-E scale):
  - Academic performance per subject (KA)

Each student takes 3 classes, generating 15 data points per student per year.

## Key Features

### 1. Conversational Interface
- Natural language question processing
- Context-aware responses (understands "my class" means all students)
- Concise, actionable insights (not academic reports)
- Message history with timestamps
- Clear chat functionality

### 2. Dynamic Chart Generation
- Automatically detects when visualizations would be helpful
- Supports multiple chart types based on query intent
- Real-time rendering within chat interface
- Download charts as PNG images
- Separate Analytics dashboard for overview

### 3. Privacy-First Design
- API keys stored securely in environment variables
- Backend proxy protects sensitive keys from client exposure
- Designed for easy adaptation to self-hosted LLMs for GDPR compliance
- Student data uses IDs only (no personally identifiable information in demo)

### 4. Teacher-Centric UX
- Two-tab interface: Chat for questions, Analytics for dashboards
- Auto-scroll to latest messages
- Typing indicators for better feedback
- Mobile-responsive design

## Usage Examples

### Example Queries

**Identifying At-Risk Students:**
> "Who needs my immediate attention?"

**Tracking Progress:**
> "Show me a chart of all students' KA grades across reports"

**Understanding Effort vs Achievement:**
> "Which students are trying hard but not seeing results in their grades?"

**Quick Checks:**
> "Are any students improving this term?"

### Sample Response

**Query:** "Who is struggling the most?"

**Response:**
> Three students need immediate support: 1005, 1013, and 1003. Students 1005 and 1013 have consistently low grades (D/E range) across all subjects and all five reports. I'd recommend starting with 1005 for a pastoral conversation.

*[Interactive chart showing grade trends appears below]*

## Development Journey & Lessons Learned

### Challenge 1: Understanding the Real Use Case
**Initial Approach:** Build a generic chatbot  
**Reality Check:** Teachers need specific insights about specific data points  
**Solution:** Focus narrowly on interim report analysis with real data structure

### Challenge 2: AI Response Quality
**Problem:** Claude gave verbose, technical responses with equations  
**Solution:** Iterative prompt engineering:
- "Like a colleague in a staff meeting" framing
- Explicit rules: "NEVER show raw data or equations"
- Maximum sentence/bullet point limits
- Good vs bad response examples in system prompt

### Challenge 3: Chart Integration
**Problem:** Claude tried to generate chart specifications in its responses  
**Solution:** Clear separation of concerns - backend generates chart data, Claude only provides text analysis

### Challenge 4: Data Privacy Concerns
**Challenge:** Student data is highly sensitive (GDPR, safeguarding)  
**Options Explored:**
- Self-hosted LLMs (Llama) - requires GPU investment (£5-10k for 100 staff)
- Azure OpenAI - Microsoft's enterprise service with data processing agreements
- Anthropic Enterprise - DPA and zero data retention options
- **Recommended:** Pseudonymized data approach (student IDs only, no names)

## Cost & Deployment Considerations

### Current Setup (Claude API)
- **Cost:** ~£0.01-0.03 per query
- **For 100 staff with daily usage:** ~£200-500/month
- **Pros:** No infrastructure, instant deployment, best performance
- **Cons:** Data leaves premises (requires DPA for GDPR compliance)

### Self-Hosted Alternative (Llama)
- **Hardware:** NVIDIA A6000 (48GB) - ~£8,000 one-time
- **Running Costs:** Electricity + IT maintenance
- **Pros:** Complete data control, GDPR-friendly
- **Cons:** Slower responses, requires technical expertise

### Recommendation for Schools
**Phase 1:** Use pseudonymized data with Claude API (student IDs only)  
**Phase 2:** If successful, evaluate Azure OpenAI or self-hosted based on scale and budget

## Real-World Application

### Integration Into Existing School Systems

This proof-of-concept demonstrates integration patterns for:

1. **SQL Database Connection** - Replace mock JSON with real MS SQL queries
2. **Authentication** - Add role-based access (teachers see only their students)
3. **Multi-Tenancy** - Support multiple departments/year groups
4. **Audit Logging** - Track who accessed which student data (safeguarding requirement)

### Potential Impact

Based on the development process:

- **Time Saved:** 30-60 minutes per teacher per half-term on report analysis
- **Better Insights:** Identifies patterns humans miss (e.g., high effort/low grades)
- **Earlier Interventions:** Flags concerning trends before they become critical
- **Reduced Anxiety:** Removes "I should understand this data better" barrier

## Why This Approach Works

### 1. Meets Teachers Where They Are
- No new software to learn
- Conversational interface feels natural
- Answers actual questions teachers ask

### 2. Respects Time Constraints
- Sub-5-second responses
- No data preparation required
- One question replaces 20 minutes of Excel work

### 3. Lowers Technical Barriers
- No SQL knowledge needed
- No statistics background required
- Plain English in, actionable insights out

### 4. Scales to Existing Infrastructure
- Works with current data structures
- No MIS system replacement needed
- Can run on modest hardware or cloud

## Lessons for AI in Education

### What Worked
✅ **Start with real pain points** - Don't build AI for AI's sake  
✅ **Simplify ruthlessly** - One clear use case beats ten vague ones  
✅ **Preserve existing workflows** - Augment, don't replace  
✅ **Prioritize explainability** - Teachers need to trust the insights  
✅ **Make it fast** - If it's slower than Excel, it won't get used

### What Didn't Work
❌ Generic "ask anything" approach - too vague  
❌ Complex dashboard interfaces - teachers wanted simplicity  
❌ Technical terminology in responses - needed plain language  
❌ Assuming staff would learn new tools - adoption is hard

### Critical Success Factors
1. **Focus on outcomes, not features** - "Will this actually get used?"
2. **Data privacy from day one** - Non-negotiable in education
3. **Realistic cost modeling** - Schools have tight budgets
4. **Teacher-centric design** - Built for actual workflows

## 📁 Project Structure
```
college-chatbot-demo/
├── backend/
│   ├── data/
│   │   ├── interim_reports.json
│   │   └── student_interim_reports.json
│   ├── dataService.js           # Data query & analysis logic
│   ├── server.js                # Express API & Claude integration
│   ├── generate-mock-data.js    # Test data generator
│   └── .env                     # API keys (not committed)
│
├── chatbot-frontend/
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── chat/            # Main chat interface
│   │   │   ├── chat-chart/      # Chart rendering component
│   │   │   └── student-charts/  # Analytics dashboard
│   │   ├── services/
│   │   │   └── chat.service.ts  # API communication
│   │   ├── app.ts               # Root component
│   │   └── app.html             # Navigation shell
│   └── package.json
│
└── README.md
```

## 🎓 Future Enhancements

### Short Term
- [ ] Export analysis as PDF report
- [ ] Email scheduled insights (weekly digest)
- [ ] Multi-student comparison views
- [ ] Filter by subject/year group

### Medium Term
- [ ] Connect to real MS SQL database
- [ ] Add authentication & authorization
- [ ] Attendance correlation analysis
- [ ] Predictive alerts (early warning system)

### Long Term
- [ ] Integration with SIMS/Bromcom/other MIS systems
- [ ] Voice input for mobile use
- [ ] Parent-facing version (limited data access)
- [ ] Self-hosted LLM deployment option

## 🐛 Troubleshooting

### Backend won't start
- Check Node.js version: `node --version` (need 22.12+)
- Make sure `.env` file exists with valid API key
- Check if port 3000 is already in use

### Frontend shows errors
- Run `npm install` in the chatbot-frontend folder
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and run `npm install` again

### Chat stuck on "Thinking..."
- Check browser console for errors (F12 → Console tab)
- Verify backend is running and responding
- Ensure Anthropic API key has credits

### Charts not appearing
- Check browser console for Chart.js errors
- Verify chart data is being returned from backend
- Try refreshing the page

## 🔒 Security Notes

- **Never commit `.env` files** - They contain sensitive API keys
- **Never expose API keys in frontend code** - Always use a backend server
- **Use environment variables** - Keep secrets out of your codebase
- **The `.gitignore` file protects you** - But always double-check before pushing

## 💰 Cost Considerations

- Anthropic Claude API is pay-as-you-go
- This chatbot costs approximately **£0.01-0.03 per query**
- For a school with 100 staff using it daily: ~£200-500/month
- For this demo/learning project, costs are minimal (< £1 with free credits)

## 📚 Resources

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Angular Documentation](https://angular.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Chart.js Documentation](https://www.chartjs.org/)

## 📝 License

MIT License - Free to use and adapt for educational purposes.

## 🤝 Contributing

This is a proof-of-concept educational project. If you're a teacher or EdTech developer interested in similar tools:

1. Fork the repository
2. Adapt the data structure to your school's reporting system
3. Share insights from your implementation
4. Consider privacy implications in your context

---

**Key Question for Schools:** Where in your existing processes could AI save time without compromising quality or safety?

*"The best AI tools are the ones teachers don't realise they're using - they just think they have a really smart colleague."*
