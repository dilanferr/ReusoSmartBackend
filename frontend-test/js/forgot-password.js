const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", async () => {
  const email = document.getElementById("emailForgot").value;
  if (!email) {
    alert("❌ Ingresa un correo");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/users/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (res.ok) {
      alert("✅ Código enviado al correo");
      window.location.href = `reset-password.html?email=${encodeURIComponent(email)}`;
    } else {
      alert(`❌ ${data.msg}`);
    }
  } catch (error) {
    alert("⚠️ No se pudo conectar al servidor");
    console.error(error);
  }
});
