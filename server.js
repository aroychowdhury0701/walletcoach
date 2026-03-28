const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let expenses = [];
let monthlyBudget = 0;

// Smart categorization
function categorize(text) {
  text = text.toLowerCase();
  if (text.includes("food") || text.includes("pizza") || text.includes("burger")) return "Food";
  if (text.includes("uber") || text.includes("bus") || text.includes("taxi")) return "Transport";
  if (text.includes("movie") || text.includes("netflix")) return "Entertainment";
  return "Other";
}

// Add expense
app.post("/add", (req, res) => {
  const { text, amount, category, date } = req.body;

  const finalCategory = category || categorize(text);

  const expense = { text, amount, category: finalCategory, date };
  expenses.push(expense);

  res.json(expense);
});

// Get expenses
app.get("/expenses", (req, res) => {
  res.json(expenses);
});

// Set budget
app.post("/budget", (req, res) => {
  monthlyBudget = req.body.amount;
  res.json({ success: true });
});

// Get budget
app.get("/budget", (req, res) => {
  res.json({ monthlyBudget });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));