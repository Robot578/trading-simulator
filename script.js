class TradingApp {
    constructor() {
        this.state = {
            balance: 10000,
            portfolio: { BTC: 0, ETH: 0 },
            prices: { BTC: 50000, ETH: 3000 },
            history: [],
            chart: null,
            candleSeries: null
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
        const chartContainer = document.getElementById('priceChart');
        const loader = document.getElementById('chartLoader');
        
        try {
            // Создаем график
            this.state.chart = LightweightCharts.createChart(chartContainer, {
                layout: {
                    backgroundColor: '#1e293b',
                    textColor: '#e2e8f0',
                },
                grid: {
                    vertLines: { color: '#334155' },
                    horzLines: { color: '#334155' },
                },
                width: chartContainer.clientWidth,
                height: 250,
                timeScale: {
                    timeVisible: true,
                    borderColor: '#334155',
                },
            });

            // Добавляем свечную серию
            this.state.candleSeries = this.state.chart.addCandlestickSeries({
                upColor: '#10b981',
                downColor: '#ef4444',
                borderVisible: false,
                wickUpColor: '#10b981',
                wickDownColor: '#ef4444',
            });

            // Загружаем данные
            const data = await this.fetchChartData();
            this.state.candleSeries.setData(data);
            loader.style.display = 'none';

        } catch (error) {
            console.error("Ошибка инициализации графика:", error);
            loader.textContent = "Ошибка загрузки данных";
        }
    }

    async fetchChartData() {
        try {
            const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=100');
            const data = await response.json();
            
            return data.map(item => ({
                time: item[0] / 1000, // Конвертируем в секунды
                open: parseFloat(item[1]),
                high: parseFloat(item[2]),
                low: parseFloat(item[3]),
                close: parseFloat(item[4]),
            }));
        } catch (error) {
            console.log("Используем тестовые данные");
            return this.getMockCandleData();
        }
    }

    getMockCandleData() {
        const now = Math.floor(Date.now() / 1000);
        return Array.from({ length: 24 }, (_, i) => {
            const basePrice = 50000;
            const open = basePrice * (1 + Math.sin(i) * 0.01);
            const close = basePrice * (1 + Math.sin(i + 1) * 0.01);
            const high = Math.max(open, close) * (1 + Math.random() * 0.01);
            const low = Math.min(open, close) * (1 - Math.random() * 0.01);
            
            return {
                time: now - (24 - i) * 3600,
                open,
                high,
                low,
                close,
            };
        });
    }

    startPriceUpdates() {
        setInterval(() => {
            this.updatePrices();
            this.updateUI();
            
            // Обновляем последнюю свечу
            if (this.state.candleSeries && this.state.candleSeries.data().length > 0) {
                const lastCandle = this.state.candleSeries.data()[this.state.candleSeries.data().length - 1];
                const newCandle = {
                    time: Date.now() / 1000,
                    open: lastCandle.close,
                    high: this.state.prices.BTC * (1 + Math.random() * 0.01),
                    low: this.state.prices.BTC * (1 - Math.random() * 0.01),
                    close: this.state.prices.BTC,
                };
                this.state.candleSeries.update(newCandle);
            }
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
