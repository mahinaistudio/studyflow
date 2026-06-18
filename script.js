const WORKER_URL = "https://studyflow.team-gaming3436.workers.dev";

let token = localStorage.getItem("sf_token");

// -------------------------
// INIT
// -------------------------
window.onload = () => {
  if (token) {
    showApp();
    loadFiles();
  } else {
    showLogin();
  }

  document.getElementById("loginBtn").onclick = login;
  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("refreshBtn").onclick = loadFiles;
  document.getElementById("uploadBtn").onclick = uploadFile;
  document.getElementById("newFolderBtn").onclick = createFolder;
  document.getElementById("searchInput").oninput = loadFiles;
};

// -------------------------
function showLogin() {
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("app").style.display = "none";
}

function showApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("app").style.display = "block";
}

// -------------------------
// LOGIN
// -------------------------
async function login() {
  const password = document.getElementById("passwordInput").value;

  const res = await fetch(`${WORKER_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  const data = await res.json();

  if (!data.success) {
    document.getElementById("loginError").innerText = data.message;
    return;
  }

  token = data.token;
  localStorage.setItem("sf_token", token);

  showApp();
  loadFiles();
}

// -------------------------
// LOGOUT
// -------------------------
function logout() {
  localStorage.removeItem("sf_token");
  token = null;
  showLogin();
}

// -------------------------
// AUTH HEADER
// -------------------------
function authHeader() {
  return {
    Authorization: `Bearer ${token}`
  };
}

// -------------------------
// LOAD FILES
// -------------------------
async function loadFiles() {
  const container = document.getElementById("fileContainer");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(`${WORKER_URL}/api/list`, {
      headers: authHeader()
    });

    const data = await res.json();

    if (!data.success) {
      container.innerHTML = "Failed to load files.";
      return;
    }

    renderFiles(data.files);
  } catch (err) {
    container.innerHTML = "Connection error.";
  }
}

// -------------------------
// RENDER FILES
// -------------------------
function renderFiles(files) {
  const container = document.getElementById("fileContainer");
  container.innerHTML = "";

  if (!files || files.length === 0) {
    container.innerHTML = "No files found.";
    return;
  }

  files.forEach(file => {
    const div = document.createElement("div");
    div.className = "file-card";

    div.innerHTML = `
      <div class="file-icon">📄</div>
      <div class="file-name">${file.name}</div>
      <div class="file-meta">${file.mimeType}</div>

      <div class="file-actions">
        <button onclick="downloadFile('${file.id}')">Download</button>
        <button class="delete" onclick="deleteFile('${file.id}')">Delete</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// -------------------------
// UPLOAD
// -------------------------
async function uploadFile() {
  const fileInput = document.getElementById("filePicker");
  const file = fileInput.files[0];

  if (!file) return alert("Select a file first");

  const form = new FormData();
  form.append("file", file);

  await fetch(`${WORKER_URL}/api/upload`, {
    method: "POST",
    headers: authHeader(),
    body: form
  });

  fileInput.value = "";
  loadFiles();
}

// -------------------------
// DELETE
// -------------------------
async function deleteFile(id) {
  await fetch(`${WORKER_URL}/api/delete?id=${id}`, {
    method: "DELETE",
    headers: authHeader()
  });

  loadFiles();
}

// -------------------------
// DOWNLOAD (simple direct link workaround)
// -------------------------
function downloadFile(id) {
  window.open(
    `https://drive.google.com/file/d/${id}/view`,
    "_blank"
  );
}

// -------------------------
// CREATE FOLDER (optional placeholder)
// -------------------------
async function createFolder() {
  const name = prompt("Folder name:");
  if (!name) return;

  await fetch(`${WORKER_URL}/api/folder`, {
    method: "POST",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });

  loadFiles();
}