class TradingApp {
    constructor() {
        this.state = {
            balance: 10000,
            portfolio: { BTC: 0, ETH: 0 },
            prices: { BTC: 50000, ETH: 3000 },
            priceChange: { BTC: 0, ETH: 0 },
            history: [],
            chart: null,
            candleSeries: null,
            currentInterval: '1h'
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
            // Очищаем контейнер
            chartContainer.innerHTML = '';
            loader.style.display = 'block';
            
            // Создаем график
            this.state.chart = LightweightCharts.createChart(chartContainer, {
                layout: {
                    backgroundColor: '#1e293b',
                    textColor: '#e2e8f0',
                    fontSize: 12,
                },
                grid: {
                    vertLines: { color: 'rgba(51, 65, 85, 0.5)' },
                    horzLines: { color: 'rgba(51, 65, 85, 0.5)' },
                },
                width: chartContainer.clientWidth,
                height: 300,
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                    borderColor: 'rgba(51, 65, 85, 0.8)',
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                },
            });

            // Добавляем свечную серию
            this.state.candleSeries = this.state.chart.addCandlestickSeries({
                upColor: '#10b981',
                downColor: '#ef4444',
                borderDownColor: '#ef4444',
                borderUpColor: '#10b981',
                wickDownColor: '#ef4444',
                wickUpColor: '#10b981',
            });

            // Загружаем данные
            const data = await this.fetchChartData(this.state.currentInterval);
            this.state.candleSeries.setData(data);
            
            // Настраиваем zoom
            this.state.chart.timeScale().fitContent();
            
            loader.style.display = 'none';

        } catch (error) {
            console.error("Ошибка инициализации графика:", error);
            loader.textContent = "Ошибка загрузки данных";
        }
    }

    async fetchChartData(interval = '1h') {
        try {
            const symbol = 'BTCUSDT';
            const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`);
            const data = await response.json();
            
            // Обновляем текущую цену
            const lastCandle = data[data.length - 1];
            this.state.prices.BTC = parseFloat(lastCandle[4]);
            
            // Рассчитываем изменение цены
            const prevClose = parseFloat(data[data.length - 2][4]);
            const currentClose = parseFloat(lastCandle[4]);
            this.state.priceChange.BTC = ((currentClose - prevClose) / prevClose) * 100;
            
            return data.map(item => ({
                time: item[0] / 1000,
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
        return Array.from({ length: 100 }, (_, i) => {
            const basePrice = 50000;
            const open = basePrice * (1 + Math.sin(i/10) * 0.02);
            const close = basePrice * (1 + Math.sin((i+1)/10) * 0.02);
            const high = Math.max(open, close) * (1 + Math.random() * 0.01);
            const low = Math.min(open, close) * (1 - Math.random() * 0.01);
            
            return {
                time: now - (100 - i) * 3600,
                open,
                high,
                low,
                close,
            };
        });
    }

    async updateChartData(interval) {
        if (!this.state.chart || !this.state.candleSeries) return;
        
        try {
            const loader = document.getElementById('chartLoader');
            loader.style.display = 'block';
            
            const data = await this.fetchChartData(interval);
            this.state.candleSeries.setData(data);
            this.state.chart.timeScale().fitContent();
            
            loader.style.display = 'none';
        } catch (error) {
            console.error("Ошибка обновления графика:", error);
        }
    }

    startPriceUpdates() {
        // Обновляем данные каждые 30 секунд
        setInterval(async () => {
            await this.updateChartData(this.state.currentInterval);
            this.updateUI();
        }, 30000);
    }

    updatePrices() {
        Object.keys(this.state.prices).forEach(asset => {
            const change = (Math.random() * 0.02) - 0.01;
            this.state.prices[asset] *= (1 + change);
            this.state.priceChange[asset] = change * 100;
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
            if (this.state.portfolio[asset] <= 0) {
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
        // Обновляем баланс
        document.getElementById('balance').textContent = this.state.balance.toFixed(2) + ' USDT';
        
        // Обновляем текущую цену и изменение
        const asset = document.getElementById('asset-select').value;
        const priceElement = document.getElementById('current-price');
        const changeElement = document.getElementById('price-change');
        
        priceElement.textContent = this.state.prices[asset].toFixed(2);
        changeElement.textContent = this.state.priceChange[asset].toFixed(2) + '%';
        
        if (this.state.priceChange[asset] >= 0) {
            changeElement.style.color = 'var(--profit)';
            changeElement.textContent = '+' + changeElement.textContent;
        } else {
            changeElement.style.color = 'var(--loss)';
        }
        
        // Обновляем портфель
        document.getElementById('btc-amount').textContent = this.state.portfolio.BTC.toFixed(6);
        document.getElementById('eth-amount').textContent = this.state.portfolio.ETH.toFixed(6);
        
        // Обновляем историю
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
        // Кнопки купить/продать
        document.getElementById('buy-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('BUY', asset);
        });
        
        document.getElementById('sell-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('SELL', asset);
        });
        
        // Изменение актива
        document.getElementById('asset-select').addEventListener('change', () => {
            this.updateUI();
        });
        
        // Кнопки таймфреймов
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentInterval = btn.dataset.interval;
                this.updateChartData(this.state.currentInterval);
            });
        });
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
