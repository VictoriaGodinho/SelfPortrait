// CONFIG
const REDIRECT_AFTER_MS = 20000; // 20 seconds
const CLICK_COST = 3.0;

// Clear old state
localStorage.removeItem('clickedAds');
localStorage.removeItem('viewedAds');

// Timer countdown
const timerEl = document.getElementById('timer');
let secs = Math.floor(REDIRECT_AFTER_MS / 1000);
const tick = setInterval(() => {
  secs--;
  if (timerEl) timerEl.textContent = String(secs);
  if (secs <= 0) clearInterval(tick);
}, 1000);

// Build ads dynamically
fetch("ads.json")
  .then(res => res.json())
  .then(data => {
    const container = document.querySelector(".ads-container");

    // Save "viewed ads"
    localStorage.setItem("viewedAds", JSON.stringify(data.map(a => a.title)));

    data.forEach(ad => {
      const adDiv = document.createElement("div");
      adDiv.classList.add("ad");

      adDiv.innerHTML = `
        <div class="badge">Sponsored</div>
        <img src="${ad.image}" alt="${ad.title}">
        <div class="meta">
          <div class="title">${ad.title}</div>
          <a class="open" href="${ad.link}" target="_blank" rel="noopener noreferrer">Details</a>
        </div>
      `;

      // Function to record the click into localStorage
      const recordClick = () => {
        let clickedAds = JSON.parse(localStorage.getItem("clickedAds")) || [];
        if (!clickedAds.find(c => c.title === ad.title)) {
          clickedAds.push({ title: ad.title, link: ad.link, clickCost: CLICK_COST });
          localStorage.setItem("clickedAds", JSON.stringify(clickedAds));
        }
      };

      // Click anywhere on the card (except the link) → save to receipt only
      adDiv.addEventListener("click", (e) => {
        if (e.target.classList.contains("open")) return; // skip if they clicked the Details link
        recordClick();
        adDiv.classList.add("clicked");
        adDiv.style.transform = "scale(1.1)";
        setTimeout(() => { adDiv.style.transform = ""; }, 200);
      });

      // Click the Details button → open link + save to receipt
      const detailsBtn = adDiv.querySelector(".open");
      detailsBtn.addEventListener("click", () => {
        recordClick();
      });

      container.appendChild(adDiv);
    });
  })
  .catch(err => console.error("Error loading ads:", err));

// Redirect after N seconds
setTimeout(() => {
  window.location.href = "loading.html";
}, REDIRECT_AFTER_MS);

// --- Auto-scroll helper ---
let autoScroll = setInterval(() => {
  window.scrollBy({ top: 1, behavior: "smooth" });
}, 50);

window.addEventListener("wheel", () => clearInterval(autoScroll), { once: true });
window.addEventListener("touchmove", () => clearInterval(autoScroll), { once: true });
