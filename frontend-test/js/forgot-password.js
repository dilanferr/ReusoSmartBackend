document.getElementById("sendTempBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("emailForgot").value;

  const res = await fetch("http://localhost:5000/api/users/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Código temporal enviado al correo. Revisa tu bandeja.");
    console.log("Código enviado:", data); // Para pruebas
  } else {
    alert(data.msg || "Error al enviar código temporal");
  }
});
