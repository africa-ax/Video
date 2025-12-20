const { GoogleGenerativeAI } = require("@google/generative-ai");
const { execSync } = require('child_process');
const fs = require('fs');

module.exports = async (req, res) => {
  try {
    // 1. Get topic from request
    const { topic = 'Motivation' } = req.body;
    
    // 2. Setup Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // 3. Generate video script
    const prompt = `Create text for 3 slides about ${topic}. Each slide: Text|3`;
    const result = await model.generateContent(prompt);
    const script = result.response.text().split('\n').slice(0, 3);
    
    // 4. Create video with FFmpeg
    let ffmpegCmd = 'ffmpeg ';
    
    script.forEach((line, i) => {
      const [text, duration] = line.split('|');
      ffmpegCmd += `-f lavfi -i color=c=blue:s=1080x1920:d=${duration} `;
      ffmpegCmd += `-vf "drawtext=text='${text}':fontcolor=white:fontsize=70:x=(w-text_w)/2:y=(h-text_h)/2" `;
      ffmpegCmd += `-t ${duration} /tmp/slide${i}.mp4 `;
    });
    
    // Combine slides
    ffmpegCmd += `&& ffmpeg -i "concat:/tmp/slide0.mp4|/tmp/slide1.mp4|/tmp/slide2.mp4" -c copy /tmp/output.mp4`;
    
    execSync(ffmpegCmd);
    
    // 5. Return video
    const video = fs.readFileSync('/tmp/output.mp4');
    res.setHeader('Content-Type', 'video/mp4');
    res.send(video);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
