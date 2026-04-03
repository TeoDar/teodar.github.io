let activeTabId = null;

const editor = document.getElementById("editor");
const tabsContainer = document.getElementById("tabs");

// --- helpers ---
const getTab = (id) => tabsContainer.querySelector(`.tab[data-id="${id}"]`);
const getContent = (id) => document.getElementById(id);
const getFile = (id) =>
  Array.from(document.querySelectorAll(".file")).find((f) =>
    f.textContent.trim().startsWith(id),
  );

// --- open file ---
async function openFile(event) {
  const fileName = event.currentTarget.textContent.trim();
  const id = fileName.split(".")[0];

  if (id === activeTabId) return;

  if (!getTab(id)) {
    await createTab(id, fileName);
  }

  activateTab(id);
}

// --- create tab ---
async function createTab(id, label) {
  // удаляем предыдущую вкладку (т.к. одна активная)
  if (activeTabId) closeTab(null, activeTabId);

  const tab = document.createElement("div");
  tab.className = "tab";
  tab.dataset.id = id;
  tab.innerHTML = `
    ${label}
    <span class="close" onclick="closeTab(event, '${id}')">✕</span>
  `;
  tab.onclick = () => activateTab(id);

  tabsContainer.appendChild(tab);

  const container = document.createElement("div");
  container.className = "content";
  container.id = id;

  container.innerHTML = await loadContent(id);

  editor.appendChild(container);
}

// --- load content ---
async function loadContent(id) {
  try {
    const res = await fetch(`src/content/${id}.md`);
    const md = await res.text();

    try {
      return marked.parse(md);
    } catch {
      return `<pre>${md}</pre>`;
    }
  } catch {
    return `<p>Файл не найден 💀</p>`;
  }
}

// --- activate ---
function activateTab(id) {
  document
    .querySelectorAll(".file")
    .forEach((f) => f.classList.remove("active"));
  document
    .querySelectorAll(".content")
    .forEach((c) => c.classList.remove("active"));

  const content = document.getElementById(id);
  if (content) content.classList.add("active");

  const file = Array.from(document.querySelectorAll(".file")).find((f) =>
    f.textContent.trim().startsWith(id),
  );
  if (file) file.classList.add("active");

  activeTabId = id;
}

// --- close ---
function closeTab(event, id) {
  event?.stopPropagation();

  getTab(id)?.remove();
  getContent(id)?.remove();

  if (activeTabId === id) {
    activeTabId = null;
  }
}

// --- popup ---
function showPopup(event) {
  const popup = document.getElementById("popup");
  popup.textContent = `${event.currentTarget.title} in development`;
  popup.style.display = "block";

  clearTimeout(popup.hideTimeout);
  popup.hideTimeout = setTimeout(() => {
    popup.style.display = "none";
  }, 1500);
}

// --- lightbox ---
function openLightbox(img) {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  lbImg.src = img.src;
  lb.style.display = "flex";
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

// --- init ---
openFile({ currentTarget: { textContent: "resume.md" } });
