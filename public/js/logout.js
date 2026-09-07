const logoutBtn = document.getElementById("logout-btn");

// Show logout button only if logged in
if (localStorage.getItem("token")) {
  logoutBtn.style.display = "inline-block";
}

logoutBtn.addEventListener("click", () => {
  // Remove token
  localStorage.removeItem("token");

  // Reset UI
  document.getElementById("login-box").style.display = "block";
  document.getElementById("nav-area").style.display = "none";

  alert("Logged out");

  // Reload home page
  window.location.href = "/";
});