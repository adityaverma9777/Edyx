const FormData = require('form-data');

async function testTranscribe() {
  try {
    const form = new FormData();
    const fakeAudio = Buffer.alloc(1024, 0); 
    form.append('audio', fakeAudio, {
      filename: 'fake.webm',
      contentType: 'audio/webm',
    });
    form.append('language', 'en');

    // Use native fetch available in Node >= 18
    const res = await fetch('http://localhost:3001/voice-assistant/transcribe', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const body = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", body);
  } catch (err) {
    console.error(err);
  }
}

testTranscribe();
