# College Chatbot Demo - AI Learning Project

An AI-powered chatbot built with Angular and Node.js, using the Anthropic Claude API. This project demonstrates how to integrate AI capabilities into a web application for educational purposes.

## 🎯 Project Overview

This is a learning project that creates a conversational AI chatbot interface. It was built to explore AI integration techniques and could eventually be expanded into an educational assistant for a sixth form college database system.

### What This Project Includes

- **Frontend**: Angular 19 application with a clean chat interface
- **Backend**: Node.js/Express server that securely handles API calls to Anthropic
- **AI Integration**: Uses Claude Sonnet 4 via the Anthropic API
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
- Separates concerns: Angular handles UI, Node.js handles API communication
- Scalable: Easy to add features like data persistence, user authentication, etc.

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

### 4. Run the Application

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

### 5. Use the Chatbot

Open your browser and go to `http://localhost:4200`

Type a message and chat with Claude! 🎉

## 📁 Project Structure
```
college-chatbot-demo/
├── backend/
│   ├── node_modules/
│   ├── .env                 # API keys (DO NOT COMMIT)
│   ├── .gitignore          # Protects sensitive files
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server & API routes
│
├── chatbot-frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── chat/   # Chat UI component
│   │   │   ├── services/
│   │   │   │   └── chat.service.ts  # API service
│   │   │   ├── app.ts      # Main app component
│   │   │   └── app.html    # Main app template
│   │   └── ...
│   ├── package.json        # Frontend dependencies
│   └── angular.json        # Angular configuration
│
└── README.md
```

## 🔑 Key Files Explained

### `backend/server.js`
- Express server that runs on port 3000
- Handles POST requests to `/api/chat`
- Communicates with Anthropic API using your API key
- Returns Claude's responses as JSON

### `chatbot-frontend/src/app/services/chat.service.ts`
- Angular service that makes HTTP requests to the backend
- Sends user messages and receives AI responses
- Handles the Observable pattern for async data

### `chatbot-frontend/src/app/components/chat/chat.ts`
- Main chat component logic
- Manages message state and user input
- Handles loading states and error handling

## 🛠️ Technologies Used

- **Angular 19**: Modern web framework for building the UI
- **Node.js & Express**: Backend server and API handling
- **Anthropic Claude API**: AI language model (Sonnet 4)
- **RxJS**: Reactive programming for handling async operations
- **TypeScript**: Type-safe JavaScript for both frontend and backend

## 💡 Learning Points

This project teaches:

1. **AI Integration**: How to use LLM APIs in web applications
2. **Full-Stack Development**: Frontend-backend communication
3. **API Security**: Protecting API keys using environment variables
4. **Async Programming**: Handling promises and observables
5. **Angular Fundamentals**: Components, services, HTTP client
6. **Node.js/Express**: Building REST APIs

## 🔒 Security Notes

- **Never commit `.env` files** - They contain sensitive API keys
- **Never expose API keys in frontend code** - Always use a backend server
- **Use environment variables** - Keep secrets out of your codebase
- **The `.gitignore` file protects you** - But always double-check before pushing

## 💰 Cost Considerations

- Anthropic Claude API is pay-as-you-go
- This chatbot costs approximately **$0.003-0.015 per message** (very cheap!)
- New accounts often get $5 free credits
- For this learning project, you'll likely spend less than $1 total

## 🎓 Next Steps & Extensions

Want to take this further? Here are some ideas:

1. **Add Message History**: Store conversations in a database
2. **User Authentication**: Add login functionality
3. **Context Management**: Give Claude context about your college/database
4. **Streaming Responses**: Show Claude typing in real-time
5. **Advanced Prompting**: Add system prompts to customize behavior
6. **Data Integration**: Connect to your college database for real queries
7. **Deployment**: Deploy to production (Heroku, Vercel, AWS, etc.)

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
- Check Network tab to see if API calls are completing
- Ensure Anthropic API key has credits

### CORS errors
- Make sure backend has `cors` middleware enabled
- Check that frontend is calling `http://localhost:3000`

## 📚 Resources

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Angular Documentation](https://angular.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)

## 📝 License

This is a learning project - feel free to use and modify as needed.

## 🤝 Contributing

This is a personal learning project, but suggestions and improvements are welcome!

## 👨‍💻 Author

Built as a learning project to explore AI integration in web applications.

---

**Happy Coding! 🚀**
