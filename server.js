// server.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const Budget = require('./models/budget');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Путь к файлу с данными
const dataPath = path.join(__dirname, 'data', 'budget.json');

// Создание экземпляра бюджета
const myBudget = new Budget();

// Функция для загрузки данных из файла
const loadData = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf-8');
    const json = JSON.parse(data);

    // Загрузка валют
    json.currencies.forEach((c) => {
      const currency = myBudget.createCurrency(c.name);
      if (c.rates) {
        c.rates.forEach((r) => currency.createRate(r.buy, r.sell, r.date));
      }
    });

    // Загрузка типов расходов
    json.expenseTypes.forEach((t) => myBudget.createExpenseType(t.name));

    // Загрузка типов доходов
    json.incomeTypes.forEach((t) => myBudget.createIncomeType(t.name));

    // Загрузка расходов
    json.expenses.forEach((e) => {
      try {
        myBudget.createExpense(
          e.value,
          e.type.name,
          e.date,
          e.currency.name,
          e.name
        );
      } catch (error) {
        console.error(`Ошибка при загрузке расхода: ${error.message}`);
      }
    });

    // Загрузка доходов
    json.incomes.forEach((i) => {
      try {
        myBudget.createIncome(
          i.value,
          i.type.name,
          i.date,
          i.currency.name,
          i.name
        );
      } catch (error) {
        console.error(`Ошибка при загрузке дохода: ${error.message}`);
      }
    });

    console.log('Данные успешно загружены.');
  } catch (err) {
    console.error('Ошибка при загрузке данных:', err);
  }
};

// Функция для сохранения данных в файл
const saveData = () => {
  const data = {
    currencies: myBudget.currencies.map((c) => ({
      name: c.name,
      rates: c.rates,
    })),
    expenseTypes: myBudget.expenseTypes.map((t) => ({ name: t.name })),
    incomeTypes: myBudget.incomeTypes.map((t) => ({ name: t.name })),
    expenses: myBudget.expenses.map((e) => ({
      value: e.value,
      type: { name: e.type.name },
      date: e.date,
      currency: { name: e.currency.name },
      name: e.name,
    })),
    incomes: myBudget.incomes.map((i) => ({
      value: i.value,
      type: { name: i.type.name },
      date: i.date,
      currency: { name: i.currency.name },
      name: i.name,
    })),
  };

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Данные успешно сохранены.');
};

// Загрузка данных при старте сервера
loadData();

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для получения бюджета
app.get('/budget', (req, res) => {
  const data = {
    currencies: myBudget.currencies,
    expenseTypes: myBudget.expenseTypes,
    incomeTypes: myBudget.incomeTypes,
    expenses: myBudget.expenses,
    incomes: myBudget.incomes,
  };
  res.json(data);
});

// Маршрут для сохранения бюджета
app.post('/budget', (req, res) => {
  const updatedData = req.body;

  try {
    // Очистка текущих данных
    myBudget.currencies = [];
    myBudget.expenseTypes = [];
    myBudget.incomeTypes = [];
    myBudget.expenses = [];
    myBudget.incomes = [];

    // Загрузка новых данных
    updatedData.currencies.forEach((c) => {
      const currency = myBudget.createCurrency(c.name);
      if (c.rates) {
        c.rates.forEach((r) => currency.createRate(r.buy, r.sell, r.date));
      }
    });

    updatedData.expenseTypes.forEach((t) =>
      myBudget.createExpenseType(t.name)
    );
    updatedData.incomeTypes.forEach((t) =>
      myBudget.createIncomeType(t.name)
    );

    updatedData.expenses.forEach((e) => {
      myBudget.createExpense(
        e.value,
        e.type.name,
        e.date,
        e.currency.name,
        e.name
      );
    });

    updatedData.incomes.forEach((i) => {
      myBudget.createIncome(
        i.value,
        i.type.name,
        i.date,
        i.currency.name,
        i.name
      );
    });

    // Сохранение данных в файл
    saveData();

    res.status(200).json({ message: 'Бюджет успешно обновлён.' });
  } catch (error) {
    console.error('Ошибка при сохранении бюджета:', error);
    res.status(500).json({ message: 'Ошибка при сохранении бюджета.' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
