function saveExpense() {
    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const notes = document.getElementById("notes").value;

    if (!title || !amount || !category || !date) {
        alert("Please fill all required fields");
        return;
    }

    const expense = {
        title,
        amount: Number(amount),
        category,
        date,
        notes
    };

    // 🔐 GET ALL USERS
let users = JSON.parse(localStorage.getItem("users")) || {};

// 👤 GET CURRENT LOGGED-IN USER
const currentUser = localStorage.getItem("currentUser");

// SAFETY CHECK
if (!currentUser || !users[currentUser]) {
    alert("User not logged in. Please login again.");
    window.location.href = "login.html";
    return;
}

// ➕ ADD EXPENSE TO THIS USER ONLY
users[currentUser].expenses.push(expense);

// 💾 SAVE BACK TO STORAGE
localStorage.setItem("users", JSON.stringify(users));

alert("Expense added successfully!");

    // Clear form
    document.querySelectorAll("input, textarea").forEach(el => el.value = "");
    document.getElementById("category").value = "";
}

