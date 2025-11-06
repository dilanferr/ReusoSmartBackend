const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", async () => {
  const email = document.getElementById("emailReset").value;
  const resetCode = document.getElementById("resetCode").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!email || !resetCode || !newPassword || !confirmPassword) {
    alert("❌ Completa todos los campos");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("❌ Las contraseñas no coinciden");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/users/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, resetCode, newPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      alert("✅ Contraseña actualizada, vuelve al login");
      window.location.href = "index.html";
    } else {
      alert(`❌ ${data.msg}`);
    }
  } catch (error) {
    alert("⚠️ No se pudo conectar al servidor");
    console.error(error);
  }
});
