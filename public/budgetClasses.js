// public/budgetClasses.js

class Rate {
    constructor(buy, sell, date) {
      this.buy = buy;
      this.sell = sell;
      this.date = date;
    }
  }
  
  class Currency {
    constructor(name) {
      this.name = name;
      this.rates = [];
    }
  
    createRate(buy, sell, date) {
      const rate = new Rate(buy, sell, date);
      this.rates.push(rate);
      return rate;
    }
  }
  
  class ExpenseType {
    constructor(name) {
      this.name = name;
    }
  }
  
  class IncomeType {
    constructor(name) {
      this.name = name;
    }
  }
  
  class Expense {
    constructor(value, type, date, currency, name = 'Покупка') {
      this.value = value;
      this.type = type;
      this.date = date;
      this.currency = currency;
      this.name = name;
      this.transactionType = 'expense'; // Добавляем для удобства определения типа
    }
  }
  
  class Income {
    constructor(value, type, date, currency, name = 'Доход') {
      this.value = value;
      this.type = type;
      this.date = date;
      this.currency = currency;
      this.name = name;
      this.transactionType = 'income'; // Добавляем для удобства определения типа
    }
  }
  
  class Budget {
    constructor() {
      this.currencies = [];
      this.expenseTypes = [];
      this.incomeTypes = [];
      this.expenses = [];
      this.incomes = [];
    }
  
    createCurrency(name) {
      const currency = new Currency(name);
      this.currencies.push(currency);
      return currency;
    }
  
    readCurrency(name) {
      return this.currencies.find((c) => c.name === name);
    }
  
    createExpense(value, typeName, date, currencyName, name) {
      const type = this.expenseTypes.find((t) => t.name === typeName);
      const currency = this.readCurrency(currencyName);
      if (type && currency) {
        const expense = new Expense(value, type, date, currency, name);
        this.expenses.push(expense);
        return expense;
      }
      throw new Error('Тип расхода или валюта не найдены');
    }
  
    updateExpense(index, value, typeName, date, currencyName, name) {
      const expense = this.expenses[index];
      const type = this.expenseTypes.find((t) => t.name === typeName);
      const currency = this.readCurrency(currencyName);
      if (expense && type && currency) {
        expense.value = value;
        expense.type = type;
        expense.date = date;
        expense.currency = currency;
        expense.name = name;
        return expense;
      }
      throw new Error('Ошибка при обновлении расхода');
    }
  
    createExpenseType(name) {
      const type = new ExpenseType(name);
      this.expenseTypes.push(type);
      return type;
    }
  
    createIncome(value, typeName, date, currencyName, name) {
      const type = this.incomeTypes.find((t) => t.name === typeName);
      const currency = this.readCurrency(currencyName);
      if (type && currency) {
        const income = new Income(value, type, date, currency, name);
        this.incomes.push(income);
        return income;
      }
      throw new Error('Тип дохода или валюта не найдены');
    }
  
    updateIncome(index, value, typeName, date, currencyName, name) {
      const income = this.incomes[index];
      const type = this.incomeTypes.find((t) => t.name === typeName);
      const currency = this.readCurrency(currencyName);
      if (income && type && currency) {
        income.value = value;
        income.type = type;
        income.date = date;
        income.currency = currency;
        income.name = name;
        return income;
      }
      throw new Error('Ошибка при обновлении дохода');
    }
  
    createIncomeType(name) {
      const type = new IncomeType(name);
      this.incomeTypes.push(type);
      return type;
    }
  
    deleteIncome(index) {
      if (index >= 0 && index < this.incomes.length) {
        this.incomes.splice(index, 1);
      } else {
        throw new Error('Некорректный индекс дохода');
      }
    }
  
    deleteExpense(index) {
      if (index >= 0 && index < this.expenses.length) {
        this.expenses.splice(index, 1);
      } else {
        throw new Error('Некорректный индекс расхода');
      }
    }
  
    filterTransactions(startDate, endDate, filterType = 'all') {
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      let filteredIncomes = this.incomes.filter(income => {
        const date = new Date(income.date);
        return date >= start && date <= end;
      });
  
      let filteredExpenses = this.expenses.filter(expense => {
        const date = new Date(expense.date);
        return date >= start && date <= end;
      });
  
      if (filterType === 'income') {
        return filteredIncomes;
      } else if (filterType === 'expense') {
        return filteredExpenses;
      } else {
        return filteredIncomes.concat(filteredExpenses);
      }
    }
  }
  