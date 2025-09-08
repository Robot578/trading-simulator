// Прокси для обхода CORS
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

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
                definition: "Простая скользящая средняя - это средняя цена актива за определенный период времени.",
                usage: "Используется для определения направления тренда и уровней поддержки/сопротивления.",
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
            analysis += "📊 Очень высокий объем - возможен разворот или усиление тренд\n";
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
        order.status = 'EXECUTED';
        order.executedAt = new Date().toLocaleString();
        order.executedPrice = this.tradingApp.state.prices[order.asset];
        
        const tradeType = order.type === 'BUY' ? 'BUY' : 'SELL';
        const tradeAmount = order.amount;
        const tradePrice = order.executedPrice;
        
        this.tradingApp.executeTrade(tradeType, order.asset, tradeAmount, tradePrice, true);
        
        this.tradingApp.showAlert(
            `⚡ ${order.orderType === 'STOP' ? 'Стоп-лосс' : 'Тейк-профит'} сработал! ` +
            `${tradeType === 'BUY' ? 'Куплено' : 'Продано'} ${tradeAmount} ${order.asset} по ${tradePrice}`,
            order.orderType === 'STOP' ? 'warning' : 'success'
        );
        
        this.updateOrdersUI();
    }

    cancelOrder(orderId) {
        const orderIndex = this.tradingApp.state.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.tradingApp.state.orders[orderIndex].status = 'CANCELLED';
            this.tradingApp.saveData();
            this.updateOrdersUI();
            this.tradingApp.showAlert('❌ Ордер отменен', 'info');
        }
    }

    updateOrdersUI() {
        const container = document.getElementById('orders-container');
        const activeOrders = this.tradingApp.state.orders.filter(o => o.status === 'ACTIVE');
        
        if (activeOrders.length === 0) {
            container.innerHTML = '<div class="empty-orders">Активных ордеров нет</div>';
            return;
        }
        
        container.innerHTML = activeOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-type ${order.type.toLowerCase()}">${order.type === 'BUY' ? '🟢 LONG' : '🔴 SHORT'}</span>
                    <span class="order-asset">${order.asset}</span>
                    <button class="cancel-order-btn" onclick="tradingApp.orderManager.cancelOrder('${order.id}')">❌</button>
                </div>
                <div class="order-details">
                    <div class="order-detail">
                        <span>Объем:</span>
                        <span>${order.amount}</span>
                    </div>
                    <div class="order-detail">
                        <span>Цена:</span>
                        <span>${order.triggerPrice.toFixed(2)}</span>
                    </div>
                    <div class="order-detail">
                        <span>Тип:</span>
                        <span class="${order.orderType === 'STOP' ? 'stop-loss' : 'take-profit'}">
                            ${order.orderType === 'STOP' ? 'Стоп-лосс' : 'Тейк-профит'}
                        </span>
                    </div>
                </div>
                <div class="order-time">Создан: ${order.createdAt}</div>
            </div>
        `).join('');
    }
}

class TradingApp {
    constructor() {
        this.state = {
            balance: 100,
            portfolio: { BTC: 0, ETH: 0, SOL: 0 },
            prices: { BTC: 0, ETH: 0, SOL: 0 },
            currentAsset: 'BTC',
            timeframe: '1h',
            candles: [],
            history: [],
            orders: [],
            chart: null,
            candleSeries: null,
            indicators: {
                sma: null,
                ema: null,
                rsi: null
            }
        };
        
        this.teacher = new TradingTeacher(this);
        this.riskCalculator = new RiskCalculator(this);
        this.achievements = new AchievementSystem();
        this.journal = new TradingJournal(this);
        this.orderManager = new OrderManager(this);
        
        this.init();
    }

    init() {
        this.loadData();
        this.initChart();
        this.setupEventListeners();
        this.fetchCandles(this.state.currentAsset);
        this.updateUI();
        
        setInterval(() => {
            this.fetchCandles(this.state.currentAsset);
        }, 60000);
    }

    setupEventListeners() {
        // Боковая панель - переключение
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Функции для кнопок боковой панели
        document.getElementById('sidebar-teacher').addEventListener('click', () => {
            document.getElementById('teacher-section').scrollIntoView({ behavior: 'smooth' });
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });

        document.getElementById('sidebar-calculator').addEventListener('click', () => {
            document.getElementById('risk-calculator-section').scrollIntoView({ behavior: 'smooth' });
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });

        document.getElementById('sidebar-achievements').addEventListener('click', () => {
            document.getElementById('achievements-section').scrollIntoView({ behavior: 'smooth' });
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });

        document.getElementById('sidebar-portfolio').addEventListener('click', () => {
            document.getElementById('portfolio-section').scrollIntoView({ behavior: 'smooth' });
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });

        document.getElementById('sidebar-history').addEventListener('click', () => {
            document.getElementById('history-section').scrollIntoView({ behavior: 'smooth' });
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });

        document.getElementById('sidebar-orders').addEventListener('click', () => {
            document.getElementById('orders-section').scrollIntoView({ behavior: 'smooth' });
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });

        document.getElementById('sidebar-stats').addEventListener('click', () => {
            document.getElementById('trading-journal-section').scrollIntoView({ behavior: 'smooth' });
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });

        document.getElementById('sidebar-data').addEventListener('click', () => {
            document.getElementById('data-management-section').scrollIntoView({ behavior: 'smooth' });
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });

        // Выбор актива
        document.getElementById('asset-select').addEventListener('change', (e) => {
            this.state.currentAsset = e.target.value;
            this.fetchCandles(this.state.currentAsset);
        });

        // Таймфреймы
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.state.timeframe = e.target.dataset.tf;
                this.fetchCandles(this.state.currentAsset);
            });
        });

        // Торговые кнопки
        document.getElementById('buy-btn').addEventListener('click', () => {
            const amount = parseFloat(document.getElementById('trade-amount').value);
            if (amount > 0) {
                this.executeTrade('BUY', this.state.currentAsset, amount);
            }
        });

        document.getElementById('sell-btn').addEventListener('click', () => {
            const amount = parseFloat(document.getElementById('trade-amount').value);
            if (amount > 0) {
                this.executeTrade('SELL', this.state.currentAsset, amount);
            }
        });

        document.getElementById('buy-max-btn').addEventListener('click', () => {
            const price = this.state.prices[this.state.currentAsset];
            const maxAmount = this.state.balance / price;
            document.getElementById('trade-amount').value = maxAmount.toFixed(6);
            this.executeTrade('BUY', this.state.currentAsset, maxAmount);
        });

        // Индикаторы
        document.getElementById('sma-toggle').addEventListener('change', (e) => {
            this.toggleIndicator('sma', e.target.checked);
        });

        document.getElementById('ema-toggle').addEventListener('change', (e) => {
            this.toggleIndicator('ema', e.target.checked);
        });

        document.getElementById('rsi-toggle').addEventListener('change', (e) => {
            this.toggleIndicator('rsi', e.target.checked);
        });

        // Учитель
        document.getElementById('teacher-btn').addEventListener('click', () => {
            const teacherSection = document.getElementById('teacher-section');
            teacherSection.style.display = teacherSection.style.display === 'none' ? 'block' : 'none';
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

        // Словарь терминов
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

        // Установка текущей цены в калькулятор
        document.getElementById('risk-entry').addEventListener('focus', () => {
            const currentPrice = this.state.prices[this.state.currentAsset];
            if (currentPrice > 0) {
                document.getElementById('risk-entry').value = currentPrice.toFixed(2);
            }
        });

        // Создание ордера
        document.getElementById('create-order-btn').addEventListener('click', () => {
            const orderType = document.getElementById('order-type').value;
            const triggerPrice = parseFloat(document.getElementById('order-price').value);
            const amount = parseFloat(document.getElementById('order-amount').value);
            
            if (!triggerPrice || !amount) {
                this.showAlert('Заполните все поля для ордера!', 'error');
                return;
            }

            const tradeType = orderType === 'STOP' ? 'SELL' : 'BUY';
            this.orderManager.createOrder(tradeType, this.state.currentAsset, amount, triggerPrice, orderType);
        });

        // Установка текущей цены в ордер
        document.getElementById('order-price').addEventListener('focus', () => {
            const currentPrice = this.state.prices[this.state.currentAsset];
            if (currentPrice > 0) {
                document.getElementById('order-price').value = currentPrice.toFixed(2);
            }
        });

        // Установка суммы в ордер
        document.getElementById('order-amount').addEventListener('focus', () => {
            const tradeAmount = document.getElementById('trade-amount').value;
            if (tradeAmount) {
                document.getElementById('order-amount').value = tradeAmount;
            }
        });

        // Управление данными
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('Вы уверены? Все данные будут сброшены!')) {
                this.resetData();
            }
        });

        // Статистика
        document.getElementById('show-stats').addEventListener('click', () => {
            this.showDetailedStats();
        });
    }

    async fetchCandles(asset) {
        const symbol = `${asset}USDT`;
        const interval = this.state.timeframe;
        
        try {
            document.getElementById('chartLoader').style.display = 'block';
            document.getElementById('chartLoadingOverlay').style.display = 'flex';
            
            // Используем прокси для обхода CORS
            const response = await fetch(`${CORS_PROXY}https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`);
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
            
            // Рассчитываем изменение цены
            if (this.state.candles.length > 1) {
                const prevClose = this.state.candles[this.state.candles.length - 2].close;
                const change = ((lastCandle.close - prevClose) / prevClose) * 100;
                document.getElementById('price-change').textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                document.getElementById('price-change').style.color = change >= 0 ? '#00c853' : '#ff1744';
            }
            
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
        const now = Math.floor(Date.now() / 1000);
        const testData = [];
        let price = 50000;
        
        for (let i = 0; i < 100; i++) {
            const time = now - (99 - i) * 3600;
            const change = (Math.random() - 0.5) * 0.02;
            price = price * (1 + change);
            
            testData.push({
                time: time,
                open: price * (1 + (Math.random() - 0.5) * 0.01),
                high: price * (1 + Math.random() * 0.02),
                low: price * (1 - Math.random() * 0.02),
                close: price,
                volume: Math.random() * 1000
            });
        }
        
        this.state.candles = testData;
        this.state.candleSeries.setData(testData);
        this.state.prices[this.state.currentAsset] = price;
        
        document.getElementById('current-price').textContent = price.toFixed(2);
        document.getElementById('price-change').textContent = '+0.00%';
        document.getElementById('price-change').style.color = '#00c853';
        
        this.updateMetrics([]);
    }

    updateMetrics(data) {
        if (data.length === 0) {
            document.getElementById('volume-24h').textContent = '0';
            document.getElementById('high-24h').textContent = '0';
            document.getElementById('low-24h').textContent = '0';
            document.getElementById('change-24h').textContent = '0%';
            return;
        }

        const volumes = data.map(d => parseFloat(d[5]));
        const highs = data.map(d => parseFloat(d[2]));
        const lows = data.map(d => parseFloat(d[3]));
        
        const totalVolume = volumes.reduce((a, b) => a + b, 0);
        const high24h = Math.max(...highs);
        const low24h = Math.min(...lows);
        
        const firstClose = parseFloat(data[0][4]);
        const lastClose = parseFloat(data[data.length - 1][4]);
        const change24h = ((lastClose - firstClose) / firstClose) * 100;
        
        document.getElementById('volume-24h').textContent = totalVolume.toFixed(0);
        document.getElementById('high-24h').textContent = high24h.toFixed(2);
        document.getElementById('low-24h').textContent = low24h.toFixed(2);
        document.getElementById('change-24h').textContent = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;
        document.getElementById('change-24h').style.color = change24h >= 0 ? '#00c853' : '#ff1744';
    }

    initChart() {
        const chartContainer = document.getElementById('candleChart');
        chartContainer.innerHTML = '';
        
        const chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 400,
            layout: {
                backgroundColor: '#1e1e2e',
                textColor: '#d9d9d9',
            },
            grid: {
                vertLines: {
                    color: 'rgba(42, 46, 57, 0.5)',
                },
                horzLines: {
                    color: 'rgba(42, 46, 57, 0.5)',
                },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
        });
        
        const candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        
        this.state.chart = chart;
        this.state.candleSeries = candleSeries;
        
        // Добавляем индикаторы
        this.state.indicators.sma = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            lineStyle: 0,
            priceLineVisible: false,
        });
        
        this.state.indicators.ema = chart.addLineSeries({
            color: '#FF6D00',
            lineWidth: 2,
            lineStyle: 0,
            priceLineVisible: false,
        });
        
        // RSI будет на отдельной панели
        const rsiPane = chart.addPane();
        this.state.indicators.rsi = rsiPane.addLineSeries({
            color: '#787B86',
            lineWidth: 2,
            lineStyle: 0,
            priceScaleId: 'rsi',
        });
        
        rsiPane.applyOptions({
            height: 100,
            priceScale: {
                position: 'right',
                mode: 2,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
        });
        
        // Обновляем индикаторы при изменении данных
        chart.subscribeCrosshairMove(param => {
            if (!param.time) return;
            
            const data = param.seriesData.get(candleSeries);
            if (data) {
                const tooltip = document.getElementById('chart-tooltip');
                tooltip.innerHTML = `
                    <div>O: ${data.open.toFixed(2)}</div>
                    <div>H: ${data.high.toFixed(2)}</div>
                    <div>L: ${data.low.toFixed(2)}</div>
                    <div>C: ${data.close.toFixed(2)}</div>
                `;
                tooltip.style.display = 'block';
                tooltip.style.left = param.point.x + 15 + 'px';
                tooltip.style.top = param.point.y + 15 + 'px';
            }
        });
        
        chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
            document.getElementById('chart-tooltip').style.display = 'none';
        });
        
        window.addEventListener('resize', () => {
            chart.applyOptions({ width: chartContainer.clientWidth });
        });
    }

    toggleIndicator(indicator, visible) {
        if (!this.state.indicators[indicator]) return;
        
        if (visible) {
            this.updateIndicator(indicator);
        } else {
            this.state.indicators[indicator].setData([]);
        }
    }

    updateIndicator(indicator) {
        const prices = this.state.candles.map(c => c.close);
        
        switch (indicator) {
            case 'sma':
                const smaData = this.calculateSMA(prices, 20);
                this.state.indicators.sma.setData(smaData);
                break;
                
            case 'ema':
                const emaData = this.calculateEMA(prices, 12);
                this.state.indicators.ema.setData(emaData);
                break;
                
            case 'rsi':
                const rsiData = this.calculateRSI(prices, 14);
                this.state.indicators.rsi.setData(rsiData);
                break;
        }
    }

    calculateSMA(data, period) {
        const result = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            const average = sum / period;
            result.push({ time: this.state.candles[i].time, value: average });
        }
        return result;
    }

    calculateEMA(data, period) {
        const result = [];
        const k = 2 / (period + 1);
        let ema = data[0];
        
        result.push({ time: this.state.candles[0].time, value: ema });
        
        for (let i = 1; i < data.length; i++) {
            ema = data[i] * k + ema * (1 - k);
            result.push({ time: this.state.candles[i].time, value: ema });
        }
        
        return result;
    }

    calculateRSI(data, period) {
        const result = [];
        if (data.length < period + 1) return result;
        
        let gains = 0;
        let losses = 0;
        
        // Первое значение RSI
        for (let i = 1; i <= period; i++) {
            const change = data[i] - data[i - 1];
            if (change >= 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }
        
        let avgGain = gains / period;
        let avgLoss = losses / period;
        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        let rsi = 100 - (100 / (1 + rs));
        
        result.push({ time: this.state.candles[period].time, value: rsi });
        
        // Остальные значения
        for (let i = period + 1; i < data.length; i++) {
            const change = data[i] - data[i - 1];
            
            if (change >= 0) {
                avgGain = (avgGain * (period - 1) + change) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = (avgLoss * (period - 1) - change) / period;
            }
            
            rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsi = 100 - (100 / (1 + rs));
            result.push({ time: this.state.candles[i].time, value: rsi });
        }
        
        return result;
    }

    executeTrade(type, asset, amount, price = null, isOrderExecution = false) {
        const currentPrice = price || this.state.prices[asset];
        const cost = amount * currentPrice;
        
        if (type === 'BUY') {
            if (cost > this.state.balance) {
                this.showAlert('Недостаточно средств!', 'error');
                return false;
            }
            
            this.state.balance -= cost;
            this.state.portfolio[asset] = (this.state.portfolio[asset] || 0) + amount;
            
            this.addToHistory({
                type: 'BUY',
                asset: asset,
                amount: amount,
                price: currentPrice,
                total: cost,
                timestamp: new Date().toLocaleString()
            });
            
            if (!isOrderExecution) {
                this.showAlert(`✅ Куплено ${amount} ${asset} за ${cost.toFixed(2)} USDT`, 'success');
            }
            
        } else if (type === 'SELL') {
            if (!this.state.portfolio[asset] || this.state.portfolio[asset] < amount) {
                this.showAlert('Недостаточно активов для продажи!', 'error');
                return false;
            }
            
            this.state.balance += cost;
            this.state.portfolio[asset] -= amount;
            
            this.addToHistory({
                type: 'SELL',
                asset: asset,
                amount: amount,
                price: currentPrice,
                total: cost,
                timestamp: new Date().toLocaleString()
            });
            
            if (!isOrderExecution) {
                this.showAlert(`✅ Продано ${amount} ${asset} за ${cost.toFixed(2)} USDT`, 'success');
            }
        }
        
        this.saveData();
        this.updateUI();
        this.achievements.checkAchievements(this);
        this.journal.updateStats();
        
        return true;
    }

    addToHistory(trade) {
        this.state.history.unshift(trade);
        if (this.state.history.length > 50) {
            this.state.history = this.state.history.slice(0, 50);
        }
        this.updateHistoryUI();
    }

    updateUI() {
        // Баланс
        document.getElementById('balance').textContent = this.state.balance.toFixed(2) + ' USDT';
        
        // Портфель
        document.getElementById('btc-amount').textContent = this.state.portfolio.BTC.toFixed(6);
        document.getElementById('eth-amount').textContent = this.state.portfolio.ETH.toFixed(6);
        document.getElementById('sol-amount').textContent = this.state.portfolio.SOL.toFixed(6);
        
        // Общая стоимость
        let totalValue = this.state.balance;
        Object.keys(this.state.portfolio).forEach(asset => {
            totalValue += this.state.portfolio[asset] * (this.state.prices[asset] || 0);
        });
        document.getElementById('total-value').textContent = totalValue.toFixed(2) + ' USDT';
        
        // Обновляем индикаторы
        if (document.getElementById('sma-toggle').checked) {
            this.updateIndicator('sma');
        }
        if (document.getElementById('ema-toggle').checked) {
            this.updateIndicator('ema');
        }
        if (document.getElementById('rsi-toggle').checked) {
            this.updateIndicator('rsi');
        }
        
        // Обновляем ордера
        this.orderManager.updateOrdersUI();
    }

    updateHistoryUI() {
        const container = document.getElementById('history-items');
        
        if (this.state.history.length === 0) {
            container.innerHTML = '<div class="empty-history">Сделок пока нет</div>';
            return;
        }
        
        container.innerHTML = this.state.history.map(trade => `
            <div class="history-item ${trade.type.toLowerCase()}">
                <div class="history-type">${trade.type === 'BUY' ? '🟢' : '🔴'}</div>
                <div class="history-details">
                    <div class="history-asset">${trade.asset}</div>
                    <div class="history-amount">${trade.amount} @ ${trade.price.toFixed(2)}</div>
                </div>
                <div class="history-total">${trade.total.toFixed(2)} USDT</div>
                <div class="history-time">${trade.timestamp}</div>
            </div>
        `).join('');
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        const colors = {
            success: 'linear-gradient(135deg, #00c853, #64dd17)',
            error: 'linear-gradient(135deg, #ff1744, #f50057)',
            warning: 'linear-gradient(135deg, #ff9100, #ffab40)',
            info: 'linear-gradient(135deg, #2962ff, #448aff)'
        };
        
        alert.style.background = colors[type] || colors.info;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }

    showDetailedStats() {
        const trades = this.state.history;
        const totalTrades = trades.length;
        
        if (totalTrades === 0) {
            this.showAlert('Нет данных для статистики', 'info');
            return;
        }
        
        const buyTrades = trades.filter(t => t.type === 'BUY');
        const sellTrades = trades.filter(t => t.type === 'SELL');
        
        const profitableTrades = trades.filter(trade => {
            const currentPrice = this.state.prices[trade.asset] || trade.price;
            return trade.type === 'BUY' ? currentPrice > trade.price : currentPrice < trade.price;
        });
        
        const winRate = Math.round((profitableTrades.length / totalTrades) * 100);
        
        let message = `📊 Детальная статистика:\n\n`;
        message += `• Всего сделок: ${totalTrades}\n`;
        message += `• Покупок: ${buyTrades.length}\n`;
        message += `• Продаж: ${sellTrades.length}\n`;
        message += `• Процент побед: ${winRate}%\n`;
        message += `• Прибыльных: ${profitableTrades.length}\n`;
        message += `• Убыточных: ${totalTrades - profitableTrades.length}\n\n`;
        
        if (winRate >= 60) {
            message += `🎉 Отличные результаты! Продолжайте в том же духе!`;
        } else if (winRate >= 40) {
            message += `📈 Неплохо! Есть куда расти. Анализируйте свои сделки.`;
        } else {
            message += `📉 Нужно поработать над стратегией. Изучайте рынок внимательнее.`;
        }
        
        this.teacher.showMessage(message, 'analysis');
    }

    loadData() {
        try {
            const saved = localStorage.getItem('tradingAppData');
            if (saved) {
                const data = JSON.parse(saved);
                this.state = { ...this.state, ...data };
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem('tradingAppData', JSON.stringify(this.state));
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }

    exportData() {
        const dataStr = JSON.stringify(this.state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `trading-data-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showAlert('Данные экспортированы!', 'success');
    }

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.state = { ...this.state, ...data };
                this.saveData();
                this.updateUI();
                this.updateHistoryUI();
                this.orderManager.updateOrdersUI();
                this.achievements.displayAchievements();
                this.journal.updateStats();
                
                this.showAlert('Данные импортированы!', 'success');
            } catch (error) {
                this.showAlert('Ошибка импорта данных!', 'error');
            }
        };
        reader.readAsText(file);
    }

    resetData() {
        this.state = {
            balance: 100,
            portfolio: { BTC: 0, ETH: 0, SOL: 0 },
            prices: { BTC: 0, ETH: 0, SOL: 0 },
            currentAsset: 'BTC',
            timeframe: '1h',
            candles: [],
            history: [],
            orders: [],
            chart: this.state.chart,
            candleSeries: this.state.candleSeries,
            indicators: this.state.indicators
        };
        
        this.saveData();
        this.updateUI();
        this.updateHistoryUI();
        this.orderManager.updateOrdersUI();
        this.achievements = new AchievementSystem();
        this.achievements.displayAchievements();
        this.journal.updateStats();
        
        this.showAlert('Данные сброшены!', 'success');
    }
}

// Инициализация приложения
const tradingApp = new TradingApp();

// Добавляем глобальные функции для использования в HTML
window.tradingApp = tradingApp;
