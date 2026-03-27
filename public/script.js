let chart;

async function addExpense() {
  const text = document.getElementById("text").value;
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  await fetch("/add", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ text, amount, category, date })
  });

  loadData();
}

async function setBudget() {
  const amount = Number(document.getElementById("budgetInput").value);

  await fetch("/budget", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ amount })
  });

  loadData();
}

async function loadData() {
  const res = await fetch("/expenses");
  const expenses = await res.json();

  const budgetRes = await fetch("/budget");
  const { monthlyBudget } = await budgetRes.json();

  let total = 0;
  let categories = {};
  let dates = {};

  const list = document.getElementById("list");
  const tabs = document.getElementById("tabs");
  const calendar = document.getElementById("calendar");

  list.innerHTML = "";
  tabs.innerHTML = "";
  calendar.innerHTML = "";

  expenses.forEach(e => {
    total += e.amount;

    // categories
    categories[e.category] = (categories[e.category] || 0) + e.amount;

    // dates
    if (!dates[e.date]) dates[e.date] = [];
    dates[e.date].push(e);

    const li = document.createElement("li");
    li.innerText = `${e.text} - ₹${e.amount} (${e.category}) [${e.date}]`;
    list.appendChild(li);
  });

  // budget bar
  let percent = monthlyBudget ? ((monthlyBudget - total) / monthlyBudget) * 100 : 100;
  document.getElementById("budgetBar").style.width = percent + "%";

  // pie chart
  const ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories)
      }]
    }
  });

  // category tabs
  Object.keys(categories).forEach(cat => {
    const btn = document.createElement("button");
    btn.innerText = cat;
    btn.onclick = () => filterCategory(cat);
    tabs.appendChild(btn);
  });

  // calendar view
  Object.keys(dates).forEach(date => {
    const li = document.createElement("li");
    li.innerText = `${date}: ₹${dates[date].reduce((a,b)=>a+b.amount,0)}`;
    calendar.appendChild(li);
  });
}

function filterCategory(cat) {
  fetch("/expenses")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("list");
      list.innerHTML = "";

      data.filter(e => e.category === cat).forEach(e => {
        const li = document.createElement("li");
        li.innerText = `${e.text} - ₹${e.amount}`;
        list.appendChild(li);
      });
    });
}

loadData();
