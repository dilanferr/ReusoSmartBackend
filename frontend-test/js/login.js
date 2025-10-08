let token = ""; // Guardaremos JWT

// -----------------
// LOGIN
// -----------------
document.getElementById("loginBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    token = data.token;
    alert("Login exitoso!");
    console.log("Usuario:", data.usuario);
  } else {
    alert(data.msg || "Error en login");
  }
});

// -----------------
// PROFILE
// -----------------
document.getElementById("profileBtn")?.addEventListener("click", async () => {
  if (!token) {
    alert("Primero haz login");
    return;
  }

  const res = await fetch("http://localhost:5000/api/users/profile", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();
  document.getElementById("profileResult").textContent = JSON.stringify(data, null, 2);
});
