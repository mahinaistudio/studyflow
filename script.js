const WORKER = "https://studyflow.team-gaming3436.workers.dev";

let token = null;

async function login() {
  const password = document.getElementById("pass").value;

  const res = await fetch(WORKER + "/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  const data = await res.json();

  if (data.success) {
    token = data.token;
    localStorage.setItem("token", token);

    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";

    load();
  } else {
    alert("Wrong password");
  }
}

async function load() {
  const res = await fetch(WORKER + "/api/list", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  const box = document.getElementById("files");
  box.innerHTML = "";

  data.files.forEach(f => {
    const div = document.createElement("div");
    div.className = "file";
    div.innerText = f.name;

    const del = document.createElement("button");
    del.innerText = "Delete";
    del.onclick = async () => {
      await fetch(WORKER + "/api/delete?id=" + f.id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
      load();
    };

    div.appendChild(del);
    box.appendChild(div);
  });
}

async function upload() {
  const file = document.getElementById("file").files[0];

  const form = new FormData();
  form.append("file", file);

  await fetch(WORKER + "/api/upload", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: form
  });

  load();
}