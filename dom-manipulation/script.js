// Dynamic Quote Generator
// ========================

// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It always seems impossible until it’s done.", category: "Perseverance" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
];

// Select the body to append elements dynamically
const body = document.body;

// --- Step 1: Create Base Structure ---
const title = document.createElement("h1");
title.textContent = "Dynamic Quote Generator";
body.appendChild(title);

// Quote Display Area
const quoteDisplay = document.createElement("div");
quoteDisplay.id = "quoteDisplay";
quoteDisplay.style.margin = "20px auto";
quoteDisplay.style.padding = "20px";
quoteDisplay.style.width = "60%";
quoteDisplay.style.backgroundColor = "#fff";
quoteDisplay.style.borderRadius = "10px";
quoteDisplay.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
quoteDisplay.style.minHeight = "80px";
quoteDisplay.style.fontSize = "1.2em";
quoteDisplay.textContent = "Your quote will appear here...";
body.appendChild(quoteDisplay);

// --- Step 2: Create Category Dropdown + Button Section ---
const controlsDiv = document.createElement("div");

const categoryLabel = document.createElement("label");
categoryLabel.textContent = "Select Category: ";
controlsDiv.appendChild(categoryLabel);

const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";
controlsDiv.appendChild(categorySelect);

const showQuoteBtn = document.createElement("button");
showQuoteBtn.id = "newQuote";
showQuoteBtn.textContent = "Show New Quote";
controlsDiv.appendChild(showQuoteBtn);

body.insertBefore(controlsDiv, quoteDisplay);

// --- Step 3: Populate Categories ---
function populateCategories() {
  categorySelect.innerHTML = "";
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// --- Step 4: Display Random Quote ---
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — [${random.category}]`;
}

// --- Step 5: Create Add Quote Form Dynamically ---
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";
  formContainer.style.marginTop = "30px";

  const heading = document.createElement("h3");
  heading.textContent = "Add a New Quote";
  formContainer.appendChild(heading);

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.style.margin = "5px";
  formContainer.appendChild(quoteInput);

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.margin = "5px";
  formContainer.appendChild(categoryInput);

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.style.marginLeft = "10px";
  addBtn.addEventListener("click", addQuote);
  formContainer.appendChild(addBtn);

  body.appendChild(formContainer);
}

// --- Step 6: Add Quote Function ---
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category!");
    return;
  }

  quotes.push({ text, category });

  // Refresh the category dropdown
  populateCategories();

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";

  alert("New quote added successfully!");
}

// --- Step 7: Initialize Everything ---
populateCategories();
createAddQuoteForm();

// Event listener for showing new quote
showQuoteBtn.addEventListener("click", showRandomQuote);
