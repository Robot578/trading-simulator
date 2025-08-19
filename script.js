class TradingApp {
    constructor() {
        this.state = {
            balance: 100,
            portfolio: { BTC: 0, ETH: 0, SOL: 0 },
            prices: { BTC: 0, ETH: 0, SOL: 0 },
            history: [],
            chart: null,
            candleSeries: null,
            smaSeries: null,
            emaSeries: null,
            socket: null,
            candles: [],
            currentAsset: 'BTC',
            timeframe: '1h'
        };

        this.tg = window.Telegram?.WebApp;
        
        this.tutor = {
            active: true,
            level: 'beginner',
            lastAdviceTime: 0,
            adviceCooldown: 30000
        };

        this.init();
    }

    async init() {
        await this.loadSavedData();
        this.initChart();
        this.setupEventListeners();
        await this.loadInitialData();
        this.updateUI();
        this.showWelcomeTooltip();
        this.initTutor();
    }

    async loadSavedData() {
        try {
            if (this.tg?.CloudStorage) {
                const keys = ['balance', 'portfolio', 'history', 'prices'];
                
                for (const key of keys) {
                    this.tg.CloudStorage.getItem(key, (err, data) => {
                        if (!err && data) {
                            try {
                                this.state[key] = JSON.parse(data);
                            } catch (e) {
                                console.error('Error parsing saved data:', e);
                            }
                        }
                    });
                }
            }
            
            const savedBalance = localStorage.getItem('tradeBalance');
            const savedPortfolio = localStorage.getItem('tradePortfolio');
            const savedHistory = localStorage.getItem('tradeHistory');
            const savedPrices = localStorage.getItem('tradePrices');

            if (savedBalance) this.state.balance = parseFloat(savedBalance);
            if (savedPortfolio) this.state.portfolio = JSON.parse(savedPortfolio);
            if (savedHistory) this.state.history = JSON.parse(savedHistory);
            if (savedPrices) this.state.prices = JSON.parse(savedPrices);

        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    async saveData() {
        try {
            const dataToSave = {
                balance: this.state.balance,
                portfolio: this.state.portfolio,
                history: this.state.history,
                prices: this.state.prices
            };

            if (this.tg?.CloudStorage) {
                Object.keys(dataToSave).forEach(key => {
                    this.tg.CloudStorage.setItem(key, JSON.stringify(dataToSave[key]), (err) => {
                        if (err) {
                            this.saveToLocalStorage(dataToSave);
                        }
                    });
                });
            } else {
                this.saveToLocalStorage(dataToSave);
            }

        } catch (error) {
            console.error('Error saving data:', error);
            this.saveToLocalStorage({
                balance: this.state.balance,
                portfolio: this.state.portfolio,
                history: this.state.history,
                prices: this.state.prices
            });
        }
    }

    saveToLocalStorage(data) {
        localStorage.setItem('tradeBalance', data.balance.toString());
        localStorage.setItem('tradePortfolio', JSON.stringify(data.portfolio));
        localStorage.setItem('tradeHistory', JSON.stringify(data.history));
        localStorage.setItem('tradePrices', JSON.stringify(data.prices));
    }

    initTutor() {
        this.createTutorUI();
        this.startTutorMonitoring();
    }

    createTutorUI() {
        const tutorHTML = `
            <div class="tutor-container" id="tutor-container">
                <div class="tutor-header">
                    <span>🤖 Trade Mentor</span>
                    <button class="tutor-toggle" id="tutor-toggle">▲</button>
                </div>
                <div class="tutor-content" id="tutor-content">
                    <div class="tutor-message" id="tutor-message">
                        Привет! Я помогу тебе разобраться в трейдинге. Следи за моими подсказками!
                    </div>
                    <div class="tutor-controls">
                        <button class="tutor-btn" id="tutor-hide">Скрыть</button>
                        <button class="tutor-btn" id="tutor-mute">🔇</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', tutorHTML);
        this.setupTutorEvents();
    }

    setupTutorEvents() {
        document.getElementById('tutor-toggle').addEventListener('click', () => {
            this.toggleTutor();
        });

        document.getElementById('tutor-hide').addEventListener('click', () => {
            this.hideTutor();
        });

        document.getElementById('tutor-mute').addEventListener('click', () => {
            this.toggleMuteTutor();
        });
    }

    toggleTutor() {
        const content = document.getElementById('tutor-content');
        const toggleBtn = document.getElementById('tutor-toggle');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleBtn.textContent = '▲';
        } else {
            content.style.display = 'none';
            toggleBtn.textContent = '▼';
        }
    }

    hideTutor() {
        document.getElementById('tutor-container').style.display = 'none';
    }

    toggleMuteTutor() {
        this.tutor.active = !this.tutor.active;
        const muteBtn = document.getElementById('tutor-mute');
        muteBtn.textContent = this.tutor.active ? '🔇' : '🔊';
        
        this.showTutorMessage(this.tutor.active ? 
            'Подсказки включены! Буду помогать в обучении.' : 
            'Подсказки отключены. Нажмите 🔊 чтобы включить.'
        );
    }

    startTutorMonitoring() {
        setInterval(() => {
            this.checkForAdviceOpportunities();
        }, 5000);
    }

    checkForAdviceOpportunities() {
        if (!this.tutor.active) return;
        
        const now = Date.now();
        if (now - this.tutor.lastAdviceTime < this.tutor.adviceCooldown) return;

        const situations = [
            this.checkChartPatterns.bind(this),
            this.checkTradingMistakes.bind(this),
            this.checkIndicatorSignals.bind(this),
            this.checkMarketConditions.bind(this),
            this.checkPortfolioDiversity.bind(this)
        ];

        for (const situation of situations) {
            const advice = situation();
            if (advice) {
                this.showTutorMessage(advice);
                this.tutor.lastAdviceTime = now;
                break;
            }
        }
    }

    checkChartPatterns() {
        if (!this.state.candles || this.state.candles.length < 10) return null;

        const lastCandles = this.state.candles.slice(-5);
        const trends = this.analyzeTrend(lastCandles);

        if (trends.isStrongUptrend) {
            return "📈 Сильный восходящий тренд! Рассмотри возможность покупки на откатах.";
        }

        if (trends.isStrongDowntrend) {
            return "📉 Сильный нисходящий тренд! Будь осторожен с покупками.";
        }

        if (this.isConsolidationPattern(lastCandles)) {
            return "⚖️ Цена в консолидации. Ожидай пробой в любую сторону перед входом в сделку.";
        }

        return null;
    }

    checkTradingMistakes() {
        if (this.state.history.length === 0) return null;

        const lastTrades = this.state.history.slice(-3);
        const losses = lastTrades.filter(trade => {
            const currentPrice = this.state.prices[trade.asset];
            return trade.type === 'BUY' && currentPrice < trade.price;
        });

        if (losses.length >= 2) {
            return "⚠️ Несколько убыточных сделок подряд! Пересмотри свою стратегию и используй стоп-лоссы.";
        }

        const largeTrades = lastTrades.filter(trade => trade.amount > this.state.balance * 0.3);
        if (largeTrades.length > 0) {
            return "💰 Не рискуй более 30% депозита в одной сделке! Управление рисками - ключ к успеху.";
        }

        return null;
    }

    checkIndicatorSignals() {
        if (!this.state.candles || this.state.candles.length < 20) return null;

        const closes = this.state.candles.map(c => c.close);
        
        if (document.getElementById('sma-toggle').checked) {
            const sma = this.calculateSMA(closes, 20);
            const currentClose = closes[closes.length - 1];
            const currentSMA = sma[sma.length - 1].value;

            if (currentClose > currentSMA * 1.02) {
                return "🚀 Цена выше SMA20 - бычий сигнал! Но помни про перекупленность.";
            }

            if (currentClose < currentSMA * 0.98) {
                return "🐻 Цена ниже SMA20 - медвежий сигнал! Ищи подтверждения для продажи.";
            }
        }

        return null;
    }

    checkMarketConditions() {
        const volume = parseFloat(document.getElementById('volume-24h').textContent);
        const change = parseFloat(document.getElementById('change-24h').textContent);

        if (volume > 1000000 && Math.abs(change) > 5) {
            return "🌊 Высокая волатильность! Рынок активен - больше возможностей, но и больше рисков.";
        }

        if (volume < 100000 && Math.abs(change) < 1) {
            return "😴 Низкая волатильность. Рынок спокоен - возможно, лучше подождать более активной фазы.";
        }

        return null;
    }

    checkPortfolioDiversity() {
        const totalValue = parseFloat(document.getElementById('total-value').textContent);
        if (totalValue <= 100) return null;

        const btcValue = (this.state.portfolio.BTC || 0) * (this.state.prices.BTC || 0);
        const btcPercentage = (btcValue / totalValue) * 100;

        if (btcPercentage > 70) {
            return "⚖️ Твой портфель сильно завязан на BTC! Рассмотри диверсификацию в другие активы.";
        }

        return null;
    }

    showTutorMessage(message) {
        const messageElement = document.getElementById('tutor-message');
        messageElement.textContent = message;
        
        const container = document.getElementById('tutor-container');
        container.style.animation = 'pulse 1s';
        setTimeout(() => container.style.animation = '', 1000);
    }

    analyzeTrend(candles) {
        const changes = [];
        for (let i = 1; i < candles.length; i++) {
            changes.push(((candles[i].close - candles[i-1].close) / candles[i-1].close) * 100);
        }

        const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
        const positiveChanges = changes.filter(change => change > 0).length;

        return {
            isStrongUptrend: avgChange > 0.5 && positiveChanges > changes.length * 0.7,
            isStrongDowntrend: avgChange < -0.5 && positiveChanges < changes.length * 0.3,
            avgChange: avgChange
        };
    }

    isConsolidationPattern(candles) {
        const highs = candles.map(c => c.high);
        const lows = candles.map(c => c.low);
        
        const maxHigh = Math.max(...highs);
        const minLow = Math.min(...lows);
        const range = maxHigh - minLow;
        
        const avgPrice = candles.reduce((sum, c) => sum + c.close, 0) / candles.length;
        return range < avgPrice * 0.02;
    }

    showWelcomeTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <h4>🎯 Добро пожаловать в TradeLearn!</h4>
                <p>Это безопасная среда для обучения трейдингу. Торгуйте виртуальными деньгами и изучайте рынок!</p>
                <p><strong>Ваш прогресс автоматически сохраняется!</strong></p>
            </div>
        `;
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
            tooltip.style.display = 'block';
            setTimeout(() => tooltip.remove(), 8000);
        }, 1000);
    }

    initChart() {
        const chartContainer = document.getElementById('candleChart');
        chartContainer.innerHTML = '';

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
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal
            }
        });

        this.state.candleSeries = this.state.chart.addCandlestickSeries({
            upColor: '#00c853',
            downColor: '#ff1744',
            borderDownColor: '#ff1744',
            borderUpColor: '#00c853',
            wickDownColor: '#ff1744',
            wickUpColor: '#00c853',
            borderVisible: true,
            wickVisible: true
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
        }
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

        this.state.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);

        this.state.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const price = parseFloat(data.c);
                const change = parseFloat(data.P);
                const volume = parseFloat(data.v);

                this.state.prices[asset] = price;
                
                document.getElementById('current-price').textContent = price.toFixed(2);
                document.getElementById('price-change').textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                document.getElementById('price-change').style.color = change >= 0 ? '#00c853' : '#ff1744';
                
                document.getElementById('volume-24h').textContent = volume.toFixed(0);
                
            } catch (error) {
                console.error("Ошибка обработки WebSocket сообщения:", error);
            }
        };
    }

    executeTrade(action, asset) {
        const amountInput = document.getElementById('trade-amount');
        const amount = parseFloat(amountInput.value);
        
        if (isNaN(amount) || amount <= 0) {
            this.showAlert('Введите корректную сумму!', 'error');
            amountInput.focus();
            return;
        }

        const price = this.state.prices[asset];
        let message = '';

        if (action === 'BUY') {
            const amountBought = amount / price;
            if (amount > this.state.balance) {
                this.showAlert('Недостаточно средств на балансе!', 'error');
                return;
            }
            
            this.state.balance -= amount;
            this.state.portfolio[asset] = (this.state.portfolio[asset] || 0) + amountBought;
            message = `✅ Куплено ${amountBought.toFixed(6)} ${asset} за ${amount.toFixed(2)} USDT`;
            
        } else {
            if (!this.state.portfolio[asset] || this.state.portfolio[asset] <= 0) {
                this.showAlert(`Недостаточно ${asset} для продажи!`, 'error');
                return;
            }
            
            if (amount > this.state.portfolio[asset]) {
                this.showAlert(`Нельзя продать больше ${this.state.portfolio[asset].toFixed(6)} ${asset}`, 'error');
                return;
            }
            
            const total = amount * price;
            this.state.balance += total;
            this.state.portfolio[asset] -= amount;
            message = `🔴 Продано ${amount.toFixed(6)} ${asset} за ${total.toFixed(2)} USDT`;
        }

        this.state.history.push({
            type: action,
            asset,
            amount,
            price,
            total: action === 'BUY' ? amount : amount * price,
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
            background: ${type === 'success' ? '#00c853' : type === 'error' ? '#ff1744' : '#2962ff'};
        `;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 4000);
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

        document.getElementById('sma-toggle').addEventListener('change', () => {
            this.updateIndicators();
        });

        document.getElementById('ema-toggle').addEventListener('change', () => {
            this.updateIndicators();
        });

        document.getElementById('trade-amount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const asset = document.getElementById('asset-select').value;
                this.executeTrade('BUY', asset);
            }
        });

        window.addEventListener('beforeunload', () => {
            this.saveData();
        });

        if (this.tg) {
            this.tg.onEvent('viewportChanged', (e) => {
                if (!e.isExpanded) {
                    this.saveData();
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
