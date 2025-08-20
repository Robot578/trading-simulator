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
        
        this.teacherKnowledge = {
            basics: [
                {
                    question: "что такое свечной график",
                    answer: "📊 Свечной график показывает движение цены за период. Каждая свеча состоит из тела (разница между открытием и закрытием) и теней (максимум и минимум периода). Зеленая свеча = рост цены, красная = падение."
                },
                {
                    question: "как читать свечи",
                    answer: "🔍 Чтение свечей: верх тени = максимум, низ тени = минимум, тело = разница открытия/закрытия. Длинное тело = сильное движение, маленькое тело = нерешительность рынка. Длинные верхние тени = продавцы активны, длинные нижние = покупатели активны."
                },
                {
                    question: "что такое long и short",
                    answer: "🎯 LONG (лонг) - покупка актива в расчете на рост цены. SHORT (шорт) - продажа актива в расчете на падение цены. Лонг прибылен при росте, шорт - при падении."
                },
                {
                    question: "что такое волатильность",
                    answer: "🌊 Волатильность - это степень изменения цены актива. Высокая волатильность означает большие колебания цены, что создает как возможности для прибыли, так и риски. Низкая волатильность - спокойный рынок с малыми движениями."
                }
            ],
            analysis: [
                {
                    question: "что такое sma",
                    answer: "📈 SMA (Simple Moving Average) - простая скользящая средняя. Показывает среднюю цену за период. Например, SMA20 = средняя цена за 20 периодов. Цена выше SMA = восходящий тренд, ниже = нисходящий."
                },
                {
                    question: "зачем нужна ema",
                    answer: "⚡ EMA (Exponential Moving Average) - экспоненциальная скользящая средняя. Более чувствительна к последним ценам, быстрее реагирует на изменения тренда. Лучше подходит для краткосрочной торговли."
                },
                {
                    question: "как определить тренд",
                    answer: "🔍 Тренд определяется по последовательным максимумам и минимумам. Восходящий тренд: каждый следующий максимум и минимум выше предыдущего. Нисходящий: каждый следующий максимум и минимум ниже предыдущего."
                },
                {
                    question: "что такое поддержка и сопротивление",
                    answer: "⚖️ Поддержка - уровень, где цена часто останавливает падение и разворачивается вверх. Сопротивление - уровень, где цена останавливает рост и разворачивается вниз. Пробой этих уровней часто приводит к сильным движениям."
                }
            ],
            strategies: [
                {
                    question: "какие стратегии бывают",
                    answer: "🎯 Основные стратегии: 1) Трендовая - следуем за трендом 2) От уровней - покупаем у поддержки, продаем у сопротивления 3) Пробойная - торгуем пробой уровней 4) Скальпинг - много быстрых сделок"
                },
                {
                    question: "как торговать по тренду",
                    answer: "📈 Торговля по тренду: определяем направление тренда, ждем отката к скользящим средним или уровням поддержки/сопротивления, входим в направлении тренда. Стоп-лосс за последним локальным минимумом/максимумом."
                },
                {
                    question: "что такое скальпинг",
                    answer: "⚡ Скальпинг - стиль торговли с очень короткими сделками (от секунд до минут). Используются малые таймфреймы (1-5 минут). Прибыль небольшая, но много сделок. Требует высокой дисциплины и быстрой реакции."
                }
            ],
            risks: [
                {
                    question: "как управлять рисками",
                    answer: "⚠️ Управление рисками: 1) Рискуй не более 1-2% депозита в сделке 2) Всегда используй стоп-лосс 3) Соотношение риск/прибыль минимум 1:3 4) Диверсифицируй портфель 5) Торгуй по плану, а не эмоциям"
                },
                {
                    question: "что такое стоп лосс",
                    answer: "🛑 Стоп-лосс - приказ на автоматическое закрытие сделки при достижении определенной цены. Например, купил по $100, стоп-лосс на $95. Защищает от больших убытков при неправильном прогнозе."
                },
                {
                    question: "сколько рисковать",
                    answer: "💰 В одной сделке рисковать не более 1-2% от депозита. При депозите $1000 - максимум $10-20 убытка на сделку. Это позволяет пережить серию неудачных сделок."
                },
                {
                    question: "что такое диверсификация",
                    answer: "⚖️ Диверсификация - распределение капитала между разными активами. Не вкладывай все в один актив. Это снижает общие риски - если один актив падает, другие могут расти."
                }
            ]
        };

        this.init();
    }

    async init() {
        await this.loadSavedData();
        this.initChart();
        this.setupEventListeners();
        await this.loadInitialData();
        this.updateUI();
        this.setupTeacherPanel();
        this.setupChat();
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

    setupTeacherPanel() {
        document.getElementById('teacher-btn').addEventListener('click', () => {
            this.showTeacherPanel();
        });

        document.getElementById('close-teacher').addEventListener('click', () => {
            this.hideTeacherPanel();
        });

        document.getElementById('teacher-overlay').addEventListener('click', () => {
            this.hideTeacherPanel();
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTeacherTab(tabName);
            });
        });
    }

    setupChat() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');
        const quickQuestionButtons = document.querySelectorAll('.quick-question-btn');

        sendButton.addEventListener('click', () => {
            this.sendChatMessage();
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        quickQuestionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.dataset.question;
                chatInput.value = question;
                this.sendChatMessage();
            });
        });
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();

        if (!message) return;

        this.addChatMessage(message, 'user');

        const answer = this.findAnswer(message);
        
        setTimeout(() => {
            this.addChatMessage(answer, 'teacher');
        }, 1000);

        chatInput.value = '';
    }

    addChatMessage(text, sender) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-avatar">${sender === 'teacher' ? '🎓' : '👤'}</div>
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    findAnswer(question) {
        const lowerQuestion = question.toLowerCase();

        for (const category in this.teacherKnowledge) {
            for (const item of this.teacherKnowledge[category]) {
                if (lowerQuestion.includes(item.question) || item.question.includes(lowerQuestion)) {
                    return item.answer;
                }
            }
        }

        const defaultAnswers = [
            "🤔 Интересный вопрос! В трейдинге важно помнить, что успех приходит с опытом и дисциплиной. Начните с изучения основ и всегда торгуйте по плану.",
            "💡 Хороший вопрос! Основное правило: никогда не рискуйте больше, чем можете позволить себе потерять. Управление рисками - ключ к долгосрочному успеху.",
            "🎯 Важный момент! Помните, что эмоции - главный враг трейдера. Торгуйте по системе, а не под влиянием настроения.",
            "📚 Отличный вопрос для начинающего! Рекомендую начать с изучения технического анализа: свечные паттерны, поддержка/сопротивление, скользящие средние.",
            "⚡ В трейдинге важно постоянно учиться. Начните с демо-счета, изучите анализ, разработайте стратегию и только потом переходите на реальные деньги."
        ];

        return defaultAnswers[Math.floor(Math.random() * defaultAnswers.length)];
    }

    showTeacherPanel() {
        document.getElementById('teacher-panel').classList.add('active');
        document.getElementById('teacher-overlay').classList.add('active');
    }

    hideTeacherPanel() {
        document.getElementById('teacher-panel').classList.remove('active');
        document.getElementById('teacher-overlay').classList.remove('active');
    }

    switchTeacherTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-content`).classList.add('active');
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

    executeTrade(action, asset, amount = null) {
        const amountInput = document.getElementById('trade-amount');
        let tradeAmount = amount;
        
        if (tradeAmount === null) {
            tradeAmount = parseFloat(amountInput.value);
        }
        
        if (isNaN(tradeAmount) || tradeAmount <= 0) {
            this.showAlert('Введите корректную сумму!', 'error');
            amountInput.focus();
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
            
            if (amount === null && tradeAmount >= this.state.portfolio[asset]) {
                tradeAmount = this.state.portfolio[asset];
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
            amount: tradeAmount,
            price,
            total: action === 'BUY' ? tradeAmount : tradeAmount * price,
            timestamp: new Date().toLocaleString()
        });

        this.showAlert(message, action === 'BUY' ? 'success' : 'error');
        this.updateUI();
        this.saveData();
    }

    sellAllAssets() {
        const asset = document.getElementById('asset-select').value;
        const assetAmount = this.state.portfolio[asset] || 0;
        
        if (assetAmount <= 0) {
            this.showAlert(`У вас нет ${asset} для продажи!`, 'error');
            return;
        }

        this.executeTrade('SELL', asset, assetAmount);
    }

    setMaxBuyAmount() {
        const asset = document.getElementById('asset-select').value;
        document.getElementById('trade-amount').value = this.state.balance.toFixed(2);
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

        document.getElementById('sell-all-btn').addEventListener('click', () => {
            this.sellAllAssets();
        });

        document.getElementById('max-buy-btn').addEventListener('click', () => {
            this.setMaxBuyAmount();
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
