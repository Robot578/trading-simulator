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
        
        this.termsDictionary = {
            sma: {
                name: "SMA (Simple Moving Average)",
                definition: "Простая скользящая средняя - это средняя цена актива за определенный период времени.",                usage: "Используется для определения направления тренда и уровней поддержки/сопротивления.",
                example: "SMA(20) часто используется для определения краткосрочного тренда."
            },
            ema: {
                name: "EMA (Exponential Moving Average)",
                definition: "Экспоненциальная скользящая средняя - похожа на SMA, но придает больший вес последним ценам.",
                usage: "Быстрее реагирует на изменения цены по сравнению с SMA.",
                example: "Когда быстрая EMA пересекает медленную EMA снизу вверх - это бычий сигнал."
            },
            rsi: {
                name: "RSI (Relative Strength Index)",
                definition: "Индекс относительной силы - осциллятор, измеряющий скорость и изменение ценовых движений.",
                usage: "Используется для идентификации перекупленности (выше 70) и перепроданности (ниже 30).",
                example: "Если RSI падает ниже 30, это может сигнализировать о возможном отскоке цены вверх."
            },
            stoploss: {
                name: "Stop-Loss (Стоп-лосс)",
                definition: "Ордер, который автоматически закрывает позицию при достижении определенной цены.",
                usage: "Обязательный инструмент управления рисками для ограничения убытков.",
                example: "Если вы купили по $50,000, можно установить стоп-лосс на $48,000."
            }
        };
        
        this.analysisCache = {
            lastCalculation: 0,
            cacheDuration: 30000,
            data: null
        };
    }

    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('teacher-message');
        messageEl.textContent = message;
        messageEl.className = `teacher-message ${type}`;
        
        setTimeout(() => {
            if (messageEl.textContent === message) {
                messageEl.textContent = '';
                messageEl.className = 'teacher-message';
            }
        }, 10000);
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
        
        const now = Date.now();
        if (this.analysisCache.data && now - this.analysisCache.lastCalculation < this.analysisCache.cacheDuration) {
            this.showMessage(this.analysisCache.data, 'analysis');
            return;
        }
        
        const analysis = this.performTechnicalAnalysis(prices, volume);
        
        this.analysisCache.data = analysis;
        this.analysisCache.lastCalculation = now;
        
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
        if (data.length < period) return 0;
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
            risk: "Управление рисками"
        };
        return names[topic] || topic;
    }

    explainTerm(termKey) {
        const term = this.termsDictionary[termKey];
        if (!term) {
            this.showMessage(`Термин "${termKey}" не найден в словаре.`, 'error');
            return;
        }

        let message = `📖 ${term.name}\n\n`;
        message += `📝 Определение: ${term.definition}\n\n`;
        message += `🎯 Использование: ${term.usage}\n\n`;
        message += `💡 Пример: ${term.example}`;

        this.showMessage(message, 'lesson');
    }

    showDictionary() {
        const dictionaryEl = document.getElementById('teacher-dictionary');
        dictionaryEl.style.display = dictionaryEl.style.display === 'none' ? 'block' : 'none';
    }

    addInteractiveTips() {
        const chart = this.tradingApp.state.chart;
        if (!chart) return;
        
        const tooltip = document.getElementById('chart-tooltip');
        
        chart.subscribeCrosshairMove(param => {
            if (!param.time || !param.point) {
                tooltip.style.display = 'none';
                return;
            }
            
            const candle = this.tradingApp.state.candles.find(c => c.time === param.time);
            if (candle && this.isSupportResistanceLevel(candle.close)) {
                tooltip.innerHTML = "📌 Возможный уровень поддержки/сопротивления";
                tooltip.style.display = 'block';
                tooltip.style.left = param.point.x + 'px';
                tooltip.style.top = (param.point.y - 50) + 'px';
            } else {
                tooltip.style.display = 'none';
            }
        });
    }

    isSupportResistanceLevel(price) {
        const candles = this.tradingApp.state.candles;
        if (candles.length < 10) return false;
        
        const nearbyPrices = candles.slice(-20).map(c => c.close);
        const priceTolerance = price * 0.005;
        
        return nearbyPrices.filter(p => Math.abs(p - price) < priceTolerance).length >= 3;
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
            }
        ];
    }

    checkAchievements(tradingApp) {
        this.checkFirstTrade(tradingApp);
        this.checkProfitAchievement(tradingApp);
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
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
            animation: slideIn 0.3s ease;
            text-align: center;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div style="font-size: 2.5rem; margin-bottom: 12px;">${achievement.icon}</div>
            <div style="font-weight: 700; margin-bottom: 8px; font-size: 1.2rem;">${achievement.title}</div>
            <div style="font-size: 1rem;">${achievement.description}</div>
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
            const isBuy = trade.type === 'BUY';
            const currentPrice = this.tradingApp.state.prices[trade.asset] || trade.price;
            return isBuy ? currentPrice > trade.price : currentPrice < trade.price;
        });

        const winRate = Math.round((profitableTrades.length / totalTrades) * 100);

        document.getElementById('total-trades').querySelector('.stat-value').textContent = totalTrades;
        document.getElementById('win-rate').querySelector('.stat-value').textContent = winRate + '%';

        document.getElementById('win-rate').className = `journal-stat ${winRate >= 50 ? 'positive' : 'negative'}`;
    }

    resetStats() {
        document.getElementById('total-trades').querySelector('.stat-value').textContent = '0';
        document.getElementById('win-rate').querySelector('.stat-value').textContent = '0%';
        document.getElementById('win-rate').className = 'journal-stat';
    }
}

class OrderManager {
    constructor(tradingApp) {
        this.tradingApp = tradingApp;
        this.orderCheckInterval = null;
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
        
        if (!this.orderCheckInterval) {
            this.startOrderChecking();
        }
    }

    startOrderChecking() {
        this.orderCheckInterval = setInterval(() => {
            this.checkOrders();
        }, 3000);
    }

    stopOrderChecking() {
        if (this.orderCheckInterval) {
            clearInterval(this.orderCheckInterval);
            this.orderCheckInterval = null;
        }
    }

    checkOrders() {
        const currentPrice = this.tradingApp.state.prices[this.tradingApp.state.currentAsset];
        let hasActiveOrders = false;
        
        this.tradingApp.state.orders.forEach(order => {
            if (order.status === 'ACTIVE') {
                hasActiveOrders = true;
                const shouldTrigger = order.orderType === 'STOP' ? 
                    (order.type === 'BUY' ? currentPrice >= order.triggerPrice : currentPrice <= order.triggerPrice) :
                    (order.type === 'BUY' ? currentPrice <= order.triggerPrice : currentPrice >= order.triggerPrice);
                
                if (shouldTrigger) {
                    this.executeOrder(order);
                }
            }
        });
        
        if (!hasActiveOrders) {
            this.stopOrderChecking();
        }
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
            rsiSeries: null,
            socket: null,
            candles: [],
            currentAsset: 'BTC',
            timeframe: '1h',
            updateUIThrottle: null
        };

        this.teacher = new TradingTeacher(this);
        this.riskCalculator = new RiskCalculator(this);
        this.achievementSystem = new AchievementSystem();
        this.tradingJournal = new TradingJournal(this);
        this.orderManager = new OrderManager(this);
        
        this.init();
    }

    async init() {
        await this.loadSavedData();
        this.achievementSystem.displayAchievements();
        this.initChart();
        this.setupEventListeners();
        this.setupHotkeys();
        await this.loadInitialData();
        this.updateUI();
        this.orderManager.updateOrdersUI();
        
        setTimeout(() => {
            this.teacher.addInteractiveTips();
        }, 1000);
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
            const indicator = document.createElement('div');
            indicator.className = 'saving-indicator';
            indicator.textContent = '💾 Сохранение...';
            document.body.appendChild(indicator);
            setTimeout(() => indicator.classList.add('visible'), 10);

            localStorage.setItem('tradeBalance', this.state.balance.toString());
            localStorage.setItem('tradePortfolio', JSON.stringify(this.state.portfolio));
            localStorage.setItem('tradeHistory', JSON.stringify(this.state.history));
            localStorage.setItem('tradePrices', JSON.stringify(this.state.prices));
            localStorage.setItem('tradeOrders', JSON.stringify(this.state.orders));

            setTimeout(() => {
                indicator.classList.remove('visible');
                setTimeout(() => indicator.remove(), 300);
            }, 1000);

        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    exportData() {
        const data = {
            balance: this.state.balance,
            portfolio: this.state.portfolio,
            history: this.state.history,
            prices: this.state.prices,
            orders: this.state.orders,
            savedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `tradelearn-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showAlert('✅ Данные экспортированы!', 'success');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                this.state.balance = data.balance || 100;
                this.state.portfolio = data.portfolio || {};
                this.state.history = data.history || [];
                this.state.prices = data.prices || {};
                this.state.orders = data.orders || [];
                
                this.saveData();
                this.updateUI();
                this.achievementSystem.displayAchievements();
                this.orderManager.updateOrdersUI();
                this.tradingJournal.updateStats();
                
                this.showAlert('✅ Данные импортированы!', 'success');
            } catch (error) {
                this.showAlert('❌ Ошибка при импорте данных', 'error');
            }
        };
        reader.readAsText(file);
    }

    resetData() {
        if (confirm('Вы уверены? Весь прогресс будет сброшен!')) {
            localStorage.clear();
            this.state.balance = 100;
            this.state.portfolio = { BTC: 0, ETH: 0, SOL: 0 };
            this.state.history = [];
            this.state.orders = [];
            this.achievementSystem = new AchievementSystem();
            
            this.saveData();
            this.updateUI();
            this.achievementSystem.displayAchievements();
            this.orderManager.updateOrdersUI();
            this.tradingJournal.updateStats();
            
            this.showAlert('🔄 Данные сброшены!', 'info');
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

        this.state.rsiSeries = this.state.chart.addLineSeries({
            color: '#8e44ad',
            lineWidth: 2,
            lineStyle: 0,
            title: 'RSI 14',
            visible: false
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
            document.getElementById('chartLoadingOverlay').style.display = 'flex';
            
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
            document.getElementById('chartLoadingOverlay').style.display = 'none';
            
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            document.getElementById('chartLoader').textContent = "Ошибка загрузки данных";
            document.getElementById('chartLoadingOverlay').style.display = 'none';
            this.useTestData();
        }
    }

    useTestData() {
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

        if (document.getElementById('rsi-toggle').checked) {
            const rsiData = this.calculateRSI(this.state.candles.map(c => c.close), 14);
            this.state.rsiSeries.setData(rsiData);
            this.state.rsiSeries.applyOptions({ visible: true });
        } else {
            this.state.rsiSeries.applyOptions({ visible: false });
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

    calculateRSI(data, period = 14) {
        if (data.length < period + 1) return [];
        
        const result = [];
        const changes = [];
        
        for (let i = 1; i < data.length; i++) {
            changes.push(data[i] - data[i-1]);
        }
        
        for (let i = period; i < data.length; i++) {
            const periodChanges = changes.slice(i - period, i);
            const gains = periodChanges.filter(c => c > 0).reduce((a, b) => a + b, 0);
            const losses = Math.abs(periodChanges.filter(c => c < 0).reduce((a, b) => a + b, 0));
            
            if (losses === 0) {
                result.push({ time: this.state.candles[i].time, value: 100 });
            } else {
                const rs = gains / losses;
                const rsi = 100 - (100 / (1 + rs));
                result.push({ time: this.state.candles[i].time, value: rsi });
            }
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
                    
                    this.orderManager.checkOrders();
                    
                } catch (error) {
                    console.error("Ошибка обработки WebSocket сообщения:", error);
                }
            };

            this.state.socket.onerror = (error) {
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
        this.achievementSystem.checkAchievements(this);
        this.tradingJournal.updateStats();
    }

    updateUI() {
        if (this.state.updateUIThrottle) {
            clearTimeout(this.state.updateUIThrottle);
        }
        
        this.state.updateUIThrottle = setTimeout(() => {
            this._updateUIImmediately();
        }, 100);
    }

    _updateUIImmediately() {
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
        
        const recentHistory = this.state.history.slice().reverse().slice(0, 10);
        
        recentHistory.forEach(trade => {
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
            top: 24px;
            right: 24px;
            padding: 18px 24px;
            border-radius: 14px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 12px 40px rgba(0,0,0,0.2);
            animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 4000);
    }

    setupEventListeners() {
        // Боковая панель
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Функции для кнопок боковой панели
        document.getElementById('sidebar-teacher').addEventListener('click', () => {
            this.toggleTeacherSection();
            document.getElementById('sidebar').classList.remove('open');
        });

        document.getElementById('sidebar-calculator').addEventListener('click', () => {
            document.getElementById('risk-calculator-section').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('sidebar').classList.remove('open');
        });

        document.getElementById('sidebar-achievements').addEventListener('click', () => {
            document.getElementById('achievements-section').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('sidebar').classList.remove('open');
        });

        document.getElementById('sidebar-portfolio').addEventListener('click', () => {
            document.getElementById('portfolio-section').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('sidebar').classList.remove('open');
        });

        document.getElementById('sidebar-history').addEventListener('click', () => {
            document.getElementById('history-section').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('sidebar').classList.remove('open');
        });

        document.getElementById('sidebar-orders').addEventListener('click', () => {
            document.getElementById('orders-section').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('sidebar').classList.remove('open');
        });

        document.getElementById('sidebar-stats').addEventListener('click', () => {
            document.getElementById('trading-journal-section').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('sidebar').classList.remove('open');
        });

        document.getElementById('sidebar-data').addEventListener('click', () => {
            document.getElementById('data-management-section').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('sidebar').classList.remove('open');
        });

        // Торговые кнопки
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
            const maxAmount = this.state.balance;
            document.getElementById('trade-amount').value = maxAmount.toFixed(2);
            this.executeTrade('BUY', asset, maxAmount);
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

        document.getElementById('rsi-toggle').addEventListener('change', () => {
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

        document.getElementById('teacher-dictionary-btn').addEventListener('click', () => {
            this.teacher.showDictionary();
        });

        document.querySelectorAll('.dictionary-term').forEach(term => {
            term.addEventListener('click', (e) => {
                const termKey = e.currentTarget.dataset.term;
                this.teacher.explainTerm(termKey);
            });
        });

        // Калькулятор риска
        document.getElementById('calculate-risk').addEventListener('click', () => {
            this.riskCalculator.calculate();
        });

        // Быстрый расчет риска
        document.getElementById('risk-entry').addEventListener('focus', () => {
            const currentPrice = this.state.prices[this.state.currentAsset];
            if (!document.getElementById('risk-entry').value) {
                document.getElementById('risk-entry').value = currentPrice.toFixed(2);
            }
        });

        document.getElementById('risk-stop').addEventListener('focus', () => {
            const currentPrice = this.state.prices[this.state.currentAsset];
            if (!document.getElementById('risk-stop').value) {
                document.getElementById('risk-stop').value = (currentPrice * 0.98).toFixed(2);
            }
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

        // Управление данными
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e);
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetData();
        });

        // Статистика
        document.getElementById('show-stats').addEventListener('click', () => {
            this.showStats();
        });

        // Сохранение данных
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Alt + H - подсказка
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.teacher.giveHint();
            }
            
            // Alt + A - анализ рынка
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.teacher.analyzeMarket();
            }
            
            // Alt + T - учитель
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTeacherSection();
            }
        });
    }

    toggleTeacherSection() {
        const section = document.getElementById('teacher-section');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }

    showStats() {
        const trades = this.state.history;
        if (trades.length === 0) {
            this.showAlert('Нет данных для анализа! Совершите несколько сделок.', 'info');
            return;
        }

        const profitableTrades = trades.filter(trade => {
            const isBuy = trade.type === 'BUY';
            const currentPrice = this.state.prices[trade.asset] || trade.price;
            return isBuy ? currentPrice > trade.price : currentPrice < trade.price;
        });

        const winRate = Math.round((profitableTrades.length / trades.length) * 100);
        const totalProfit = profitableTrades.reduce((sum, trade) => sum + Math.abs(trade.total), 0);
        const totalLoss = trades.filter(trade => !profitableTrades.includes(trade))
                               .reduce((sum, trade) => sum + Math.abs(trade.total), 0);

        let message = '📊 Детальная статистика:\n\n';
        message += `Всего сделок: ${trades.length}\n`;
        message += `Прибыльных: ${profitableTrades.length} (${winRate}%)\n`;
        message += `Общая прибыль: ${totalProfit.toFixed(2)} USDT\n`;
        message += `Общий убыток: ${totalLoss.toFixed(2)} USDT\n`;
        message += `Чистая прибыль: ${(totalProfit - totalLoss).toFixed(2)} USDT`;

        this.showAlert(message, totalProfit > totalLoss ? 'success' : 'error');
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
