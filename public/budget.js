// public/budget.js

// Переменная для хранения экземпляра класса Budget
let myBudget = null;
let balanceChart = null;

// Функция для загрузки данных с сервера и восстановления экземпляра Budget
async function loadBudgetFromServer() {
  const response = await fetch('/budget');
  const data = await response.json();

  // Создаём новый экземпляр Budget
  const newBudget = new Budget();

  // Восстанавливаем валюты
  newBudget.currencies = data.currencies.map(cData => {
    const currency = new Currency(cData.name);
    currency.rates = cData.rates.map(r => new Rate(r.buy, r.sell, r.date));
    return currency;
  });

  // Восстанавливаем типы расходов
  newBudget.expenseTypes = data.expenseTypes.map(etData => new ExpenseType(etData.name));

  // Восстанавливаем типы доходов
  newBudget.incomeTypes = data.incomeTypes.map(itData => new IncomeType(itData.name));

  // Восстанавливаем расходы
  newBudget.expenses = data.expenses.map(eData => {
    const type = newBudget.expenseTypes.find(t => t.name === eData.type.name);
    const currency = newBudget.readCurrency(eData.currency.name);
    return new Expense(eData.value, type, eData.date, currency, eData.name);
  });

  // Восстанавливаем доходы
  newBudget.incomes = data.incomes.map(iData => {
    const type = newBudget.incomeTypes.find(t => t.name === iData.type.name);
    const currency = newBudget.readCurrency(iData.currency.name);
    return new Income(iData.value, type, iData.date, currency, iData.name);
  });

  myBudget = newBudget; // Присваиваем глобальной переменной готовый экземпляр
}

function saveBudgetToServer() {
  // При сохранении нам не нужно заново создавать структуру, так как сервер принимает JSON
  // из myBudget напрямую. Но сейчас myBudget содержит объекты классов.
  // Чтобы отправить на сервер корректный JSON, преобразуем данные обратно в плоскую структуру.
  const dataToSave = {
    currencies: myBudget.currencies.map(c => ({
      name: c.name,
      rates: c.rates.map(r => ({ buy: r.buy, sell: r.sell, date: r.date }))
    })),
    expenseTypes: myBudget.expenseTypes.map(t => ({ name: t.name })),
    incomeTypes: myBudget.incomeTypes.map(t => ({ name: t.name })),
    expenses: myBudget.expenses.map(e => ({
      value: e.value,
      type: { name: e.type.name },
      date: e.date,
      currency: { name: e.currency.name },
      name: e.name
    })),
    incomes: myBudget.incomes.map(i => ({
      value: i.value,
      type: { name: i.type.name },
      date: i.date,
      currency: { name: i.currency.name },
      name: i.name
    }))
  };

  fetch('/budget', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSave)
  })
  .then(response => response.json())
  .then(data => {
    console.log(data.message);
  })
  .catch(error => console.error('Ошибка при сохранении бюджета:', error));
}
