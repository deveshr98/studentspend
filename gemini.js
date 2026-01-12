const GEMINI_API_KEY = "AIzaSyCwaeytsTu8SvBkVuyef7NLWzGgA436IV0";

async function getGeminiInsight(promptText) {
    try {
        const response = await fetch("http://localhost:3000/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: promptText })
        });

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error(error);
        return "AI service unavailable.";
    }
}
