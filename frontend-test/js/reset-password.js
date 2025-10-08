document.getElementById("resetBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("emailReset").value;
  const resetCode = document.getElementById("resetCode").value;
  const newPassword = document.getElementById("newPassword").value;

  const res = await fetch("http://localhost:5000/api/users/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, resetCode, newPassword })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Contraseña actualizada con éxito");
  } else {
    alert(data.msg || "Error al restablecer contraseña");
  }
});
