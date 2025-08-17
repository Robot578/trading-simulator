class TradingApp {
    constructor() {
        this.state = {
            balance: 10000,
            portfolio: { BTC: 0, ETH: 0 },
            prices: { BTC: 50000, ETH: 3000 },
            history: [],
            chart: null
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.initChart();
        this.startPriceUpdates();
        this.updateUI();
    }

    async initChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        const loader = document.getElementById('chartLoader');
        
        try {
            const data = await this.fetchChartData();
            
            this.state.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Цена',
                        data: data.prices,
                        borderColor: '#f7931a',
                        backgroundColor: 'rgba(247, 147, 26, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: this.getChartOptions()
            });
            
            loader.style.display = 'none';
        } catch (error) {
            console.error("Ошибка инициализации графика:", error);
            loader.textContent = "Ошибка загрузки данных";
        }
    }

    async fetchChartData() {
        // Реальные данные с Binance API
        try {
            const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=24');
            const data = await response.json();
            
            return {
                labels: data.map(item => new Date(item[0]).toLocaleTimeString()),
                prices: data.map(item => parseFloat(item[4]))
            };
        } catch (error) {
            console.log("Используем тестовые данные");
            return this.getMockData();
        }
    }

    getMockData() {
        const now = new Date();
        return {
            labels: Array.from({length: 24}, (_, i) => {
                const d = new Date(now);
                d.setHours(d.getHours() - 24 + i);
                return d.toLocaleTimeString();
            }),
            prices: Array.from({length: 24}, (_, i) => {
                return 50000 * (1 + Math.sin(i/3) * 0.02 + (Math.random() - 0.5) * 0.01;
            })
        };
    }

    getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: ctx => `Цена: ${ctx.parsed.y.toFixed(2)} USDT`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        };
    }

    startPriceUpdates() {
        setInterval(() => {
            this.updatePrices();
            this.updateUI();
        }, 3000);
    }

    updatePrices() {
        Object.keys(this.state.prices).forEach(asset => {
            const change = (Math.random() * 0.02) - 0.01;
            this.state.prices[asset] *= (1 + change);
        });
    }

    executeTrade(action, asset) {
        const amount = parseFloat(document.getElementById('trade-amount').value);
        if (isNaN(amount) || amount <= 0) {
            this.showAlert('Введите корректную сумму!');
            return;
        }

        const price = this.state.prices[asset];
        let message = '';

        if (action === 'BUY') {
            const amountBought = amount / price;
            if (amount > this.state.balance) {
                this.showAlert('Недостаточно средств!');
                return;
            }
            this.state.balance -= amount;
            this.state.portfolio[asset] += amountBought;
            message = `Куплено ${amountBought.toFixed(6)} ${asset} за ${amount.toFixed(2)} USDT`;
        } else {
            if (this.state.portfolio[asset] < amount) {
                this.showAlert(`Недостаточно ${asset} для продажи!`);
                return;
            }
            const total = amount * price;
            this.state.balance += total;
            this.state.portfolio[asset] -= amount;
            message = `Продано ${amount.toFixed(6)} ${asset} за ${total.toFixed(2)} USDT`;
        }

        this.state.history.push({
            type: action,
            asset,
            amount,
            price,
            total: amount * price,
            timestamp: new Date().toLocaleString()
        });

        this.showAlert(message);
        this.updateUI();
    }

    updateUI() {
        // Обновление баланса
        document.getElementById('balance').textContent = this.state.balance.toFixed(2) + ' USDT';
        
        // Обновление цен
        const asset = document.getElementById('asset-select').value;
        document.getElementById('current-price').textContent = this.state.prices[asset].toFixed(2);
        
        // Обновление портфеля
        document.getElementById('btc-amount').textContent = this.state.portfolio.BTC.toFixed(6);
        document.getElementById('eth-amount').textContent = this.state.portfolio.ETH.toFixed(6);
        
        // Обновление истории
        this.updateHistory();
    }

    updateHistory() {
        const container = document.getElementById('history-items');
        container.innerHTML = '';
        
        this.state.history.slice().reverse().forEach(trade => {
            const item = document.createElement('div');
            item.className = `history-item ${trade.type.toLowerCase()}`;
            item.innerHTML = `
                <div class="trade-type">${trade.type === 'BUY' ? '🟢 Куплено' : '🔴 Продано'} ${trade.asset}</div>
                <div class="trade-details">
                    <span>${trade.amount.toFixed(6)} по ${trade.price.toFixed(2)}</span>
                    <span>${trade.total.toFixed(2)} USDT</span>
                </div>
                <div class="trade-time">${trade.timestamp}</div>
            `;
            container.appendChild(item);
        });
    }

    showAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'trade-alert';
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    setupEventListeners() {
        document.getElementById('buy-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('BUY', asset);
        });
        
        document.getElementById('sell-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('SELL', asset);
        });
        
        document.getElementById('asset-select').addEventListener('change', () => {
            this.updateUI();
        });
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
