async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        document.getElementById("error").innerText =
            "Please enter username and password";
        return;
    }

    try {

        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = "/index.html";
        } else {
            document.getElementById("error").innerText =
                data.error || "Invalid username or password";
        }

    } catch (error) {
        document.getElementById("error").innerText =
            "Server error. Please try again.";
    }
}