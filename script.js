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
            currentInterval: '1h',
            ws: null,
            apiRetryCount: 0
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.initChart();
        this.connectWebSocket();
        this.startPriceUpdates();
        this.updateUI();
    }

    async initChart() {
        const chartContainer = document.getElementById('priceChart');
        const loader = document.getElementById('chartLoader');
        
        try {
            chartContainer.innerHTML = '';
            loader.style.display = 'block';
            
            // Создаем график
            this.state.chart = LightweightCharts.createChart(chartContainer, {
                layout: {
                    backgroundColor: '#1e293b',
                    textColor: '#e2e8f0',
                    fontSize: 12
                },
                grid: {
                    vertLines: { color: 'rgba(51, 65, 85, 0.5)' },
                    horzLines: { color: 'rgba(51, 65, 85, 0.5)' }
                },
                width: chartContainer.clientWidth,
                height: 300,
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                    borderColor: 'rgba(51, 65, 85, 0.8)'
                }
            });

            // Добавляем свечную серию
            this.state.candleSeries = this.state.chart.addCandlestickSeries({
                upColor: '#10b981',
                downColor: '#ef4444',
                borderDownColor: '#ef4444',
                borderUpColor: '#10b981',
                wickDownColor: '#ef4444',
                wickUpColor: '#10b981'
            });

            // Загружаем исторические данные
            const data = await this.fetchChartData();
            this.state.candleSeries.setData(data);
            this.state.chart.timeScale().fitContent();
            
            loader.style.display = 'none';

        } catch (error) {
            console.error("Ошибка инициализации графика:", error);
            loader.textContent = "Ошибка загрузки. Используем тестовые данные...";
            const mockData = this.getMockCandleData();
            if (this.state.candleSeries) {
                this.state.candleSeries.setData(mockData);
                this.state.chart.timeScale().fitContent();
            }
        }
    }

    async fetchChartData() {
        try {
            // Пробуем разные прокси сервера если первый не работает
            const proxies = [
                'https://cors-anywhere.herokuapp.com/',
                'https://api.codetabs.com/v1/proxy/?quest=',
                'https://thingproxy.freeboard.io/fetch/'
            ];
            
            const proxy = proxies[this.state.apiRetryCount % proxies.length];
            const apiUrl = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${this.state.currentInterval}&limit=100`;
            
            const response = await fetch(proxy + apiUrl, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            
            if (!response.ok) throw new Error("API не отвечает");
            
            const data = await response.json();
            
            // Обновляем текущую цену
            if (data.length > 0) {
                const lastCandle = data[data.length - 1];
                this.state.prices.BTC = parseFloat(lastCandle[4]);
                
                // Рассчитываем изменение цены
                if (data.length > 1) {
                    const prevClose = parseFloat(data[data.length - 2][4]);
                    const currentClose = parseFloat(lastCandle[4]);
                    this.state.priceChange.BTC = ((currentClose - prevClose) / prevClose) * 100;
                }
            }
            
            return data.map(item => ({
                time: item[0] / 1000,
                open: parseFloat(item[1]),
                high: parseFloat(item[2]),
                low: parseFloat(item[3]),
                close: parseFloat(item[4])
            }));
            
        } catch (error) {
            console.log("Ошибка API:", error);
            this.state.apiRetryCount++;
            
            if (this.state.apiRetryCount < 3) {
                return this.fetchChartData(); // Пробуем еще раз
            }
            
            throw error; // Переходим к мок данным
        }
    }

    connectWebSocket() {
        if (this.state.ws) {
            this.state.ws.close();
        }
        
        const wsEndpoint = `wss://stream.binance.com:9443/ws/btcusdt@kline_${this.state.currentInterval}`;
        this.state.ws = new WebSocket(wsEndpoint);
        
        this.state.ws.onopen = () => {
            console.log("WebSocket подключен");
        };
        
        this.state.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (!data.k) return;
                
                const candle = data.k;
                const newPrice = parseFloat(candle.c);
                const priceChanged = newPrice !== this.state.prices.BTC;
                
                this.state.prices.BTC = newPrice;
                
                if (this.state.candleSeries) {
                    this.state.candleSeries.update({
                        time: candle.t / 1000,
                        open: parseFloat(candle.o),
                        high: parseFloat(candle.h),
                        low: parseFloat(candle.l),
                        close: newPrice
                    });
                }
                
                if (priceChanged) {
                    this.updateUI();
                }
                
            } catch (error) {
                console.log("Ошибка обработки WebSocket сообщения:", error);
            }
        };
        
        this.state.ws.onerror = (error) => {
            console.log("WebSocket ошибка:", error);
            setTimeout(() => this.connectWebSocket(), 5000); // Переподключение через 5 сек
        };
        
        this.state.ws.onclose = () => {
            console.log("WebSocket закрыт, переподключаемся...");
            setTimeout(() => this.connectWebSocket(), 5000);
        };
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
                close
            };
        });
    }

    async updateChartData(interval) {
        if (!this.state.chart || !this.state.candleSeries) return;
        
        try {
            this.state.currentInterval = interval;
            const loader = document.getElementById('chartLoader');
            loader.style.display = 'block';
            
            const data = await this.fetchChartData();
            this.state.candleSeries.setData(data);
            this.state.chart.timeScale().fitContent();
            
            // Переподключаем WebSocket с новым интервалом
            this.connectWebSocket();
            
            loader.style.display = 'none';
        } catch (error) {
            console.error("Ошибка обновления графика:", error);
        }
    }

    startPriceUpdates() {
        // Обновляем данные каждые 30 секунд (как fallback если WebSocket отключится)
        this.priceUpdateInterval = setInterval(async () => {
            if (!this.state.ws || this.state.ws.readyState !== WebSocket.OPEN) {
                await this.updateChartData(this.state.currentInterval);
            }
            this.updateUI();
        }, 30000);
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
        
        if (this.state.priceChange[asset] >= 0) {
            changeElement.style.color = 'var(--profit)';
            changeElement.textContent = '+' + this.state.priceChange[asset].toFixed(2) + '%';
        } else {
            changeElement.style.color = 'var(--loss)';
            changeElement.textContent = this.state.priceChange[asset].toFixed(2) + '%';
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
                this.updateChartData(btn.dataset.interval);
            });
        });
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
