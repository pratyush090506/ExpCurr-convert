let budget_input = document.getElementById('budget');
let budget_set = document.getElementById('set-budget');
let budget_value = document.getElementById('budget-amount');
let amount_left = document.getElementById('amount-left');
let te = document.getElementById('total-expense');
let tbody = document.querySelector('tbody');

let stored_budget = localStorage.getItem('budget');
if (stored_budget) {
    budget_value.innerHTML = '₹' + stored_budget + '.00';
    let total_expense = JSON.parse(localStorage.getItem('expenses'))?.reduce((acc, cur) => acc + cur.amount, 0) || 0;
    amount_left.innerHTML = '₹' + (parseFloat(stored_budget) - total_expense).toFixed(2);
}

let editingIndex = null; 

let stored_expenses = JSON.parse(localStorage.getItem('expenses')) || [];

stored_expenses.forEach((expense, index) => {
    let tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${expense.name}</td>
        <td>₹${expense.amount.toFixed(2)}</td>
        <td>${expense.category}</td>
        <td><button class = 'edit-btn' data-index="${index}">Edit</button>
            <button class="delete-btn" data-index="${index}">Delete</button> 
        </td>
    `;
    tbody.appendChild(tr);
});

function updateExpenseTable() {
    tbody.innerHTML = '';

    stored_expenses.forEach((expense, index) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${expense.name}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td>${expense.category}</td>
            <td><button class = 'edit-btn' data-index="${index}">Edit</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    let total_expense = stored_expenses.reduce((acc, cur) => acc + cur.amount, 0);
    let budget = parseFloat(localStorage.getItem('budget'));
    amount_left.innerHTML = '₹' + (budget - total_expense).toFixed(2);
    localStorage.setItem('TotalExpense', total_expense);
    localStorage.setItem('RemainingBudget', (budget - total_expense));
    te.innerHTML = '₹' + total_expense.toFixed(2);

    editingIndex = null;
    drawPieChart();
}

let te_stored = localStorage.getItem('TotalExpense');
if(te_stored){
    te.innerHTML = '₹' + te_stored+'.00';
}

let re_stored = localStorage.getItem('RemainingBudget');
if(re_stored){
    amount_left.innerHTML = '₹' + re_stored+'.00';
}

budget_set.addEventListener('click', (e) => {
    e.preventDefault();
    let budget = budget_input.value;
    if (budget > 0) {
        budget_value.innerHTML = '₹' + budget + '.00';
        localStorage.setItem('budget', budget);
        alert('Budget set successfully!');
        let clear_budget = document.createElement('button');
        clear_budget.innerHTML = 'Clear Budget';
        clear_budget.classList.add('clear-budget');
        document.querySelector('.budget-display').style.display = 'flex';
        document.querySelector('.budget-display').style.alignItems = 'center';
        document.querySelector('.budget-display').style.gap = '10px';
        document.querySelector('.budget-display').appendChild(clear_budget);
        clear_budget.addEventListener('click', () => {
            budget_value.innerHTML = '₹0.00';
            localStorage.removeItem('budget');
            clear_budget.remove();
            budget_input.value = '';
            editingIndex = null;
        });
        clear_budget.style.display = 'block';
        clear_budget.style.borderRadius = '5px';
        clear_budget.style.backgroundColor = 'red';
        clear_budget.style.width = '110px';
        clear_budget.style.height = '40px';
        clear_budget.style.color = 'white';
        clear_budget.style.border = 'none';
        clear_budget.style.fontSize = '15px';
        budget_input.value = '';
    } else {
        alert('Please enter a valid budget.');
    }
});

let expense_name = document.getElementById('expense-name');
let expense_amount = document.getElementById('expense-amount');
let expense_cat = document.getElementById('select-category');
let add_exp_btn = document.getElementById('add-expense');

add_exp_btn.addEventListener('click', () => {
    let name = expense_name.value;
    let amount = parseFloat(expense_amount.value);
    let category = expense_cat.value;

    if (!name || !amount || isNaN(amount)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    let total_expense = stored_expenses.reduce((acc, cur) => acc + cur.amount, 0) + amount;
    let budget = parseFloat(localStorage.getItem('budget'));
    if (isNaN(budget) || total_expense > budget) {
        alert('Total expense should not exceed the budget.');
        return;
    }

    if (editingIndex !== null) {
        stored_expenses[editingIndex] = { name, amount, category };
        editingIndex = null;
    } else {
        let expense = { name, amount, category };
        stored_expenses.push(expense);
    }

    localStorage.setItem('expenses', JSON.stringify(stored_expenses));
    updateExpenseTable();

    expense_name.value = '';
    expense_amount.value = '';
});

tbody.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        let tr = event.target.closest('tr');
        let index = tr.getAttribute('data-index');

        stored_expenses.splice(index, 1);

        localStorage.setItem('expenses', JSON.stringify(stored_expenses));

        updateExpenseTable();
    }
});

tbody.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-btn')) {
        let tr = event.target.closest('tr');
        let index = event.target.getAttribute('data-index');

        if (index !== null) {
            let expense = stored_expenses[index];
            if (expense) {
                expense_name.value = expense.name;
                expense_amount.value = expense.amount;
                expense_cat.value = expense.category;
                editingIndex = index;
            }
        }
    }
});
document.querySelector('#convert-currency').addEventListener('click', async () => {
    console.log('Conversion Button Clicked');
    const amount = parseFloat(document.querySelector('#convert-amount').value);
    const from = document.querySelector('#from-currency').value;
    const to = document.querySelector('#to-currency').value;

    if (!amount || isNaN(amount)) {
        alert('Please enter a valid amount.');
        return;
    }
    if (from === to) {
        alert('Please select different currencies for conversion.');
        return;
    }

    try {
        const response = await fetch(`https://api.currencyapi.com/v3/latest?apikey=cur_live_cgfzPagod8LD38wOOOTYasCedY2f1533xpQQcfoh&base_currency=${from}&currencies=${to}`);
        const rJSON = await response.json();
        console.log('API Response:', rJSON); 
        const rate = rJSON.data[to].value;
        const convertedAmount = amount * rate;
        document.querySelector('#converted-amount').textContent = convertedAmount.toFixed(2) + ' ' + to;
        document.querySelector('#converted-amount').style.backgroundColor = 'yellow';
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again later.');
    }
});

function drawPieChart() {
    let categories = stored_expenses.reduce((acc, cur) => {
        if (!acc[cur.category]) {
            acc[cur.category] = 0;
        }
        acc[cur.category] += cur.amount;
        return acc;
    }, {});

    let pieChartContainer = document.querySelector('#pie-chart');
    pieChartContainer.innerHTML = ''; 
    let canvas = document.createElement('canvas');
    pieChartContainer.appendChild(canvas);

    let ctx = canvas.getContext('2d');
    if (typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    label: 'Expenses',
                    data: Object.values(categories),
                    backgroundColor: [
                        'rgba(255, 99, 132, 1)', 
                        'rgba(54, 162, 235, 1)', 
                        'rgba(255, 206, 86, 1)', 
                        'rgba(75, 192, 192, 1)', 
                        'rgba(153, 102, 255, 1)', 
                        'rgba(255, 159, 64, 1)'  
                    ],
                    borderColor: [
                        'rgba(255, 255, 255, 1)', 
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: {
                    title: {
                        display: true,
                        text: 'Expenses by Category',
                        color: 'white', 
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom', 
                        labels: {
                            color: 'white', 
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.error('Chart.js library is not loaded.');
    }
}

drawPieChart();