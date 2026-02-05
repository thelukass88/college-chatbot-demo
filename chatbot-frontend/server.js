// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
      console.log('Received message:', req.body.message);
      const { message } = req.body;
  
      console.log('Calling Anthropic API...');
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      });
  
      console.log('Got response:', response.content[0].text);
      
      res.json({
        reply: response.content[0].text,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to get response from AI' });
    }
  });