document.getElementById("minigame-close").onclick = closeMinigame;

document.getElementById("minigame-overlay").addEventListener("click", (e) => {
  if (e.target.id === "minigame-overlay") closeMinigame();
});

renderAll();
setInterval(renderAll, 1000);
