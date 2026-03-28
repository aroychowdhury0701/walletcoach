// Initial State
let categories = [];
let transactions = [];

let monthlyLimit = null; 
let monthlySavingGoal = null; 

// Custom Ratio State (Defaults to 50/30/20)
let ruleRatio = { needs: 50, wants: 30, goals: 20 };

let currentType = 'expense';
let selectedCategory = '';
let chartInstance = null;
let ruleChartInstance = null;

// Initialize Date & Calendar Inputs to Today/Current Month
const today = new Date();
const currentMonthStr = today.toISOString().slice(0, 7); // YYYY-MM
const currentDateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

document.getElementById('input-date').value = currentDateStr;
document.getElementById('month-filter').value = currentMonthStr;
document.getElementById('date-filter').value = currentDateStr;

renderCategoryList();

// --- Core Logic & Rendering ---
function updateDashboard() {
    renderStats();
    renderExpenseCategories();
    renderTransactions();
    renderChart();
    renderCalendar();
    renderRuleChart();
}

function promptBudget() {
    let input = prompt("Enter your Monthly Budget (₹):", monthlyLimit || 20000);
    if (input !== null && !isNaN(input) && input > 0) {
        monthlyLimit = parseFloat(input);
        updateDashboard();
    }
}

function promptGoal() {
    let input = prompt("Enter your Monthly Saving Goal (₹):", monthlySavingGoal || 5000);
    if (input !== null && !isNaN(input) && input >= 0) {
        monthlySavingGoal = parseFloat(input);
        updateDashboard();
    }
}

// --- Custom Ratio Logic ---
function openRatioModal() {
    document.getElementById('input-ratio-needs').value = ruleRatio.needs;
    document.getElementById('input-ratio-wants').value = ruleRatio.wants;
    document.getElementById('input-ratio-goals').value = ruleRatio.goals;
    document.getElementById('ratio-modal').classList.remove('hidden');
}

function closeRatioModal() {
    document.getElementById('ratio-modal').classList.add('hidden');
}

function saveRatio(e) {
    e.preventDefault();
    const n = parseInt(document.getElementById('input-ratio-needs').value);
    const w = parseInt(document.getElementById('input-ratio-wants').value);
    const g = parseInt(document.getElementById('input-ratio-goals').value);

    if (n + w + g !== 100) {
        alert("Percentages must add up to exactly 100!");
        return;
    }

    ruleRatio = { needs: n, wants: w, goals: g };
    closeRatioModal();
    updateDashboard();
}

// --- Main Render Functions ---
function renderStats() {
    let totalExpense = 0; let totalIncome = 0;
    transactions.forEach(t => { 
        if (t.type === 'expense') totalExpense += t.amount; 
        if (t.type === 'income') totalIncome += t.amount;
    });

    if (monthlyLimit === null) {
        document.getElementById('btn-add-budget').classList.remove('hidden');
        document.getElementById('budget-stats').classList.add('hidden');
        document.getElementById('btn-set-budget').classList.add('hidden');
    } else {
        document.getElementById('btn-add-budget').classList.add('hidden');
        document.getElementById('budget-stats').classList.remove('hidden');
        document.getElementById('btn-set-budget').classList.remove('hidden');

        const moneyLeft = monthlyLimit - totalExpense;
        document.getElementById('money-left').innerHTML = `₹${moneyLeft.toFixed(2)} <span style="font-size:1rem; font-weight:normal; color:#9ca3af;">left</span>`;
        document.getElementById('money-left').className = `stat-value ${moneyLeft < 0 ? 'text-red' : 'text-green'}`;
        document.getElementById('spent-text').innerText = `Spent: ₹${totalExpense.toFixed(2)}`;
        document.getElementById('limit-text').innerText = `Limit: ₹${monthlyLimit}`;
        document.getElementById('limit-bar').style.width = `${Math.min((totalExpense / monthlyLimit) * 100, 100) || 0}%`;
    }

    const monthlySavings = monthlyLimit !== null ? (monthlyLimit - totalExpense) : 0; 
    if (monthlySavingGoal === null) {
        document.getElementById('btn-add-goal').classList.remove('hidden');
        document.getElementById('goal-stats').classList.add('hidden');
        document.getElementById('btn-edit-goal').classList.add('hidden');
    } else {
        document.getElementById('btn-add-goal').classList.add('hidden');
        document.getElementById('goal-stats').classList.remove('hidden');
        document.getElementById('btn-edit-goal').classList.remove('hidden');
        document.getElementById('monthly-savings').innerText = `₹${monthlySavings.toFixed(2)}`;
        document.getElementById('monthly-savings').className = `stat-value-small ${monthlySavings >= monthlySavingGoal ? 'text-green' : 'text-red'}`;
        document.getElementById('goal-target-text').innerText = `₹${monthlySavingGoal.toFixed(2)}`;
    }

    const totalSaved = totalIncome - totalExpense;
    document.getElementById('total-saved').innerText = `₹${totalSaved.toFixed(2)}`;
    document.getElementById('total-saved').className = `stat-value-small ${totalSaved >= 0 ? 'text-green' : 'text-red'}`;
}

function renderRuleChart() {
    const canvas = document.getElementById('ruleChart');
    const breakdownBox = document.getElementById('rule-breakdown');
    if (!canvas || !breakdownBox) return;

    const income = monthlyLimit || 0; // If no budget set, limits are 0
    
    // Calculate Limits
    const limitN = income * (ruleRatio.needs / 100);
    const limitW = income * (ruleRatio.wants / 100);
    const limitG = income * (ruleRatio.goals / 100);

    // Calculate Spent
    let spentN = 0; let spentW = 0; let spentG = 0;
    transactions.filter(t => t.type === 'expense').forEach(t => {
        if (t.bucket === 'needs') spentN += t.amount;
        if (t.bucket === 'wants') spentW += t.amount;
        if (t.bucket === 'goals') spentG += t.amount;
    });

    // Calculate Remaining
    const leftN = limitN - spentN;
    const leftW = limitW - spentW;
    const leftG = limitG - spentG;

    // Inject Custom Orange Boxes
    breakdownBox.innerHTML = `
        <div class="rule-box" style="align-items: flex-start;">
            <div>
               <span style="font-weight:bold; color: #3b82f6;">Needs (${ruleRatio.needs}%)</span><br>
               <strong style="color:white; font-size:1.2rem;" class="${leftN < 0 ? 'text-red' : ''}">₹${leftN.toFixed(2)} <span style="font-size:0.8rem; font-weight:normal; color:#9ca3af;">left</span></strong>
            </div>
            <div style="text-align: right; font-size: 0.75rem; color: #9ca3af; line-height: 1.6;">
               Limit: ₹${limitN.toFixed(2)}<br>
               Spent: ₹${spentN.toFixed(2)}
            </div>
        </div>
        <div class="rule-box" style="align-items: flex-start;">
            <div>
               <span style="font-weight:bold; color: #f97316;">Wants (${ruleRatio.wants}%)</span><br>
               <strong style="color:white; font-size:1.2rem;" class="${leftW < 0 ? 'text-red' : ''}">₹${leftW.toFixed(2)} <span style="font-size:0.8rem; font-weight:normal; color:#9ca3af;">left</span></strong>
            </div>
            <div style="text-align: right; font-size: 0.75rem; color: #9ca3af; line-height: 1.6;">
               Limit: ₹${limitW.toFixed(2)}<br>
               Spent: ₹${spentW.toFixed(2)}
            </div>
        </div>
        <div class="rule-box" style="align-items: flex-start;">
            <div>
               <span style="font-weight:bold; color: #22c55e;">Goals (${ruleRatio.goals}%)</span><br>
               <strong style="color:white; font-size:1.2rem;" class="${leftG < 0 ? 'text-red' : ''}">₹${leftG.toFixed(2)} <span style="font-size:0.8rem; font-weight:normal; color:#9ca3af;">left</span></strong>
            </div>
            <div style="text-align: right; font-size: 0.75rem; color: #9ca3af; line-height: 1.6;">
               Limit: ₹${limitG.toFixed(2)}<br>
               Spent: ₹${spentG.toFixed(2)}
            </div>
        </div>
    `;

    if (ruleChartInstance) ruleChartInstance.destroy();
    if (income === 0) return; // Don't draw chart if no budget

    // Draw chart based on Limits
    ruleChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Needs', 'Wants', 'Goals'],
            datasets: [{
                data: [limitN, limitW, limitG],
                backgroundColor: ['#3b82f6', '#f97316', '#22c55e'],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

function toggleTimeFilter() {
    const filterEl = document.getElementById('calendar-time-filter');
    const mode = filterEl.value;
    document.getElementById('month-filter').classList.toggle('hidden', mode !== 'month');
    document.getElementById('date-filter').classList.toggle('hidden', mode !== 'date');
    renderCalendar();
}

function renderCalendar() {
    const list = document.getElementById('calendar-list');
    const typeFilter = document.getElementById('calendar-type-filter').value;
    const timeMode = document.getElementById('calendar-time-filter').value;
    const monthFilter = document.getElementById('month-filter').value; 
    const dateFilter = document.getElementById('date-filter').value; 
    
    list.innerHTML = '';
    let calIncome = 0; let calExpense = 0;

    let sortedTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    const filtered = sortedTx.filter(t => {
        let matchesType = typeFilter === 'all' || t.type === typeFilter;
        let matchesTime = true;
        if (timeMode === 'month' && monthFilter) matchesTime = t.date.startsWith(monthFilter);
        else if (timeMode === 'date' && dateFilter) matchesTime = t.date === dateFilter;
        return matchesType && matchesTime;
    });

    if (filtered.length === 0) {
        list.innerHTML = '<p class="empty-text" style="text-align:center; padding: 24px;">No transactions found.</p>';
        document.getElementById('cal-net-balance').innerText = `₹0.00`;
        return;
    }

    filtered.forEach(t => {
        if(t.type === 'income') calIncome += t.amount;
        if(t.type === 'expense') calExpense += t.amount;

        const sign = t.type === 'income' ? '+' : '-';
        const colorClass = t.type === 'income' ? 'text-green' : 'text-orange';
        
        const div = document.createElement('div');
        div.className = 'tx-row mb-16';
        div.innerHTML = `
            <div class="tx-info">
                <h4>${t.name}</h4>
                <div class="tx-meta">${t.category} • ${t.date}</div>
            </div>
            <div class="tx-amount ${colorClass}">${sign}₹${t.amount.toFixed(2)}</div>
        `;
        list.appendChild(div);
    });

    const netBalance = calIncome - calExpense;
    const netEl = document.getElementById('cal-net-balance');
    netEl.innerText = `₹${netBalance.toFixed(2)}`;
    netEl.className = netBalance >= 0 ? 'text-green' : 'text-red';
}

function toggleMenu(id) {
    document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.remove('show'));
    const menu = document.getElementById(`menu-${id}`);
    if (menu) menu.classList.toggle('show');
}

function showTransactionDetails(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    const content = document.getElementById('tx-details-content');
    const colorClass = tx.type === 'income' ? 'text-green' : 'text-red';
    
    let bucketText = tx.type === 'expense' ? `<p><span>Bucket:</span> <strong style="text-transform: capitalize;">${tx.bucket}</strong></p>` : '';

    content.innerHTML = `
        <p><span>Name:</span> <strong>${tx.name}</strong></p>
        <p><span>Date:</span> ${tx.date}</p>
        <p><span>Category:</span> ${tx.category}</p>
        <p><span>Type:</span> <span style="text-transform: capitalize;">${tx.type}</span></p>
        ${bucketText}
        <p><span>Amount:</span> <strong class="${colorClass}">₹${tx.amount.toFixed(2)}</strong></p>
    `;
    document.getElementById('tx-details-modal').classList.remove('hidden');
}

function closeTxDetailsModal() { document.getElementById('tx-details-modal').classList.add('hidden'); }

function deleteTransaction(id) {
    if (confirm("Are you sure you want to delete this entry?")) {
        transactions = transactions.filter(t => t.id !== id);
        updateDashboard();
    }
}

function renderTransactions() {
    const list = document.getElementById('transactions-list');
    const filter = document.getElementById('recent-filter').value;
    list.innerHTML = '';

    let sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const filtered = sorted.filter(t => filter === 'all' || t.type === filter);

    if (filtered.length === 0) {
        list.innerHTML = '<span class="empty-text">No entries found. Start by adding one!</span>';
        return;
    }

    filtered.forEach(t => {
        const colorClass = t.type === 'income' ? 'text-green' : 'text-orange';
        const sign = t.type === 'income' ? '+' : '-';
        
        const div = document.createElement('div');
        div.className = 'tx-row';
        div.innerHTML = `
            <div class="tx-info">
                <h4>${t.name}</h4>
                <div class="tx-meta">${t.date} <span class="cat-tag">${t.category}</span></div>
            </div>
            <div class="tx-amount ${colorClass}">${sign}₹${t.amount.toFixed(2)}</div>
            <button class="menu-btn" onclick="toggleMenu(${t.id})">⋮</button>
            <div id="menu-${t.id}" class="dropdown-menu">
                <button class="dropdown-item" onclick="showTransactionDetails(${t.id})">Show Details</button>
                <button class="dropdown-item danger" onclick="deleteTransaction(${t.id})">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function renderExpenseCategories() {
    const list = document.getElementById('expense-categories-list');
    list.innerHTML = '';
    const grouped = {};
    
    transactions.filter(t => t.type === 'expense').forEach(e => {
        if (!grouped[e.category]) grouped[e.category] = { total: 0, items: [] };
        grouped[e.category].items.push(e);
        grouped[e.category].total += e.amount;
    });

    if (Object.keys(grouped).length === 0) {
        list.innerHTML = '<span class="empty-text">No expenses added yet.</span>';
        return;
    }

    Object.keys(grouped).forEach(cat => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'cat-card';
        groupDiv.onclick = () => openCategoryModal(cat, grouped[cat].items);
        groupDiv.innerHTML = `<span class="cat-card-title">${cat}</span><span class="cat-card-total text-orange">₹${grouped[cat].total.toFixed(2)}</span>`;
        list.appendChild(groupDiv);
    });
}

function renderChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const expenseData = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
    });

    if (chartInstance) chartInstance.destroy();
    if (Object.keys(expenseData).length === 0) return; 

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: { labels: Object.keys(expenseData), datasets: [{ data: Object.values(expenseData), backgroundColor: ['#f97316', '#22c55e', '#eab308', '#3b82f6', '#a855f7', '#ec4899'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#f3f4f6' } } } }
    });
}

// --- Menus, Modals & Form Handlers ---
function switchTab(tabId) {
    // 1. Reset Tab Buttons
    document.getElementById('tab-categories')?.classList.remove('active');
    document.getElementById('tab-calendar')?.classList.remove('active');
    
    // 2. Hide Both Views completely (using the hidden class to be safe)
    document.getElementById('view-categories')?.classList.remove('active');
    document.getElementById('view-calendar')?.classList.remove('active');
    document.getElementById('view-categories')?.classList.add('hidden');
    document.getElementById('view-calendar')?.classList.add('hidden');

    // 3. Activate and Show the Target Tab and View
    document.getElementById(`tab-${tabId}`)?.classList.add('active');
    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
        targetView.classList.add('active');
        targetView.classList.remove('hidden'); // Forces it to become visible
    }
}
function openModal() { document.getElementById('add-modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('add-modal').classList.add('hidden'); }

function openCategoryModal(catName, items) {
    document.getElementById('cat-modal-title').innerText = `${catName} Expenses`;
    const list = document.getElementById('cat-modal-list');
    list.innerHTML = '';
    [...items].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        const div = document.createElement('div');
        div.className = 'tx-row';
        div.innerHTML = `<div class="tx-info"><h4>${t.name}</h4><div class="tx-meta">${t.date}</div></div><div class="tx-amount text-orange">-₹${t.amount.toFixed(2)}</div>`;
        list.appendChild(div);
    });
    document.getElementById('category-modal').classList.remove('hidden');
}
function closeCategoryModal() { document.getElementById('category-modal').classList.add('hidden'); }

function setType(type) {
    currentType = type;
    document.getElementById('btn-expense').classList.remove('active');
    document.getElementById('btn-income').classList.remove('active');
    document.getElementById(`btn-${type}`).classList.add('active');
    
    // Hide or Show the Bucket selection depending on if it's an expense or income
    document.getElementById('bucket-selection-group').classList.toggle('hidden', type !== 'expense');
}

function addCategory() {
    const input = document.getElementById('new-cat-input');
    const val = input.value.trim();
    if (val && !categories.includes(val)) {
        categories.push(val);
        input.value = '';
        renderCategoryList();
        selectCategory(val);
    }
}

function renderCategoryList() {
    const list = document.getElementById('category-list');
    list.innerHTML = '';
    categories.forEach(cat => {
        const span = document.createElement('span');
        span.className = `cat-badge ${selectedCategory === cat ? 'selected' : ''}`;
        span.innerText = cat;
        span.onclick = () => selectCategory(cat);
        list.appendChild(span);
    });
}
function selectCategory(cat) { selectedCategory = cat; renderCategoryList(); }

function handleFormSubmit(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('input-amount').value);
    const date = document.getElementById('input-date').value;
    const name = document.getElementById('input-name').value;
    const bucket = document.getElementById('input-bucket').value; // Get bucket assignment

    if (!selectedCategory) { alert("Please add and select a category!"); return; }

    transactions.push({ 
        id: Date.now(), 
        type: currentType, 
        amount, date, name, 
        category: selectedCategory,
        bucket: currentType === 'expense' ? bucket : null // Only expenses have buckets
    });

    document.getElementById('input-amount').value = '';
    document.getElementById('input-name').value = '';
    closeModal();
    updateDashboard();
}

// Global Click Listener for Dropdowns
document.addEventListener('click', (e) => {
    const searchBox = document.querySelector('.jargon-search-box');
    const dropdown = document.getElementById('jargon-results');
    if (!e.target.closest('.menu-btn') && !e.target.closest('.dropdown-menu')) {
        document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.remove('show'));
    }
    if (searchBox && !searchBox.contains(e.target) && dropdown) dropdown.classList.add('hidden');
});

// Boot Dashboard
updateDashboard();

// --- Jargon Translator (Hybrid API Logic) ---
const jargonDictionary = [
  { term: "APY", def: "Annual Percentage Yield. Basically, the bonus money your money earns over a year including compounding" },
  { term: "APR", def: "Annual Percentage Rate. The total cost of borrowing money yearly without compounding" },
  { term: "Liquidity", def: "How fast you can grab your cash without losing value" },
  { term: "Asset", def: "Things you own that put money in your pocket or have value" },
  { term: "Liability", def: "Money you owe to other people or institutions" },
  { term: "Net Worth", def: "Everything you own minus everything you owe" },
  { term: "Amortization", def: "Paying off a debt over time in fixed installments" },
  { term: "Capital Gain", def: "The profit you make when you sell something for more than you bought it" },
  { term: "Dividend", def: "A small 'thank-you' payment that companies give to shareholders" },
  { term: "ETF", def: "Exchange Traded Fund. Like a variety pack of different investments in one" },
  { term: "Credit Score", def: "Your financial GPA. A number that shows how trustworthy you are with money" },

  { term: "Principal", def: "The original amount of money you invest or borrow" },
  { term: "Interest", def: "The cost of borrowing money or reward for saving it" },
  { term: "Compound Interest", def: "Interest earned on both the initial amount and previously earned interest" },
  { term: "Inflation", def: "When prices rise and your money buys less" },
  { term: "Deflation", def: "When prices fall and money gains purchasing power" },
  { term: "Equity", def: "Ownership in an asset after subtracting liabilities" },
  { term: "Debt", def: "Money borrowed that must be repaid" },
  { term: "Leverage", def: "Using borrowed money to increase investment potential" },
  { term: "Portfolio", def: "A collection of investments owned by an individual" },
  { term: "Diversification", def: "Spreading investments to reduce risk" },
  { term: "Risk", def: "The chance of losing money or not meeting expectations" },
  { term: "Return", def: "The profit or loss from an investment" },
  { term: "Volatility", def: "How much an investment's price fluctuates" },
  { term: "Bull Market", def: "A market where prices are rising" },
  { term: "Bear Market", def: "A market where prices are falling" },
  { term: "Market Cap", def: "Total value of a company's shares" },
  { term: "IPO", def: "Initial Public Offering, when a company first sells shares" },
  { term: "Bond", def: "A loan made to a government or company" },
  { term: "Yield", def: "Income generated from an investment" },
  { term: "Mutual Fund", def: "Pool of money from investors to buy securities" },
  { term: "Hedge Fund", def: "Private investment fund using advanced strategies" },
  { term: "Index Fund", def: "Fund that tracks a market index" },
  { term: "Liquidity Ratio", def: "Ability to meet short-term obligations" },
  { term: "Cash Flow", def: "Money moving in and out of a business" },
  { term: "Revenue", def: "Total income generated by a business" },
  { term: "Profit", def: "Money left after expenses" },
  { term: "Gross Profit", def: "Revenue minus cost of goods sold" },
  { term: "Net Profit", def: "Final earnings after all expenses" },
  { term: "Operating Income", def: "Profit from core business operations" },
  { term: "EBITDA", def: "Earnings before interest, taxes, depreciation, and amortization" },
  { term: "Capital", def: "Financial resources used for investment" },
  { term: "Working Capital", def: "Current assets minus current liabilities" },
  { term: "Credit Limit", def: "Maximum amount you can borrow" },
  { term: "Overdraft", def: "Spending more money than you have in your account" },
  { term: "Collateral", def: "Asset pledged to secure a loan" },
  { term: "Secured Loan", def: "Loan backed by collateral" },
  { term: "Unsecured Loan", def: "Loan without collateral" },
  { term: "Default", def: "Failure to repay a loan" },
  { term: "Foreclosure", def: "Lender takes property due to unpaid loan" },
  { term: "Underwriting", def: "Process of evaluating risk for loans or insurance" },
  { term: "Credit History", def: "Record of borrowing and repayment behavior" },
  { term: "Fixed Rate", def: "Interest rate that stays constant" },
  { term: "Floating Rate", def: "Interest rate that changes over time" },
  { term: "APR vs APY Spread", def: "Difference between borrowing cost and earning rate" },
  { term: "Settlement", def: "Finalization of a transaction" },
  { term: "Clearing", def: "Process of transferring funds and securities" },
  { term: "Custodian", def: "Institution holding assets on behalf of clients" },
  { term: "Broker", def: "Middleman who buys/sells investments for clients" },
  { term: "Trader", def: "Person actively buying and selling assets" },
  { term: "Speculation", def: "High-risk investing for big gains" },
  { term: "Arbitrage", def: "Profiting from price differences in markets" },
  { term: "Short Selling", def: "Selling borrowed shares expecting price drop" },
  { term: "Margin", def: "Borrowed funds to trade investments" },
  { term: "Margin Call", def: "Demand to add funds to cover losses" },
  { term: "Stop Loss", def: "Order to sell to limit losses" },
  { term: "Take Profit", def: "Order to lock in gains" },
  { term: "Derivatives", def: "Contracts based on underlying assets" },
  { term: "Futures", def: "Agreement to buy/sell at future date" },
  { term: "Options", def: "Right to buy/sell at a specific price" },
  { term: "Swap", def: "Exchange of financial instruments" },
  { term: "Hedging", def: "Reducing risk using investments" },
  { term: "Alpha", def: "Excess return over benchmark" },
  { term: "Beta", def: "Measure of volatility relative to market" },
  { term: "Sharpe Ratio", def: "Risk-adjusted return metric" },
  { term: "Drawdown", def: "Peak-to-trough decline in investment" },
  { term: "Rebalancing", def: "Adjusting portfolio allocation" },
  { term: "Dividend Yield", def: "Dividend relative to stock price" },
  { term: "Retained Earnings", def: "Profit kept in the business" },
  { term: "Depreciation", def: "Reduction in asset value over time" },
  { term: "Asset Allocation", def: "Distribution of investments across categories" },
  { term: "Capital Structure", def: "Mix of debt and equity financing" },
  { term: "Valuation", def: "Determining an asset's worth" },
  { term: "Fair Value", def: "Estimated true value of an asset" },
  { term: "Book Value", def: "Asset value based on balance sheet" },
  { term: "Market Value", def: "Current price of an asset" },
  { term: "P/E Ratio", def: "Price-to-earnings ratio of a stock" },
  { term: "EPS", def: "Earnings per share" },
  { term: "ROE", def: "Return on equity" },
  { term: "ROA", def: "Return on assets" },
  { term: "Debt-to-Equity", def: "Ratio of debt compared to equity" },
  { term: "Interest Coverage Ratio", def: "Ability to pay interest expenses" },
  { term: "Break-even Point", def: "Where revenue equals costs" },
  { term: "Cost of Capital", def: "Required return to fund investments" },
  { term: "WACC", def: "Weighted average cost of capital" },
  { term: "Free Cash Flow", def: "Cash remaining after expenses and investments" },
  { term: "Capital Expenditure", def: "Money spent on long-term assets" },
  { term: "Operating Expense", def: "Costs of running daily operations" },
  { term: "Fiscal Year", def: "12-month accounting period" },
  { term: "Balance Sheet", def: "Snapshot of assets, liabilities, equity" },
  { term: "Income Statement", def: "Report of revenue and expenses" },
  { term: "Cash Flow Statement", def: "Tracks inflow and outflow of cash" },
  { term: "Audit", def: "Examination of financial records" },
  { term: "Compliance", def: "Following financial regulations" },
  { term: "Liquidity Crisis", def: "Shortage of cash in system" },
  { term: "Systemic Risk", def: "Risk affecting entire financial system" },
  { term: "Recession", def: "Economic slowdown with falling output" },
  { term: "GDP", def: "Total economic output of a country" },
  { term: "Monetary Policy", def: "Central bank control of money supply" },
  { term: "Fiscal Policy", def: "Government spending and taxation strategy" }
];let jargonSearchTimer; // Timer to prevent spamming the API

async function handleJargonSearch(e) {
    // Clear the previous timer every time a key is pressed
    clearTimeout(jargonSearchTimer);
    
    const query = e.target.value.trim().toLowerCase();
    const dropdown = document.getElementById('jargon-results');

    if (!dropdown) return;

    // If less than 2 letters, hide the box
    if (query.length < 2) {
        dropdown.classList.add('hidden');
        return;
    }

    // Show a loading state
    dropdown.innerHTML = `<div class="jargon-empty">Searching for "${query}"...</div>`;
    dropdown.classList.remove('hidden');

    // Wait 500ms after the user stops typing before searching
    jargonSearchTimer = setTimeout(async () => {
        
        // STEP 1: Check our local dictionary for PARTIAL matches
        const localMatches = jargonDictionary.filter(item => 
            item.term.toLowerCase().includes(query) || 
            item.def.toLowerCase().includes(query)
        );

        if (localMatches.length > 0) {
            dropdown.innerHTML = '';
            // Show up to 3 local matches to keep the UI clean
            localMatches.slice(0, 3).forEach(match => {
                dropdown.innerHTML += `
                    <div class="jargon-item">
                        <span class="jargon-term" style="text-transform: capitalize;">${match.term}</span>
                        <span class="jargon-def">${match.def}</span>
                    </div>
                `;
            });
            return;
        }

        // STEP 2: Fallback to Live Free Dictionary API
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`);
            if (!response.ok) throw new Error("Word not found");

            const data = await response.json();
            const fetchedDef = data[0].meanings[0].definitions[0].definition;
            
            dropdown.innerHTML = `
                <div class="jargon-item">
                    <span class="jargon-term" style="text-transform: capitalize;">${query}</span>
                    <span class="jargon-def">${fetchedDef}</span>
                </div>
            `;
        } catch (error) {
            dropdown.innerHTML = `<div class="jargon-empty">Hmm, we couldn't find a definition for "<strong>${query}</strong>".</div>`;
        }
        
    }, 500); 
}

// Global Click Listener (Closes Dropdowns if you click outside)
document.addEventListener('click', (e) => {
    const searchBox = document.querySelector('.jargon-search-box');
    const dropdown = document.getElementById('jargon-results');
    
    // Closes 3-dot menus
    if (!e.target.closest('.menu-btn') && !e.target.closest('.dropdown-menu')) {
        document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.remove('show'));
    }

    // Closes Jargon search
    if (searchBox && !searchBox.contains(e.target) && dropdown) {
        dropdown.classList.add('hidden');
    }
});
