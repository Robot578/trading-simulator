// Виртуальное состояние
const state = {
  balance: 10000,
  portfolio: { BTC: 0, ETH: 0 },
  prices: { BTC: 50000, ETH: 3000 },
  history: []
};

// Генерация случайного изменения цены (от -5% до +5%)
function updatePrice(asset) {
  const change = (Math.random() * 0.1) - 0.05;
  state.prices[asset] *= (1 + change);
  return state.prices[asset];
}

// Обновление цен каждые 3 секунды
function startPriceUpdates() {
  setInterval(() => {
    updatePrice('BTC');
    updatePrice('ETH');
    updateUI();
  }, 3000);
}

// Обновление интерфейса
function updateUI() {
  // Баланс
  document.getElementById('balance').textContent = state.balance.toFixed(2);

  // Цены активов
  document.getElementById('btc-price').textContent = state.prices.BTC.toFixed(2);
  document.getElementById('eth-price').textContent = state.prices.ETH.toFixed(2);

  // Портфель
  document.getElementById('btc-amount').textContent = state.portfolio.BTC.toFixed(6);
  document.getElementById('eth-amount').textContent = state.portfolio.ETH.toFixed(6);
}

// Выполнение сделки
function executeTrade(action, asset) {
  const amount = parseFloat(document.getElementById('trade-amount').value);
  if (isNaN(amount) || amount <= 0) {
    alert('Введите корректную сумму!');
    return;
  }

  if (action === 'BUY') {
    const cost = amount / state.prices[asset];
    if (amount > state.balance) {
      alert('Недостаточно средств!');
      return;
    }
    state.balance -= amount;
    state.portfolio[asset] += cost;

    state.history.push({
      type: 'BUY',
      asset,
      amount: cost,
      price: state.prices[asset],
      total: amount,
      timestamp: new Date().toLocaleTimeString()
    });

  } else if (action === 'SELL') {
    if (state.portfolio[asset] < amount) {
      alert(`Недостаточно ${asset} для продажи!`);
      return;
    }
    const total = amount * state.prices[asset];
    state.balance += total;
    state.portfolio[asset] -= amount;

    state.history.push({
      type: 'SELL',
      asset,
      amount,
      price: state.prices[asset],
      total,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  updateUI();
  updateHistory();
}

// Обновление истории
function updateHistory() {
  const historyEl = document.getElementById('history');
  historyEl.innerHTML = '';

  state.history.slice().reverse().forEach(trade => {
    const item = document.createElement('div');
    item.className = 'history-item';

    item.innerHTML = `
      <div>
        <span class="${trade.type === 'BUY' ? 'buy-sign' : 'sell-sign'}">
          ${trade.type === 'BUY' ? '🟢 Куплено' : '🔴 Продано'} ${trade.asset}
        </span>
        <div>${trade.amount.toFixed(6)} по ${trade.price.toFixed(2)}</div>
      </div>
      <div>
        <div>${trade.total.toFixed(2)} USDT</div>
        <div class="timestamp">${trade.timestamp}</div>
      </div>
    `;

    historyEl.appendChild(item);
  });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  startPriceUpdates();
  updateUI();

  // Назначение обработчиков кнопок
  document.getElementById('buy-btn').addEventListener('click', () => {
    const asset = document.getElementById('asset-select').value;
    executeTrade('BUY', asset);
  });

  document.getElementById('sell-btn').addEventListener('click', () => {
    const asset = document.getElementById('asset-select').value;
    executeTrade('SELL', asset);
  });
});