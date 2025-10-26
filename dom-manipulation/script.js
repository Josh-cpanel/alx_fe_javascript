// script.js
// Dynamic Quote Generator with localStorage/sessionStorage and JSON import/export
// ---------------------------------------------------------------------------

// Local storage key
const LS_KEY = "quotes_v1";
const SESSION_KEY = "lastViewedQuote";

// Default quotes (used if nothing in localStorage)
const defaultQuotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It always seems impossible until it’s done.", category: "Perseverance" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
];

// In-memory quotes array (will be loaded from localStorage if present)
let quotes = [];

// ---------- Storage helpers ----------
function saveQuotes() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes to localStorage:", err);
    alert("Error: Could not save quotes to localStorage.");
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      quotes = [...defaultQuotes];
      saveQuotes();
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Validate objects have required keys
        const valid = parsed.every(q => q && typeof q.text === "string" && typeof q.category === "string");
        if (valid) {
          quotes = parsed;
        } else {
          console.warn("localStorage data invalid, falling back to defaults.");
          quotes = [...defaultQuotes];
          saveQuotes();
        }
      } else {
        quotes = [...defaultQuotes];
        saveQuotes();
      }
    }
  } catch (err) {
    console.error("Failed to load quotes from localStorage:", err);
    quotes = [...defaultQuotes];
    saveQuotes();
  }
}

// Session storage: last viewed quote (object)
function saveLastViewedQuote(quoteObj) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(quoteObj));
  } catch (err) {
    console.warn("Could not set session storage:", err);
  }
}

function loadLastViewedQuote() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.text === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

// ---------- DOM creation ----------
const body = document.body;
body.style.fontFamily = "Arial, sans-serif";
body.style.backgroundColor = "#f8f9fa";
body.style.margin = "24px";

// Title
const title = document.createElement("h1");
title.textContent = "Dynamic Quote Generator";
body.appendChild(title);

// Controls container
const controlsDiv = document.createElement("div");
controlsDiv.style.marginBottom = "12px";

// Category selector label + select
const categoryLabel = document.createElement("label");
categoryLabel.htmlFor = "categorySelect";
categoryLabel.textContent = "Select Category: ";
controlsDiv.appendChild(categoryLabel);

const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";
categorySelect.style.marginRight = "8px";
controlsDiv.appendChild(categorySelect);

// Show quote button
const showQuoteBtn = document.createElement("button");
showQuoteBtn.id = "newQuote";
showQuoteBtn.textContent = "Show New Quote";
showQuoteBtn.style.marginRight = "8px";
controlsDiv.appendChild(showQuoteBtn);

// Export button
const exportBtn = document.createElement("button");
exportBtn.textContent = "Export JSON";
exportBtn.style.marginRight = "8px";
controlsDiv.appendChild(exportBtn);

// Import file input (visually a button + hidden file input)
const importLabel = document.createElement("label");
importLabel.style.display = "inline-block";
importLabel.style.marginRight = "8px";
importLabel.style.cursor = "pointer";

const importBtn = document.createElement("button");
importBtn.textContent = "Import JSON";
importBtn.type = "button";
importLabel.appendChild(importBtn);

// Hidden file input
const importFileInput = document.createElement("input");
importFileInput.type = "file";
importFileInput.accept = ".json,application/json";
importFileInput.style.display = "none";
importFileInput.id = "importFile";
importLabel.appendChild(importFileInput);

controlsDiv.appendChild(importLabel);

// Append controlsDiv to body
body.appendChild(controlsDiv);

// Quote display area
const quoteDisplay = document.createElement("div");
quoteDisplay.id = "quoteDisplay";
quoteDisplay.style.margin = "20px auto";
quoteDisplay.style.padding = "20px";
quoteDisplay.style.width = "min(800px, 90%)";
quoteDisplay.style.backgroundColor = "#ffffff";
quoteDisplay.style.borderRadius = "10px";
quoteDisplay.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
quoteDisplay.style.minHeight = "80px";
quoteDisplay.style.fontSize = "1.2em";
quoteDisplay.textContent = "Your quote will appear here...";
body.appendChild(quoteDisplay);

// Container for add-quote form (will be created by function)
createAddQuoteForm(); // defined later — safe to call since function is hoisted

// Helper: create category options
function populateCategories() {
  categorySelect.innerHTML = "";
  const categories = [...new Set(quotes.map(q => q.category))].sort((a,b) => a.localeCompare(b));
  if (categories.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "— no categories —";
    categorySelect.appendChild(opt);
    return;
  }
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Show a random quote from selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  if (!selectedCategory) {
    quoteDisplay.textContent = "Please select a category.";
    return;
  }
  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const idx = Math.floor(Math.random() * filtered.length);
  const random = filtered[idx];
  quoteDisplay.textContent = `"${random.text}" — [${random.category}]`;

  // Save last viewed to sessionStorage
  saveLastViewedQuote(random);
}

// Add quote function (called by dynamically created form)
function addQuoteFromInputs(textInputEl, categoryInputEl) {
  const text = textInputEl.value.trim();
  const category = categoryInputEl.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and a category.");
    return;
  }

  // push and save
  quotes.push({ text, category });
  saveQuotes();

  // refresh UI
  populateCategories();

  // optionally auto-select the newly added category
  categorySelect.value = category;
  quoteDisplay.textContent = `Added: "${text}" — [${category}]`;

  // clear inputs
  textInputEl.value = "";
  categoryInputEl.value = "";

  alert("Quote added and saved to localStorage.");
}

// Create add-quote form dynamically
function createAddQuoteForm() {
  // If already exists, do nothing
  if (document.getElementById("addQuoteForm")) return;

  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";
  formContainer.style.marginTop = "28px";
  formContainer.style.display = "flex";
  formContainer.style.flexDirection = "column";
  formContainer.style.gap = "8px";
  formContainer.style.maxWidth = "800px";

  const heading = document.createElement("h3");
  heading.textContent = "Add a New Quote";
  formContainer.appendChild(heading);

  const inputsRow = document.createElement("div");
  inputsRow.style.display = "flex";
  inputsRow.style.flexWrap = "wrap";
  inputsRow.style.gap = "8px";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.style.flex = "1 1 60%";
  quoteInput.style.padding = "8px";
  inputsRow.appendChild(quoteInput);

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.flex = "1 1 30%";
  categoryInput.style.padding = "8px";
  inputsRow.appendChild(categoryInput);

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.type = "button";
  addBtn.style.alignSelf = "start";
  addBtn.addEventListener("click", () => addQuoteFromInputs(quoteInput, categoryInput));

  formContainer.appendChild(inputsRow);
  formContainer.appendChild(addBtn);

  body.appendChild(formContainer);
}

// ---------- JSON Export ----------
function exportToJsonFile() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const filename = `quotes_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g, "-")}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to export JSON:", err);
    alert("Error exporting quotes.");
  }
}

// ---------- JSON Import ----------
function importFromJsonFile(file) {
  if (!file) {
    alert("No file selected.");
    return;
  }
  if (!file.name.toLowerCase().endsWith(".json")) {
    alert("Please select a .json file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!Array.isArray(parsed)) {
        alert("Invalid file format: JSON must be an array of quote objects.");
        return;
      }
      // Validate each object
      const validated = parsed.filter(item => item && typeof item.text === "string" && typeof item.category === "string");
      if (validated.length === 0) {
        alert("No valid quotes found in the file.");
        return;
      }

      // Option: deduplicate by text+category combination
      const existingSet = new Set(quotes.map(q => `${q.text}||${q.category}`));
      let added = 0;
      validated.forEach(q => {
        const key = `${q.text}||${q.category}`;
        if (!existingSet.has(key)) {
          quotes.push({ text: q.text, category: q.category });
          existingSet.add(key);
          added++;
        }
      });

      if (added > 0) {
        saveQuotes();
        populateCategories();
      }

      alert(`Import complete. ${added} new quote(s) added (out of ${validated.length} valid entries).`);
    } catch (err) {
      console.error("Error parsing JSON file:", err);
      alert("Failed to read JSON file. Make sure it contains valid JSON.");
    }
  };
  reader.onerror = function() {
    alert("Error reading file.");
  };
  reader.readAsText(file);
}

// ---------- Event wiring ----------
showQuoteBtn.addEventListener("click", () => {
  if (!categorySelect.value) {
    quoteDisplay.textContent = "Please select a category (or add quotes).";
    return;
  }
  showRandomQuote();
});

// Export button
exportBtn.addEventListener("click", exportToJsonFile);

// Import: clicking visible importBtn triggers the hidden file input
importBtn.addEventListener("click", () => importFileInput.click());
importFileInput.addEventListener("change", (evt) => {
  const f = evt.target.files && evt.target.files[0];
  if (f) {
    importFromJsonFile(f);
    // reset input so same file can be selected again later if desired
    importFileInput.value = "";
  }
});

// ---------- Initialization ----------
function init() {
  loadQuotes();
  populateCategories();

  // Restore last viewed quote (session storage)
  const last = loadLastViewedQuote();
  if (last) {
    quoteDisplay.textContent = `"${last.text}" — [${last.category}] (last viewed in this session)`;
    // If last.category exists in categorySelect, select it
    try {
      if ([...categorySelect.options].some(o => o.value === last.category)) {
        categorySelect.value = last.category;
      }
    } catch {}
  } else {
    // If categories exist, pre-select first
    if (categorySelect.options.length > 0) categorySelect.selectedIndex = 0;
  }
}

// Run init
init();
