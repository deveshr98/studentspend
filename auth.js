function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");

    if (!email || !password) {
        errorMsg.innerText = "Please fill all fields";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || {};

    // 🆕 NEW USER → CREATE ACCOUNT
    if (!users[email]) {
        users[email] = {
            password: password,
            expenses: []
        };

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", email);
        localStorage.setItem("isLoggedIn", "true");

        window.location.href = "index.html";
        return;
    }

    // 👤 EXISTING USER → CHECK PASSWORD
    if (users[email].password !== password) {
        errorMsg.innerText = "Wrong password";
        return;
    }

    // ✅ SUCCESS LOGIN
    localStorage.setItem("currentUser", email);
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "index.html";
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");

    window.location.href = "index.html";
}


function isValidEmail(email) {
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function checkAuth() {
    if (!localStorage.getItem("isLoggedIn")) {
        window.location.href = "login.html";
    }
}

function updateHomeUI() {
    const loginCard = document.getElementById("homeLoginCard");
    const loggedIn = localStorage.getItem("isLoggedIn");

    if (!loginCard) return;

    if (loggedIn) {
        loginCard.style.display = "none";
    } else {
        loginCard.style.display = "block";
    }
}



function homeLogin() {
    
    const email = document.getElementById("homeEmail").value.trim();
    const password = document.getElementById("homePassword").value;
    
    if (!email || !password) {
    alert("Please fill all fields");
    return;
}

if (!isValidEmail(email)) {
    alert("Please enter a valid email address");
    return;
}


    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (!users[email]) {
        users[email] = {
            password: password,
            expenses: []
        };
    } else if (users[email].password !== password) {
        alert("Wrong password");
        return;
    }
    alert(`You are now logged in as ${email}`);


    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", email);
    localStorage.setItem("isLoggedIn", "true");

    updateHomeUI();
    location.reload();
}
function updateAuthNav() {
    const authNav = document.getElementById("authNav");
    const loggedIn = localStorage.getItem("isLoggedIn");

    if (!authNav) return;

    if (loggedIn) {
        authNav.textContent = "Logout";
        authNav.onclick = logout;
    } else {
        authNav.textContent = "Login";
        authNav.onclick = handleAuthNav;
    }
}

function handleAuthNav() {
    window.location.href = "login.html";
}

function openProtectedPage(page) {
    const loggedIn = localStorage.getItem("isLoggedIn");

    if (!loggedIn) {
        alert("You're not logged in. Please login first.");
        return; // stay on home page
    }

    window.location.href = page;
}
