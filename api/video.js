// api/video.js - DeepSeek API Version

export default async function handler(req, res) {
  // Set CORS headers for browser requests (optional but good practice)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // 1. Get the topic from the request
    let topic = 'Motivation'; // Default
    if (req.method === 'POST' && req.body && req.body.topic) {
      topic = req.body.topic;
    } else if (req.method === 'GET' && req.query.topic) {
      topic = req.query.topic;
    }

    // 2. Define the prompt for DeepSeek
    const prompt = `You are a creative video script assistant. Generate a concise, engaging script for a 15-second social media video (like an Instagram Reel or TikTok) about "${topic}". 
    Format the response as a simple JSON object with this structure: 
    { 
      "videoTitle": "A catchy title",
      "script": "The full spoken or on-screen text for the 15-second video.",
      "hashtags": "#motivation #success #mindset"
    }
    Make the script energetic and suitable for a fast-paced short video.`;

    // 3. Call the DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // Use the correct model name
        messages: [
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    });

    // 4. Check if the DeepSeek API call was successful
    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} - ${errorText}`);
    }

    // 5. Parse the response and send it back
    const deepseekData = await deepseekResponse.json();
    const aiMessage = deepseekData.choices[0]?.message?.content;

    // Try to parse the AI's response as JSON, fallback to text if it fails
    let finalResponse;
    try {
      finalResponse = JSON.parse(aiMessage);
    } catch {
      finalResponse = { 
        message: aiMessage,
        note: "The AI's response was not valid JSON, returning as text."
      };
    }

    res.status(200).json({
      success: true,
      topic: topic,
      data: finalResponse
    });

  } catch (error) {
    console.error('Video API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unknown error occurred while generating the video script.'
    });
  }
  }
