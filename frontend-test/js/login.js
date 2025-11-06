const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    alert("❌ Completa todos los campos");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      alert(`✅ Bienvenido ${data.usuario.nombre}`);
    } else {
      alert(`❌ ${data.msg}`);
    }
  } catch (error) {
    alert("⚠️ No se pudo conectar al servidor");
    console.error(error);
  }
});

const profileBtn = document.getElementById("profileBtn");
const profileResult = document.getElementById("profileResult");

profileBtn.addEventListener("click", async () => {
  try {
    const token = prompt("Ingresa tu token JWT:");
    const res = await fetch("http://localhost:5000/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (res.ok) {
      profileResult.textContent = JSON.stringify(data, null, 2);
    } else {
      alert(`❌ ${data.msg}`);
    }
  } catch (error) {
    alert("⚠️ Error al obtener profile");
    console.error(error);
  }
});
