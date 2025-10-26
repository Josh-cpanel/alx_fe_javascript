// --- Quotes Array ---
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuote");
const exportBtn = document.getElementById("exportQuotes");
const importInput = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");
const syncBtn = document.getElementById("syncQuotes");
const notification = document.getElementById("notification");

// Initialize
window.onload = () => {
  populateCategories();
  restoreFilterPreference();
  showRandomQuote();
};

// --- Helper: Save Quotes to Local Storage ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// --- Helper: Show Notifications ---
function showNotification(message, duration = 4000) {
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, duration);
}

// --- Populate Categories ---
function populateCategories() {
  categoryFilter.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilter.appendChild(allOption);

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

// --- Display Random Quote ---
function showRandomQuote() {
  const filter = categoryFilter.value;
  const filteredQuotes = filter === "all" ? quotes : quotes.filter(q => q.category === filter);
  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "No quotes available for this category.";
    quoteDisplay.appendChild(msg);
    return;
  }

  const random = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${random.text}"`;
  const quoteCat = document.createElement("p");
  quoteCat.textContent = `— ${random.category}`;
  quoteCat.style.fontStyle = "italic";

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCat);
}

// --- Add New Quote ---
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    showNotification("New quote added locally!");
  } else {
    alert("Please fill out both fields.");
  }
}

// --- Export Quotes to JSON ---
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Import from JSON ---
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = e => {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    showNotification("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Filter Quotes ---
function filterQuotes() {
  localStorage.setItem("lastSelectedCategory", categoryFilter.value);
  showRandomQuote();
}

function restoreFilterPreference() {
  const saved = localStorage.getItem("lastSelectedCategory");
  if (saved) categoryFilter.value = saved;
}

// --- Simulated Server Sync ---
async function syncWithServer() {
  showNotification("Syncing with server...");

  try {
    // Simulate fetching server data
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();

    // Convert fake server posts to quote format
    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: server data takes precedence
    const localTexts = new Set(quotes.map(q => q.text));
    const newFromServer = serverQuotes.filter(q => !localTexts.has(q.text));

    if (newFromServer.length > 0) {
      quotes.push(...newFromServer);
      saveQuotes();
      populateCategories();
      showNotification("Sync complete: new server quotes added!");
    } else {
      showNotification("No new quotes from server.");
    }

  } catch (error) {
    console.error("Sync error:", error);
    showNotification("Error syncing with server. Try again later.");
  }
}

// --- Event Listeners ---
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);
importInput.addEventListener("change", importFromJsonFile);
syncBtn.addEventListener("click", syncWithServer);

// Simulated server URL using JSONPlaceholder (mock API)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch quotes from server (simulated)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Simulate extracting quotes from the mock API
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      author: `User ${post.userId}`,
      category: "Server"
    }));

    console.log("Fetched quotes from server:", serverQuotes);

    // Resolve conflicts and merge with local storage
    resolveConflicts(serverQuotes);
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
  }
}

// Conflict resolution strategy: server data takes precedence
function resolveConflicts(serverQuotes) {
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

  // Basic merge logic — overwrite duplicates, keep unique ones
  const mergedQuotes = [...serverQuotes];
  localQuotes.forEach(localQuote => {
    const duplicate = serverQuotes.find(
      q => q.text.toLowerCase() === localQuote.text.toLowerCase()
    );
    if (!duplicate) mergedQuotes.push(localQuote);
  });

  // Save the merged result
  localStorage.setItem("quotes", JSON.stringify(mergedQuotes));

  // Update the display
  quotes = mergedQuotes;
  displayQuotes();

  // Notify user
  alert("Quotes synced with server successfully!");
}

// Periodically fetch new data from server (e.g., every 60 seconds)
setInterval(fetchQuotesFromServer, 60000);
