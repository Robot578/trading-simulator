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
            ],
            psychology: [
                "Эмоции - главный враг трейдера. Действуй по плану.",
                "Жадность и страх часто приводят к убыточным сделкам.",
                "Веди дневник трейдера для анализа своих решений.",
                "Не пытайся отыграться после убыточной сделки.",
                "Терпение - ключевое качество успешного трейдера."
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

        // RSI simulation
        const rsi = this.calculateRSI(prices);
        analysis += `RSI: ${rsi.toFixed(2)}\n`;
        if (rsi > 70) {
            analysis += "⚠️ RSI > 70 - возможна перекупленность\n";
        } else if (rsi < 30) {
            analysis += "⚠️ RSI < 30 - возможна перепроданность\n";
        }

        return analysis;
    }

    calculateSMA(data, period) {
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
    }

    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;
        
        const changes = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i-1]);
        }
        
        const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0);
        const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0));
        
        if (losses === 0) return 100;
        const rs = gains / losses;
        return 100 - (100 / (1 + rs));
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
            risk: "Управление рисками",
            psychology: "Психология трейдинга"
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
    }
}

class AchievementSystem {
    constructor() {
        this.achievements = [
            {
                id: 'first_trade',
                title: 'Первая сделка',
                description: 'Совершите вашу первую торговую операцию',
                icon: '🎯',
                unlocked: false
            },
            {
                id: 'profit_10',
                title: 'Профит +10%',
                description: 'Достигните общей прибыли +10% от депозита',
                icon: '💰',
                unlocked: false
            },
            {
                id: 'diversification',
                title: 'Диверсификация',
                description: 'Торгуйте тремя разными активами',
                icon: '🌐',
                unlocked: false
            },
            {
                id: 'risk_manager',
                title: 'Управление рисками',
                description: 'Используйте калькулятор риска для 5 сделок',
                icon: '🛡️',
                unlocked: false
            },
            {
                id: 'learning_complete',
                title: 'Ученик трейдинга',
                description: 'Пройдите все уроки в разделе обучения',
                icon: '🎓',
                unlocked: false
            },
            {
                id: 'consistency',
                title: 'Последовательность',
                description: 'Совершите 10 сделок без серьезных убытков',
                icon: '📈',
                unlocked: false
            }
        ];
        this.riskCalculatorUses = 0;
    }

    checkAchievements(tradingApp) {
        this.checkFirstTrade(tradingApp);
        this.checkProfitAchievement(tradingApp);
        this.checkDiversification(tradingApp);
        this.checkRiskManager();
        this.checkLearningComplete();
        this.checkConsistency(tradingApp);
        this.saveAchievements();
        this.displayAchievements();
    }

    checkFirstTrade(tradingApp) {
        if (tradingApp.state.history.length > 0) {
            this.unlockAchievement('first_trade');
        }
    }

    checkProfitAchievement(tradingApp) {
        const totalValue = this.calculateTotalValue(tradingApp);
        const initialDeposit = 100;
        const profitPercent = ((totalValue - initialDeposit) / initialDeposit) * 100;
        
        if (profitPercent >= 10) {
            this.unlockAchievement('profit_10');
        }
    }

    checkDiversification(tradingApp) {
        const tradedAssets = new Set(tradingApp.state.history.map(trade => trade.asset));
        if (tradedAssets.size >= 3) {
            this.unlockAchievement('diversification');
        }
    }

    checkRiskManager() {
        if (this.riskCalculatorUses >= 5) {
            this.unlockAchievement('risk_manager');
        }
    }

    checkLearningComplete() {
        const lessonsCompleted = localStorage.getItem('lessons_completed');
        if (lessonsCompleted) {
            this.unlockAchievement('learning_complete');
        }
    }

    checkConsistency(tradingApp) {
        if (tradingApp.state.history.length >= 10) {
            const last10Trades = tradingApp.state.history.slice(-10);
            const profitableTrades = last10Trades.filter(trade => {
                const isBuy = trade.type === 'BUY';
                const currentPrice = tradingApp.state.prices[trade.asset] || trade.price;
                const profit = isBuy ? (currentPrice - trade.price) / trade.price : (trade.price - currentPrice) / trade.price;
                return profit > -0.05; // Не более 5% убытка
            });
            
            if (profitableTrades.length >= 8) {
                this.unlockAchievement('consistency');
            }
        }
    }

    incrementRiskCalculatorUses() {
        this.riskCalculatorUses++;
        localStorage.setItem('risk_calculator_uses', this.riskCalculatorUses);
        this.checkRiskManager();
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.showAchievementNotification(achievement);
            return true;
        }
        return false;
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'alert';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 20px;
            border-radius: 16px;
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #2c3e50;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
            animation: slideIn 0.3s ease;
            text-align: center;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 8px;">${achievement.icon}</div>
            <div style="font-weight: 600; margin-bottom: 4px; font-size: 1.1rem;">${achievement.title}</div>
            <div style="font-size: 0.9rem;">${achievement.description}</div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    displayAchievements() {
        const container = document.getElementById('achievements-container');
        if (!container) return;

        container.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `).join('');
    }

    calculateTotalValue(tradingApp) {
        let totalValue = tradingApp.state.balance;
        Object.keys(tradingApp.state.portfolio).forEach(asset => {
            totalValue += (tradingApp.state.portfolio[asset] || 0) * (tradingApp.state.prices[asset] || 0);
        });
        return totalValue;
    }

    saveAchievements() {
        const achievementsData = this.achievements.map(a => ({
            id: a.id,
            unlocked: a.unlocked
        }));
        localStorage.setItem('achievements', JSON.stringify(achievementsData));
        localStorage.setItem('risk_calculator_uses', this.riskCalculatorUses);
    }

    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            const achievementsData = JSON.parse(saved);
            achievementsData.forEach(savedAchievement => {
                const achievement = this.achievements.find(a => a.id === savedAchievement.id);
                if (achievement) {
                    achievement.unlocked = savedAchievement.unlocked;
                }
            });
        }
        
        const riskUses = localStorage.getItem('risk_calculator_uses');
        if (riskUses) {
            this.riskCalculatorUses = parseInt(riskUses);
        }
    }
}

class TradingJournal {
    constructor(tradingApp) {
        this.tradingApp = tradingApp;
    }

    updateStats() {
        const trades = this.tradingApp.state.history;
        const totalTrades = trades.length;
        
        if (totalTrades === 0) {
            this.resetStats();
            return;
        }

        const profitableTrades = trades.filter(trade => {
            // Упрощенный расчет прибыльности
            const isBuy = trade.type === 'BUY';
            const currentPrice = this.tradingApp.state.prices[trade.asset] || trade.price;
            return isBuy ? currentPrice > trade.price : currentPrice < trade.price;
        });

        const winRate = Math.round((profitableTrades.length / totalTrades) * 100);
        const profitTrades = profitableTrades.map(trade => Math.abs(trade.total));
        const lossTrades = trades.filter(trade => !profitableTrades.includes(trade)).map(trade => Math.abs(trade.total));

        const avgProfit = profitTrades.length > 0 ? profitTrades.reduce((a, b) => a + b, 0) / profitTrades.length : 0;
        const avgLoss = lossTrades.length > 0 ? lossTrades.reduce((a, b) => a + b, 0) / lossTrades.length : 0;

        document.getElementById('total-trades').querySelector('.stat-value').textContent = totalTrades;
        document.getElementById('win-rate').querySelector('.stat-value').textContent = winRate + '%';
        document.getElementById('avg-profit').querySelector('.stat-value').textContent = avgProfit.toFixed(2);
        document.getElementById('avg-loss').querySelector('.stat-value').textContent = avgLoss.toFixed(2);

        // Добавляем классы для цветового оформления
        document.getElementById('win-rate').className = `journal-stat ${winRate >= 50 ? 'positive' : 'negative'}`;
        document.getElementById('avg-profit').className = 'journal-stat positive';
        document.getElementById('avg-loss').className = 'journal-stat negative';
    }

    resetStats() {
        document.getElementById('total-trades').querySelector('.stat-value').textContent = '0';
        document.getElementById('win-rate').querySelector('.stat-value').textContent = '0%';
        document.getElementById('avg-profit').querySelector('.stat-value').textContent = '0.00';
        document.getElementById('avg-loss').querySelector('.stat-value').textContent = '0.00';
        
        document.getElementById('win-rate').className = 'journal-stat';
        document.getElementById('avg-profit').className = 'journal-stat';
        document.getElementById('avg-loss').className = 'journal-stat';
    }
}

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

        this.teacher = new TradingTeacher(this);
        this.riskCalculator = new RiskCalculator(this);
        this.achievementSystem = new AchievementSystem();
        this.tradingJournal = new TradingJournal(this);
        this.tg = window.Telegram?.WebApp;
        
        this.init();
    }

    async init() {
        await this.loadSavedData();
        this.achievementSystem.loadAchievements();
        this.initChart();
        this.setupEventListeners();
        await this.loadInitialData();
        this.updateUI();
        this.achievementSystem.displayAchievements();
        this.tradingJournal.updateStats();
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

    executeTrade(action, asset, isMaxTrade = false) {
        const amountInput = document.getElementById('trade-amount');
        let amount = parseFloat(amountInput.value);
        
        if (isMaxTrade) {
            if (action === 'BUY') {
                amount = this.state.balance;
            } else {
                amount = this.state.portfolio[asset] || 0;
            }
        }
        
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
        this.achievementSystem.checkAchievements(this);
        this.tradingJournal.updateStats();
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

        document.getElementById('buy-max-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('BUY', asset, true);
        });
        
        document.getElementById('sell-max-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('SELL', asset, true);
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

        // Обработчики для учителя
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
            this.toggleLessonsList();
        });

        document.getElementById('start-lesson').addEventListener('click', () => {
            const topic = document.getElementById('lesson-select').value;
            this.teacher.startLesson(topic);
        });

        // Обработчики для калькулятора риска
        document.getElementById('calculate-risk').addEventListener('click', () => {
            this.riskCalculator.calculate();
            this.achievementSystem.incrementRiskCalculatorUses();
        });

        // Автозаполнение цены входа и стоп-лосса
        document.getElementById('risk-entry').addEventListener('focus', () => {
            const currentPrice = this.state.prices[this.state.currentAsset];
            document.getElementById('risk-entry').value = currentPrice.toFixed(2);
        });

        document.getElementById('risk-stop').addEventListener('focus', () => {
            const currentPrice = this.state.prices[this.state.currentAsset];
            const stopPrice = currentPrice * 0.98;
            document.getElementById('risk-stop').value = stopPrice.toFixed(2);
        });

        // Обработчик для дневника трейдера
        document.getElementById('show-journal').addEventListener('click', () => {
            this.showJournalDetails();
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

    toggleTeacherSection() {
        const section = document.getElementById('teacher-section');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }

    toggleLessonsList() {
        const lessons = document.getElementById('teacher-lessons');
        lessons.style.display = lessons.style.display === 'none' ? 'block' : 'none';
    }

    showJournalDetails() {
        const trades = this.state.history;
        if (trades.length === 0) {
            this.showAlert('Нет данных для анализа! Совершите несколько сделок.', 'info');
            return;
        }

        let message = '📊 Детальная статистика:\n\n';
        message += `Всего сделок: ${trades.length}\n`;
        
        const profitableTrades = trades.filter(trade => {
            const isBuy = trade.type === 'BUY';
            const currentPrice = this.state.prices[trade.asset] || trade.price;
            return isBuy ? currentPrice > trade.price : currentPrice < trade.price;
        });

        const winRate = Math.round((profitableTrades.length / trades.length) * 100);
        message += `Процент побед: ${winRate}%\n`;

        const totalProfit = profitableTrades.reduce((sum, trade) => sum + Math.abs(trade.total), 0);
        const totalLoss = trades.filter(trade => !profitableTrades.includes(trade))
                               .reduce((sum, trade) => sum + Math.abs(trade.total), 0);
        
        message += `Общая прибыль: ${totalProfit.toFixed(2)} USDT\n`;
        message += `Общий убыток: ${totalLoss.toFixed(2)} USDT\n`;
        message += `Чистая прибыль: ${(totalProfit - totalLoss).toFixed(2)} USDT\n`;

        this.showAlert(message, totalProfit > totalLoss ? 'success' : 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
