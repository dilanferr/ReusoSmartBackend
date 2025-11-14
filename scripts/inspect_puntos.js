import http from "http";

function run() {
  const req = http.get("http://localhost:5000/api/puntos", (res) => {
    let body = "";
    res.on("data", (d) => (body += d));
    res.on("end", () => {
      try {
        const arr = JSON.parse(body);
        console.log("total", arr.length);
        const last = arr[arr.length - 1];
        console.log("keys", Object.keys(last || {}));
        console.log("estado", last && last.estado, typeof (last && last.estado));
        console.log("id", last && last.id, typeof (last && last.id));
        console.log("last json", JSON.stringify(last));
      } catch (e) {
        console.log(body);
      }
    });
  });
  req.on("error", (err) => console.error("ERROR", err.message));
}

run();