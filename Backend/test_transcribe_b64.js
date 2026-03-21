const fs = require('fs');

async function testBase64Transcribe() {
  try {
    // Generate 1-second silent PCM encoded as WAV or just random bytes to see if Groq rejects the format vs rate limits.
    // Actually, let's just create a tiny empty webm file representation (or use a valid base64 audio string).
    // A valid tiny base64 1px gif or something won't work for audio. Let's send random buffer.
        
    const dummyAudio = Buffer.alloc(4096, 0);
    const audioBase64 = dummyAudio.toString('base64');

    const res = await fetch('http://localhost:3001/voice-assistant/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64,
        mimeType: 'audio/webm',
        language: 'en'
      })
    });

    const body = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", body);
  } catch (err) {
    console.error(err);
  }
}

testBase64Transcribe();
