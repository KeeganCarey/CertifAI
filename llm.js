class LLM_Api {
    async getResponse(prompt) {
        const API_KEY = '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'; // See security note below
  
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo', // or 'gpt-4o', 'gpt-3.5-turbo', etc.
            messages: [
            { role: 'user', content: prompt }
            ],
            max_tokens: 1000
        })
        });

        const data = await response.json();
        
        if (data.error) {
        console.error('OpenAI API Error:', data.error);
        return null;
        }
        
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('Request failed:', error);
        return null;
    }
    }

}