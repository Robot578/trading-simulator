class TradingTeacher {
    constructor(tradingApp) {
        this.tradingApp = tradingApp;
        this.lessons = {
            basics: [
                "Трейдинг - это покупка и продажа активов с целью получения прибыли.",
                "Основное правило: покупай дешево, продавай дорого.",
                "Всегда диверсифицируй портфель - не вкладывай все в один актив.",
                "Изучай фундаментальный и технический анализ для принятия решений.",
                "Начинай с маленьких сумм и постепенно увеличивай объемы."
            ],
            indicators: [
                "SMA (простая скользящая средняя) показывает среднюю цену за период.",
                "EMA (экспоненциальная скользящая средняя) больше весит последние данные.",
                "Когда цена выше SMA - тренд восходящий, ниже - нисходящий.",
                "Пересечение быстрой и медленной MA может сигнализировать о развороте.",
                "Используй несколько индикаторов для подтверждения сигналов."
            ],
            risk: [
                "Никогда не рискуй более 2% от депозита в одной сделке!",
                "Всегда устанавливай стоп-лосс для ограничения убытков.",
                "Соотношение риск/прибыль должно быть не менее 1:2.",
                "Диверсификация снижает риски - торгуй несколькими активами.",
                "Веди статистику сделок для анализа ошибок."
            ]
        };
    }

    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('teacher-message');
        messageEl.textContent = message;
        messageEl.className = `teacher-message ${type}`;
    }

    giveHint() {
        const currentPrice = this.tradingApp.state.prices[this.tradingApp.state.currentAsset];
        const lastPrices = this.tradingApp.state.candles.slice(-5).map(c => c.close);
        const trend = this.calculateTrend(lastPrices);
        
        let hint = `Текущая цена: ${currentPrice.toFixed(2)}\n`;
        
        if (trend > 0.5) {
            hint += "📈 Сильный восходящий тренд! Рассмотри возможность покупки.";
        } else if (trend > 0.1) {
            hint += "📈 Восходящий тренд. Можно рассматривать покупки.";
        } else if (trend < -0.5) {
            hint += "📉 Сильный нисходящий тренд! Будь осторожен с покупками.";
        } else if (trend < -0.1) {
            hint += "📉 Нисходящий тренд. Рассмотри возможность продажи.";
        } else {
            hint += "➡️ Боковой тренд. Жди четкого сигнала для входа.";
        }
        
        this.showMessage(hint, 'hint');
    }

    analyzeMarket() {
        const asset = this.tradingApp.state.currentAsset;
        const prices = this.tradingApp.state.candles.map(c => c.close);
        const volume = this.tradingApp.state.candles.map(c => c.volume);
        
        const analysis = this.performTechnicalAnalysis(prices, volume);
        this.showMessage(analysis, 'analysis');
    }

    performTechnicalAnalysis(prices, volumes) {
        if (prices.length < 20) {
            return "Недостаточно данных для анализа. Нужно больше свечей.";
        }

        const lastPrice = prices[prices.length - 1];
        const sma20 = this.calculateSMA(prices, 20);
        const sma50 = this.calculateSMA(prices, 50);
        const volumeAvg = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const lastVolume = volumes[volumes.length - 1];

        let analysis = `📊 Анализ ${this.tradingApp.state.currentAsset}:\n\n`;
        analysis += `Текущая цена: ${lastPrice.toFixed(2)}\n`;
        analysis += `SMA(20): ${sma20.toFixed(2)}\n`;
        analysis += `SMA(50): ${sma50.toFixed(2)}\n`;
        
        if (lastPrice > sma20 && lastPrice > sma50) {
            analysis += "✅ Цена выше обеих MA - сильный бычий тренд\n";
        } else if (lastPrice < sma20 && lastPrice < sma50) {
            analysis += "❌ Цена ниже обеих MA - сильный медвежий тренд\n";
        } else if (lastPrice > sma20) {
            analysis += "⚠️ Цена выше SMA20 но ниже SMA50 - смешанный сигнал\n";
        } else {
            analysis += "⚠️ Цена ниже SMA20 но выше SMA50 - смешанный сигнал\n";
        }

        if (lastVolume > volumeAvg * 2) {
            analysis += "📊 Очень высокий объем - возможен разворот или усиление тренда\n";
        } else if (lastVolume > volumeAvg * 1.5) {
            analysis += "📊 Высокий объем - внимание к движению\n";
        }

        return analysis;
    }

    calculateSMA(data, period) {
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
    }

    calculateTrend(prices) {
        if (prices.length < 2) return 0;
        const changes = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        return changes.reduce((a, b) => a + b, 0) / changes.length;
    }

    startLesson(topic) {
        const lessonContent = this.lessons[topic];
        if (lessonContent) {
            let message = `📚 Урок: ${this.getTopicName(topic)}\n\n`;
            lessonContent.forEach((point, index) => {
                message += `${index + 1}. ${point}\n`;
            });
            message += "\n💡 Запомни эти правила для успешного трейдинга!";
            this.showMessage(message, 'lesson');
        }
    }

    getTopicName(topic) {
        const names = {
            basics: "Основы трейдинга",
            indicators: "Технические индикаторы",
            risk: "Управление рисками"
        };
        return names[topic] || topic;
    }
}

class RiskCalculator {
    constructor(tradingApp) {
        this.tradingApp = tradingApp;
    }

    calculate() {
        const deposit = parseFloat(document.getElementById('risk-deposit').value);
        const riskPercent = parseFloat(document.getElementById('risk-percent').value);
        const entryPrice = parseFloat(document.getElementById('risk-entry').value);
        const stopPrice = parseFloat(document.getElementById('risk-stop').value);

        if (!deposit || !riskPercent || !entryPrice || !stopPrice) {
            this.tradingApp.showAlert('Заполните все поля калькулятора!', 'error');
            return;
        }

        const riskAmount = deposit * (riskPercent / 100);
        const priceDifference = Math.abs(entryPrice - stopPrice);
        const volume = riskAmount / priceDifference;

        document.getElementById('risk-volume').textContent = volume.toFixed(6);
        document.getElementById('risk-amount').textContent = riskAmount.toFixed(2) + ' USDT';

        // Автоматически подставляем рассчитанный объем в поле торговли
        document.getElementById('trade-amount').value = volume.toFixed(6);
        
        this.tradingApp.teacher.showMessage(
            `📊 Расчет позиции:\n\n` +
            `• Риск на сделку: ${riskPercent}% от депозита\n` +
            `• Сумма риска: ${riskAmount.toFixed(2)} USDT\n` +
            `• Объем: ${volume.toFixed(6)}\n\n` +
            `💡 Стоп-лосс ограничивает убытки, а правильный объем позиции ` +
            `позволяет рисковать только запланированной суммой.`,
            'lesson'
        );
    }
}

class OrderManager {
    constructor(tradingApp) {
        this.tradingApp = tradingApp;
    }

    createOrder(type, asset, amount, triggerPrice, orderType = 'STOP') {
        const order = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            type: type,
            asset: asset,
            amount: amount,
            triggerPrice: triggerPrice,
            orderType: orderType,
            status: 'ACTIVE',
            createdAt: new Date().toLocaleString()
        };
        
        this.tradingApp.state.orders.push(order);
        this.tradingApp.saveData();
        this.updateOrdersUI();
        
        this.tradingApp.showAlert(
            `🎯 ${orderType === 'STOP' ? 'Стоп-лосс' : 'Тейк-профит'} ордер создан!`,
            'info'
        );
    }

    checkOrders() {
        const currentPrice = this.tradingApp.state.prices[this.tradingApp.state.currentAsset];
        
        this.tradingApp.state.orders.forEach(order => {
            if (order.status === 'ACTIVE') {
                const shouldTrigger = order.orderType === 'STOP' ? 
                    (order.type === 'BUY' ? currentPrice >= order.triggerPrice : currentPrice <= order.triggerPrice) :
                    (order.type === 'BUY' ? currentPrice <= order.triggerPrice : currentPrice >= order.triggerPrice);
                
                if (shouldTrigger) {
                    this.executeOrder(order);
                }
            }
        });
    }

    executeOrder(order) {
        order.status = 'FILLED';
        this.tradingApp.executeTrade(order.type, order.asset, order.amount);
        this.tradingApp.showAlert(
            `✅ Ордер исполнен! ${order.type === 'BUY' ? 'Куплено' : 'Продано'} ${order.amount} ${order.asset} по ${order.triggerPrice}`,
            'success'
        );
        this.updateOrdersUI();
    }

    cancelOrder(orderId) {
        const orderIndex = this.tradingApp.state.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.tradingApp.state.orders[orderIndex].status = 'CANCELLED';
            this.tradingApp.saveData();
            this.updateOrdersUI();
            this.tradingApp.showAlert('❌ Ордер отменен', 'error');
        }
    }

    updateOrdersUI() {
        const container = document.getElementById('orders-container');
        if (!container) return;

        const activeOrders = this.tradingApp.state.orders.filter(o => o.status === 'ACTIVE');
        
        if (activeOrders.length === 0) {
            container.innerHTML = '<div class="empty-orders">Активных ордеров нет</div>';
            return;
        }

        container.innerHTML = activeOrders.map(order => `
            <div class="order-item ${order.type.toLowerCase()}">
                <div class="order-header">
                    <span class="order-type">${order.type === 'BUY' ? '🟢 BUY' : '🔴 SELL'} ${order.asset}</span>
                    <span class="order-price">${order.triggerPrice.toFixed(2)}</span>
                    <button class="cancel-order-btn" data-order-id="${order.id}">❌</button>
                </div>
                <div class="order-details">
                    <span>Объем: ${order.amount}</span>
                    <span>Тип: ${order.orderType === 'STOP' ? 'Стоп-лосс' : 'Тейк-профит'}</span>
                </div>
                <div class="order-time">Создан: ${order.createdAt}</div>
            </div>
        `).join('');

        // Добавляем обработчики для кнопок отмены
        container.querySelectorAll('.cancel-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.cancelOrder(orderId);
            });
        });
    }
}

class TradingApp {
    constructor() {
        this.state = {
            balance: 100,
            portfolio: { BTC: 0, ETH: 0, SOL: 0 },
            prices: { BTC: 0, ETH: 0, SOL: 0 },
            history: [],
            orders: [],
            chart: null,
            candleSeries: null,
            smaSeries: null,
            emaSeries: null,
            socket: null,
            candles: [],
            currentAsset: 'BTC',
            timeframe: '1h'
        };

        this.teacher = new TradingTeacher(this);
        this.riskCalculator = new RiskCalculator(this);
        this.orderManager = new OrderManager(this);
        
        this.init();
    }

    async init() {
        await this.loadSavedData();
        this.initChart();
        this.setupEventListeners();
        await this.loadInitialData();
        this.updateUI();
        this.orderManager.updateOrdersUI();
    }

    async loadSavedData() {
        try {
            const savedBalance = localStorage.getItem('tradeBalance');
            const savedPortfolio = localStorage.getItem('tradePortfolio');
            const savedHistory = localStorage.getItem('tradeHistory');
            const savedPrices = localStorage.getItem('tradePrices');
            const savedOrders = localStorage.getItem('tradeOrders');

            if (savedBalance) this.state.balance = parseFloat(savedBalance);
            if (savedPortfolio) this.state.portfolio = JSON.parse(savedPortfolio);
            if (savedHistory) this.state.history = JSON.parse(savedHistory);
            if (savedPrices) this.state.prices = JSON.parse(savedPrices);
            if (savedOrders) this.state.orders = JSON.parse(savedOrders);

        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    async saveData() {
        try {
            localStorage.setItem('tradeBalance', this.state.balance.toString());
            localStorage.setItem('tradePortfolio', JSON.stringify(this.state.portfolio));
            localStorage.setItem('tradeHistory', JSON.stringify(this.state.history));
            localStorage.setItem('tradePrices', JSON.stringify(this.state.prices));
            localStorage.setItem('tradeOrders', JSON.stringify(this.state.orders));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    initChart() {
        const chartContainer = document.getElementById('candleChart');
        if (!chartContainer) return;

        this.state.chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
            layout: {
                backgroundColor: '#ffffff',
                textColor: '#1e293b',
                fontSize: 12
            },
            grid: {
                vertLines: { color: '#e2e8f0' },
                horzLines: { color: '#e2e8f0' }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#e2e8f0'
            }
        });

        this.state.candleSeries = this.state.chart.addCandlestickSeries({
            upColor: '#00c853',
            downColor: '#ff1744',
            borderDownColor: '#ff1744',
            borderUpColor: '#00c853',
            wickDownColor: '#ff1744',
            wickUpColor: '#00c853'
        });

        this.state.smaSeries = this.state.chart.addLineSeries({
            color: '#2962ff',
            lineWidth: 2,
            lineStyle: 0,
            title: 'SMA 20'
        });

        this.state.emaSeries = this.state.chart.addLineSeries({
            color: '#ff6d00',
            lineWidth: 2,
            lineStyle: 0,
            title: 'EMA 12'
        });

        document.getElementById('chartLoader').style.display = 'none';
    }

    async loadInitialData() {
        const asset = document.getElementById('asset-select').value;
        this.state.currentAsset = asset;
        await this.fetchCandles(asset);
        this.connectWebSocket();
        this.updateIndicators();
    }

    async fetchCandles(asset) {
        const symbol = `${asset}USDT`;
        const interval = this.state.timeframe;
        
        try {
            document.getElementById('chartLoader').style.display = 'block';
            
            // Используем прокси для обхода CORS
            const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`);
            const data = await response.json();

            this.state.candles = data.map(item => ({
                time: item[0] / 1000,
                open: parseFloat(item[1]),
                high: parseFloat(item[2]),
                low: parseFloat(item[3]),
                close: parseFloat(item[4]),
                volume: parseFloat(item[5])
            }));

            this.state.candleSeries.setData(this.state.candles);
            
            const lastCandle = this.state.candles[this.state.candles.length - 1];
            this.state.prices[asset] = lastCandle.close;
            
            this.updateMetrics(data);
            
            document.getElementById('current-price').textContent = lastCandle.close.toFixed(2);
            document.getElementById('price-change').textContent = '+0.00%';
            document.getElementById('price-change').style.color = '#00c853';
            
            document.getElementById('chartLoader').style.display = 'none';
            
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            document.getElementById('chartLoader').textContent = "Ошибка загрузки данных";
            // Используем тестовые данные если API не доступно
            this.useTestData();
        }
    }

    useTestData() {
        // Генерируем тестовые данные
        const now = Date.now() / 1000;
        const testData = [];
        let price = 50000;
        
        for (let i = 0; i < 100; i++) {
            const time = now - (100 - i) * 3600;
            const change = (Math.random() - 0.5) * 1000;
            price += change;
            
            testData.push({
                time: time,
                open: price - change + (Math.random() - 0.5) * 200,
                high: price + Math.random() * 300,
                low: price - Math.random() * 300,
                close: price,
                volume: 1000 + Math.random() * 2000
            });
        }
        
        this.state.candles = testData;
        this.state.candleSeries.setData(testData);
        this.state.prices[this.state.currentAsset] = price;
        
        document.getElementById('current-price').textContent = price.toFixed(2);
        document.getElementById('chartLoader').style.display = 'none';
    }

    updateMetrics(data) {
        const volumes = data.map(item => parseFloat(item[5]));
        const highs = data.map(item => parseFloat(item[2]));
        const lows = data.map(item => parseFloat(item[3]));
        const closes = data.map(item => parseFloat(item[4]));

        const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
        const maxHigh = Math.max(...highs);
        const minLow = Math.min(...lows);
        const priceChange = ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100;

        document.getElementById('volume-24h').textContent = totalVolume.toFixed(0);
        document.getElementById('high-24h').textContent = maxHigh.toFixed(2);
        document.getElementById('low-24h').textContent = minLow.toFixed(2);
        document.getElementById('change-24h').textContent = priceChange.toFixed(2) + '%';
        document.getElementById('change-24h').style.color = priceChange >= 0 ? '#00c853' : '#ff1744';
    }

    updateIndicators() {
        if (document.getElementById('sma-toggle').checked) {
            const smaData = this.calculateSMA(this.state.candles.map(c => c.close), 20);
            this.state.smaSeries.setData(smaData);
            this.state.smaSeries.applyOptions({ visible: true });
        } else {
            this.state.smaSeries.applyOptions({ visible: false });
        }

        if (document.getElementById('ema-toggle').checked) {
            const emaData = this.calculateEMA(this.state.candles.map(c => c.close), 12);
            this.state.emaSeries.setData(emaData);
            this.state.emaSeries.applyOptions({ visible: true });
        } else {
            this.state.emaSeries.applyOptions({ visible: false });
        }
    }

    calculateSMA(data, period) {
        const result = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            result.push({ time: this.state.candles[i].time, value: sum / period });
        }
        return result;
    }

    calculateEMA(data, period) {
        const k = 2 / (period + 1);
        const result = [{ time: this.state.candles[period - 1].time, value: data.slice(0, period).reduce((a, b) => a + b, 0) / period }];
        
        for (let i = period; i < data.length; i++) {
            const ema = data[i] * k + result[result.length - 1].value * (1 - k);
            result.push({ time: this.state.candles[i].time, value: ema });
        }
        return result;
    }

    connectWebSocket() {
        if (this.state.socket) {
            this.state.socket.close();
        }

        const asset = this.state.currentAsset;
        const symbol = `${asset}USDT`.toLowerCase();

        try {
            this.state.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);

            this.state.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const price = parseFloat(data.c);
                    const change = parseFloat(data.P);

                    this.state.prices[asset] = price;
                    
                    document.getElementById('current-price').textContent = price.toFixed(2);
                    document.getElementById('price-change').textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                    document.getElementById('price-change').style.color = change >= 0 ? '#00c853' : '#ff1744';
                    
                    // Проверяем ордера при каждом обновлении цены
                    this.orderManager.checkOrders();
                    
                } catch (error) {
                    console.error("Ошибка обработки WebSocket сообщения:", error);
                }
            };

            this.state.socket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

        } catch (error) {
            console.error("Ошибка создания WebSocket:", error);
        }
    }

    executeTrade(action, asset, amount = null) {
        let tradeAmount = amount;
        
        if (!tradeAmount) {
            const amountInput = document.getElementById('trade-amount');
            tradeAmount = parseFloat(amountInput.value);
        }
        
        if (isNaN(tradeAmount) || tradeAmount <= 0) {
            this.showAlert('Введите корректную сумму!', 'error');
            document.getElementById('trade-amount').focus();
            return;
        }

        const price = this.state.prices[asset];
        let message = '';

        if (action === 'BUY') {
            const amountBought = tradeAmount / price;
            if (tradeAmount > this.state.balance) {
                this.showAlert('Недостаточно средств на балансе!', 'error');
                return;
            }
            
            this.state.balance -= tradeAmount;
            this.state.portfolio[asset] = (this.state.portfolio[asset] || 0) + amountBought;
            message = `✅ Куплено ${amountBought.toFixed(6)} ${asset} за ${tradeAmount.toFixed(2)} USDT`;
            
        } else {
            if (!this.state.portfolio[asset] || this.state.portfolio[asset] <= 0) {
                this.showAlert(`Недостаточно ${asset} для продажи!`, 'error');
                return;
            }
            
            if (tradeAmount > this.state.portfolio[asset]) {
                this.showAlert(`Нельзя продать больше ${this.state.portfolio[asset].toFixed(6)} ${asset}`, 'error');
                return;
            }
            
            const total = tradeAmount * price;
            this.state.balance += total;
            this.state.portfolio[asset] -= tradeAmount;
            message = `🔴 Продано ${tradeAmount.toFixed(6)} ${asset} за ${total.toFixed(2)} USDT`;
        }

        this.state.history.push({
            type: action,
            asset,
            amount: action === 'BUY' ? tradeAmount / price : tradeAmount,
            price,
            total: tradeAmount,
            timestamp: new Date().toLocaleString()
        });

        this.showAlert(message, action === 'BUY' ? 'success' : 'error');
        this.updateUI();
        this.saveData();
    }

    updateUI() {
        document.getElementById('balance').textContent = this.state.balance.toFixed(2) + ' USDT';
        document.getElementById('btc-amount').textContent = (this.state.portfolio.BTC || 0).toFixed(6);
        document.getElementById('eth-amount').textContent = (this.state.portfolio.ETH || 0).toFixed(6);
        document.getElementById('sol-amount').textContent = (this.state.portfolio.SOL || 0).toFixed(6);
        
        let totalValue = this.state.balance;
        Object.keys(this.state.portfolio).forEach(asset => {
            totalValue += (this.state.portfolio[asset] || 0) * (this.state.prices[asset] || 0);
        });
        document.getElementById('total-value').textContent = totalValue.toFixed(2) + ' USDT';
        
        this.updateHistory();
    }

    updateHistory() {
        const container = document.getElementById('history-items');
        container.innerHTML = '';
        
        if (this.state.history.length === 0) {
            container.innerHTML = '<div class="empty-history">Сделок пока нет</div>';
            return;
        }
        
        this.state.history.slice().reverse().forEach(trade => {
            const item = document.createElement('div');
            item.className = `history-item ${trade.type.toLowerCase()}`;
            item.innerHTML = `
                <div class="trade-type">${trade.type === 'BUY' ? '🟢 Куплено' : '🔴 Продано'} ${trade.asset}</div>
                <div class="trade-details">${trade.amount.toFixed(6)} @ ${trade.price.toFixed(2)}</div>
                <div class="trade-time">${trade.timestamp}</div>
            `;
            container.appendChild(item);
        });
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 4000);
    }

    setupEventListeners() {
        // Торговые кнопки
        document.getElementById('buy-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('BUY', asset);
        });
        
        document.getElementById('sell-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('SELL', asset);
        });

        // Выбор актива и таймфрейма
        document.getElementById('asset-select').addEventListener('change', () => {
            this.loadInitialData();
        });

        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.state.timeframe = e.target.dataset.tf;
                this.loadInitialData();
            });
        });

        // Индикаторы
        document.getElementById('sma-toggle').addEventListener('change', () => {
            this.updateIndicators();
        });

        document.getElementById('ema-toggle').addEventListener('change', () => {
            this.updateIndicators();
        });

        // Горячая клавиша Enter для торговли
        document.getElementById('trade-amount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const asset = document.getElementById('asset-select').value;
                this.executeTrade('BUY', asset);
            }
        });

        // Учитель
        document.getElementById('teacher-btn').addEventListener('click', () => {
            this.toggleTeacherSection();
        });

        document.getElementById('teacher-hint').addEventListener('click', () => {
            this.teacher.giveHint();
        });

        document.getElementById('teacher-analysis').addEventListener('click', () => {
            this.teacher.analyzeMarket();
        });

        document.getElementById('teacher-lesson').addEventListener('click', () => {
            const topics = ['basics', 'indicators', 'risk'];
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];
            this.teacher.startLesson(randomTopic);
        });

        // Калькулятор риска
        document.getElementById('calculate-risk').addEventListener('click', () => {
            this.riskCalculator.calculate();
        });

        // Создание ордеров
        document.getElementById('create-order-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            const orderType = document.getElementById('order-type').value;
            const triggerPrice = parseFloat(document.getElementById('order-price').value);
            const amount = parseFloat(document.getElementById('order-amount').value);
            
            if (!triggerPrice || !amount) {
                this.showAlert('Заполните все поля для создания ордера!', 'error');
                return;
            }
            
            const tradeType = orderType === 'STOP' ? 'SELL' : 'BUY';
            this.orderManager.createOrder(tradeType, asset, amount, triggerPrice, orderType);
        });

        // Сохранение данных
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    toggleTeacherSection() {
        const section = document.getElementById('teacher-section');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
