const dotenv = require('dotenv');

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testIconGenerate() {
    const systemPrompt = `You are an expert SVG icon designer and vector artist.`;
    const prompt = "a star";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Design this icon: ${prompt}` }
                ],
                temperature: 0.3,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Groq API Error:", response.status, errBody);
        } else {
            console.log("Success:", await response.json());
        }
    } catch (err) {
        console.error("Fetch failed", err);
    }
}

testIconGenerate();
