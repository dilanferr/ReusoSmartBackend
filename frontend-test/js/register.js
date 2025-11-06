const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", async () => {
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!nombre || !email || !password || !confirmPassword) {
    alert("❌ Completa todos los campos");
    return;
  }

  if (password !== confirmPassword) {
    alert("❌ Las contraseñas no coinciden");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      alert("✅ Registro exitoso, vuelve al login");
      window.location.href = "index.html";
    } else {
      alert(`❌ ${data.msg}`);
    }
  } catch (error) {
    alert("⚠️ No se pudo conectar al servidor");
    console.error(error);
  }
});
