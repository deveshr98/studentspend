let currentFilter = "month";
const API_BASE = "http://localhost:3000";

function getFilteredExpenses(filter) {
    // 🔐 GET ALL USERS
const users = JSON.parse(localStorage.getItem("users")) || {};

// 👤 GET CURRENT LOGGED-IN USER
const currentUser = localStorage.getItem("currentUser");

// SAFETY CHECK
if (!currentUser || !users[currentUser]) {
    alert("User not logged in. Please login again.");
    window.location.href = "index.html";
}

// 📊 GET ONLY THIS USER'S EXPENSES
const expenses = users[currentUser].expenses || [];

    const today = new Date();

    return expenses.filter(exp => {
        const expDate = new Date(exp.date);

        if (filter === "week") {
            const diffTime = today - expDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        }

        if (filter === "month") {
            return (
                expDate.getMonth() === today.getMonth() &&
                expDate.getFullYear() === today.getFullYear()
            );
        }

        if (filter === "year") {
            return expDate.getFullYear() === today.getFullYear();
        }

        return true;
    });
}

function loadExpenses() {
    const container = document.getElementById("expenseContainer");
    container.innerHTML = "";

    const expenses = getFilteredExpenses(currentFilter);
    let total = 0;

    if (expenses.length === 0) {
        container.innerHTML = "<li>No expenses found for this period.</li>";
        document.getElementById("totalAmount").innerText = "₹0";
        return;
    }

    expenses.forEach(exp => {
        total += exp.amount;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${exp.title} (${exp.category})</span>
            <span>₹${exp.amount}</span>
        `;
        container.appendChild(li);
    });

    document.getElementById("totalAmount").innerText = `₹${total}`;
    updateAIInsights(expenses);

}

function changeReport(type) {
  currentFilter = type;

  document.querySelectorAll(".report-filter button")
    .forEach(btn => btn.classList.remove("active"));

  event.target.classList.add("active");

  // 🔥 CLEAR UI (new AI will load or cache will change)
  document.getElementById("nextStepText").innerText = "Loading AI insight...";
  document.getElementById("mistakeText").innerText = "Loading AI insight...";
  document.getElementById("attentionText").innerText = "Loading AI insight...";

  updateReportText(type);
  loadExpenses();
}


function updateReportText(type) {
    const reportTitle = document.getElementById("reportTitle");
    const nextStepTitle = document.getElementById("nextStepTitle");

    if (!reportTitle || !nextStepTitle) return;

    if (type === "week") {
        reportTitle.textContent = "Weekly Expense Summary";
        nextStepTitle.textContent = "📌 What should I do next week?";
    }

    if (type === "month") {
        reportTitle.textContent = "Monthly Expense Summary";
        nextStepTitle.textContent = "📌 What should I do next month?";
    }

    if (type === "year") {
        reportTitle.textContent = "Yearly Expense Summary";
        nextStepTitle.textContent = "📌 What should I do next year?";
    }
}

function prepareGeminiPrompt(expenses, filterType) {
    let timeText = "this month";
    if (filterType === "week") timeText = "this week";
    if (filterType === "year") timeText = "this year";

    let expenseText = expenses
        .map(e => `Date: ${e.date}, Category: ${e.category}, Amount: ₹${e.amount}`)
        .join("\n");

    return `
You are a smart personal finance coach for a student.

Here are my expenses for ${timeText}:
${expenseText}

Based on this data, answer clearly in 3 short sections:

1) What should I do next ${timeText}?
2) What mistakes am I making in spending?
3) Where should I pay more attention financially?

Keep answers short, practical, and student-friendly.
`;
}

function parseAIResponse(aiText) {
  let next = "No suggestion available.";
  let mistakes = "No mistakes identified.";
  let attention = "No priority identified.";

  const nextMatch = aiText.match(/NEXT:\s*([\s\S]*?)\n(MISTAKES:|$)/);
  const mistakeMatch = aiText.match(/MISTAKES:\s*([\s\S]*?)\n(ATTENTION:|$)/);
  const attentionMatch = aiText.match(/ATTENTION:\s*([\s\S]*)/);

  if (nextMatch) next = nextMatch[1].trim();
  if (mistakeMatch) mistakes = mistakeMatch[1].trim();
  if (attentionMatch) attention = attentionMatch[1].trim();

  return { next, mistakes, attention };
}


async function updateAIInsights(filteredExpenses) {
  const currentUser = localStorage.getItem("currentUser");
  const cacheKey = `ai_${currentUser}_${currentFilter}`;

  // 🧠 STEP 1: CACHE CHECK
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { next, mistakes, attention } = JSON.parse(cached);

    document.getElementById("nextStepText").innerText = next;
    document.getElementById("mistakeText").innerText = mistakes;
    document.getElementById("attentionText").innerText = attention;

    return; // ❌ Gemini call nahi hogi
  }

  // ⏳ UI loading state
  document.getElementById("nextStepText").innerText = "AI is analyzing...";
  document.getElementById("mistakeText").innerText = "AI is analyzing...";
  document.getElementById("attentionText").innerText = "AI is analyzing...";

  try {
    const prompt = prepareGeminiPrompt(filteredExpenses, currentFilter);

    const res = await fetch(`${API_BASE}/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    const aiText = data.text;

    const parsed = parseAIResponse(aiText);

    // 💾 SAVE TO CACHE
    localStorage.setItem(cacheKey, JSON.stringify(parsed));

    document.getElementById("nextStepText").innerText = parsed.next;
    document.getElementById("mistakeText").innerText = parsed.mistakes;
    document.getElementById("attentionText").innerText = parsed.attention;

  } catch (err) {
    console.error("AI error:", err);

    document.getElementById("nextStepText").innerText =
      "AI temporarily unavailable.";
    document.getElementById("mistakeText").innerText = "—";
    document.getElementById("attentionText").innerText = "—";
  }
}

document.getElementById("generateAIBtn").addEventListener("click", () => {
    const expenses = getFilteredExpenses(currentFilter);
    updateAIInsights(expenses);
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generateAIBtn");

  btn.addEventListener("click", async () => {
    const expenses = getFilteredExpenses(currentFilter);

    // 🔒 Disable button to prevent spam
    btn.disabled = true;
    btn.innerText = "Generating...";

    // ⏳ Show loading text
    document.getElementById("nextStepText").innerText = "Generating AI insights...";
    document.getElementById("mistakeText").innerText = "Generating AI insights...";
    document.getElementById("attentionText").innerText = "Generating AI insights...";

    document.getElementById("nextStepText").classList.add("loading-text");
    document.getElementById("mistakeText").classList.add("loading-text");
    document.getElementById("attentionText").classList.add("loading-text");

    // 🕐 Artificial delay for UX smoothness (1 second)
    setTimeout(async () => {
      await updateAIInsights(expenses);

      // ✅ Re-enable button
      btn.disabled = false;
      btn.innerText = "Generate AI Insights";

      document.getElementById("nextStepText").classList.remove("loading-text");
      document.getElementById("mistakeText").classList.remove("loading-text");
      document.getElementById("attentionText").classList.remove("loading-text");
    }, 1000);
  });
});




// 🔥 DEFAULT LOAD = THIS MONTH
loadExpenses();
