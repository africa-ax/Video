const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  try {
    // Handle both GET and POST
    let topic = 'Motivation';
    
    if (req.method === 'POST') {
      if (req.body && req.body.topic) {
        topic = req.body.topic;
      }
    } else {
      // GET request
      topic = req.query.topic || 'Motivation';
    }
    
    // Gemini setup
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // Test Gemini
    const result = await model.generateContent(`Create a short video script about: ${topic}`);
    const text = result.response.text();
    
    res.status(200).json({ 
      success: true, 
      message: text,
      topic: topic,
      note: "Video generation ready!"
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
};
