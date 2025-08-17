class TradingApp {
    constructor() {
        this.state = {
            balance: 10000,
            portfolio: { BTC: 0, ETH: 0 },
            prices: { BTC: 0, ETH: 0 },
            history: [],
            chart: null,
            socket: null
        };
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadPrices();
        await this.initChart();
        this.connectWebSocket();
        this.updateUI();
    }

    async loadPrices() {
        try {
            // Используем JSONBin.io как временное хранилище данных
            const response = await fetch('https://api.jsonbin.io/v3/b/664f7dc1e41b4d34e4f3a1a4/latest', {
                headers: {
                    'X-Master-Key': '$2a$10$W9UXi6Sk.7q4Rl1Z5YzQ5O7vD3k9Jt8Yb1dLm6Nc4rX2vQ1Ks5Z7C'
                }
            });
            const data = await response.json();
            
            this.state.prices.BTC = data.record.BTC;
            this.state.prices.ETH = data.record.ETH;
        } catch (error) {
            console.error("Ошибка загрузки цен:", error);
            // Запасные значения
            this.state.prices = { BTC: 68432.50, ETH: 3718.20 };
        }
    }

    async initChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        const loader = document.getElementById('chartLoader');
        
        try {
            // Данные графика из локального JSON
            const response = await fetch('chart-data.json');
            const data = await response.json();
            
            this.state.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'BTC/USDT',
                        data: data.prices,
                        borderColor: '#f7931a',
                        backgroundColor: 'rgba(247, 147, 26, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `Цена: ${ctx.parsed.y.toFixed(2)} USDT`
                            }
                        }
                    }
                }
            });
            
            loader.style.display = 'none';
        } catch (error) {
            console.error("Ошибка графика:", error);
            loader.textContent = "График загружен (демо-данные)";
            this.initDemoChart(ctx);
        }
    }

    initDemoChart(ctx) {
        const now = new Date();
        const demoData = {
            labels: Array.from({ length: 24 }, (_, i) => {
                const d = new Date(now);
                d.setHours(d.getHours() - 24 + i);
                return d.toLocaleTimeString();
            }),
            prices: Array.from({ length: 24 }, (_, i) => 
                60000 + Math.sin(i/2) * 2000 + (Math.random() * 1000)
        };

        this.state.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: demoData.labels,
                datasets: [{
                    label: 'BTC/USDT (демо)',
                    data: demoData.prices,
                    borderColor: '#f7931a',
                    borderWidth: 2
                }]
            }
        });
    }

    connectWebSocket() {
        // Эмуляция WebSocket через интервальное обновление
        this.state.socket = setInterval(() => {
            const change = (Math.random() * 0.02) - 0.01;
            this.state.prices.BTC *= (1 + change);
            this.state.prices.ETH *= (1 + change * 1.5);
            this.updateUI();
        }, 3000);
    }

    executeTrade(action, asset) {
        const amount = parseFloat(document.getElementById('trade-amount').value);
        if (isNaN(amount)) {
            this.showAlert('Введите корректную сумму!');
            return;
        }

        const price = this.state.prices[asset];
        let message = '';

        if (action === 'BUY') {
            const cost = amount;
            if (cost > this.state.balance) {
                this.showAlert('Недостаточно средств!');
                return;
            }
            this.state.balance -= cost;
            this.state.portfolio[asset] += amount / price;
            message = `Куплено ${(amount / price).toFixed(6)} ${asset}`;
        } else {
            const assetAmount = amount;
            if (assetAmount > this.state.portfolio[asset]) {
                this.showAlert(`Недостаточно ${asset}!`);
                return;
            }
            this.state.balance += assetAmount * price;
            this.state.portfolio[asset] -= assetAmount;
            message = `Продано ${assetAmount.toFixed(6)} ${asset}`;
        }

        this.state.history.push({
            type: action,
            asset,
            amount,
            price,
            timestamp: new Date().toLocaleString()
        });
        this.updateUI();
        this.showAlert(message);
    }

    updateUI() {
        document.getElementById('balance').textContent = this.state.balance.toFixed(2) + ' USDT';
        
        const asset = document.getElementById('asset-select').value;
        document.getElementById('current-price').textContent = this.state.prices[asset].toFixed(2);
        
        document.getElementById('btc-amount').textContent = this.state.portfolio.BTC.toFixed(6);
        document.getElementById('eth-amount').textContent = this.state.portfolio.ETH.toFixed(6);
        
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
                    <span>${trade.type === 'BUY' 
                        ? `${(trade.amount / trade.price).toFixed(6)} ${trade.asset}` 
                        : `${trade.amount.toFixed(6)} ${trade.asset}`} 
                    по ${trade.price.toFixed(2)} USDT</span>
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
        setTimeout(() => alert.remove(), 3000);
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
