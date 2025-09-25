// assets/js/header.js
function initHeader() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.getElementById("closeSidebar");

  if (!menuToggle || !sidebar || !closeSidebar) {
    console.warn("Header elements not found yet.");
    return;
  }

  menuToggle.addEventListener("click", () => {
    sidebar.classList.add("active");
  });

  closeSidebar.addEventListener("click", () => {
    sidebar.classList.remove("active");
  });
}
