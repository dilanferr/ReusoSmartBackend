document.getElementById("registerBtn")?.addEventListener("click", async () => {
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch("http://localhost:5000/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Usuario registrado exitosamente");
  } else {
    alert(data.msg || "Error al registrar usuario");
  }
});
