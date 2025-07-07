// switch
const themeToggle = document.getElementById("themeToggle");
let isLight = true; 

themeToggle.addEventListener("click", () => {
  isLight = !isLight; 

  if (isLight) {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
  }
});

