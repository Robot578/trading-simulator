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
        
        // Добавляем словарь терминов
        this.termsDictionary = {
            rsi: {
                name: "RSI (Relative Strength Index)",
                definition: "Индекс относительной силы - это осциллятор, который измеряет скорость и изменение ценовых движений. RSI колеблется между 0 и 100.",
                usage: "Используется для идентификации перекупленности (обычно выше 70) и перепроданности (обычно ниже 30). Также может показывать дивергенции, которые предвещают разворот тренда.",
                example: "Если RSI падает ниже 30, это может сигнализировать о том, что актив перепродан и возможен отскок цены вверх."
            },
            sma: {
                name: "SMA (Simple Moving Average)",
                definition: "Простая скользящая средняя - это средняя цена актива за определенный период времени. Рассчитывается как сумма цен за период, деленная на количество периодов.",
                usage: "Используется для определения направления тренда. Когда цена выше SMA - восходящий тренд, когда ниже - нисходящий. Также служит уровнями поддержки и сопротивления.",
                example: "SMA(20) часто используется для определения краткосрочного тренда, а SMA(50) - для среднесрочного."
            },
            ema: {
                name: "EMA (Exponential Moving Average)",
                definition: "Экспоненциальная скользящая средняя - похожа на SMA, но придает больший вес последним ценам, что делает ее более чувствительной к недавним ценовым изменениям.",
                usage: "Быстрее реагирует на изменения цены по сравнению с SMA. Часто используется в комбинации с SMA для генерации торговых сигналов при пересечении.",
                example: "Когда быстрая EMA (например, 12 периодов) пересекает медленную EMA (26 периодов) снизу вверх - это бычий сигнал."
            },
            ma: {
                name: "MA (Moving Average)",
                definition: "Скользящая средняя - общее название для индикаторов, которые сглаживают ценовые данные для создания линии, показывающей среднее значение цены за определенный период.",
                usage: "Основной инструмент технического анализа для определения тренда, фильтрации рыночного шума и определения уровней поддержки/сопротивления.",
                example: "Трейдеры часто используют несколько MA с разными периодами для подтверждения тренда."
            },
            macd: {
                name: "MACD (Moving Average Convergence Divergence)",
                definition: "Схождение/расхождение скользящих средних - индикатор, который показывает взаимосвязь между двумя EMA цены.",
                usage: "Используется для идентификации изменений в направлении, силе и momentum тренда. Состоит из линии MACD, сигнальной линии и гистограммы.",
                example: "Пересечение линии MACD выше сигнальной линии - бычий сигнал, ниже - медвежий."
            },
            bollinger: {
                name: "Bollinger Bands (Полосы Боллинджера)",
                definition: "Состоят из SMA (средняя линия) и двух стандартных отклонений выше и ниже (верхняя и нижняя полосы).",
                usage: "Используются для измерения волатильности и идентификации перекупленности/перепроданности. Цена обычно находится within полос.",
                example: "Когда цена касается верхней полосы - возможна перекупленность, нижней - перепроданность."
            },
            support: {
                name: "Support (Уровень поддержки)",
                definition: "Ценовой уровень, где давление покупателей достаточно сильное, чтобы предотвратить дальнейшее падение цены.",
                usage: "Используется для определения точек входа в long позиции или установки стоп-лоссов.",
                example: "Если цена несколько раз отскакивает от определенного уровень, этот уровень становится поддержкой."
            },
            resistance: {
                name: "Resistance (Уровень сопротивления)",
                definition: "Ценовой уровень, где давление продавцов достаточно сильное, чтобы предотвратить дальнейший рост цей.",
                usage: "Используется для определения точек входа в short позиции или тейк-профитов.",
                example: "Если цена несколько раз не может пробить определенный уровень, этот уровень становится сопротивлением."
            },
            trend: {
                name: "Trend (Тренд)",
                definition: "Общее направление движения цены. Может быть восходящим (бычьим), нисходящим (медвежьим) или боковым (флэт).",
                usage: "Определение тренда - основа технического анализа. 'Тренд - твой друг' - главное правило трейдинга.",
                example: "Восходящий тренд характеризуется более высокими максимумами и более высокими минимумами."
            },
            volume: {
                name: "Volume (Объем торгов)",
                definition: "Количество акций или контрактов, торгуемых в течение определенного период времени.",
                usage: "Подтверждает силу тренда. Высокий объем при движении цены подтверждает тренд, низкий объем может сигнализировать о слабости.",
                example: "Рост цены на высоком объеме - сильный бычий сигнал."
            },
            liquidity: {
                name: "Liquidity (Ликвидность)",
                definition: "Способность актива быть быстро проданным по цене, близкой к рыночной.",
                usage: "Высокая ликвидность означает узкие спреды и возможность быстрого исполнения ордеров.",
                example: "Криптовалюты с большой капитализацией обычно имеют высокую ликвидность."
            },
            stoploss: {
                name: "Stop-Loss (Стоп-лосс)",
                definition: "Ордер, который автоматически закрывает позицию при достижении определенной цены, чтобы ограничить убытки.",
                usage: "Обязательный инструмент управления рисками. Устанавливается ниже текущей цены для long позиций и выше для short.",
                example: "Если вы купили BTC по $50,000, можно установить стоп-лосс на $48,000 чтобы ограничить убыток 4%."
            },
            takeprofit: {
                name: "Take-Profit (Тейк-профит)",
                definition: "Ордер, который автоматически закрывает позицию при достижении определенной прибыльной цены.",
                usage: "Используется для фиксации прибыли. Устанавливается на уровне, где соотношение риск/прибыль соответствует торговому плану.",
                example: "При покупке по $50,000 и стоп-лоссе $48,000, тейк-профит можно установить на $54,000 для соотношения 1:2."
            }
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
        
        // Добавляем объяснение терминов в анализ
        let enhancedAnalysis = analysis + "\n\n📚 Объяснение терминов:\n";
        enhancedAnalysis += "• RSI - Индекс относительной силы, показывает перекупленность/перепроданность\n";
        enhancedAnalysis += "• SMA - Простая скользящая средняя, определяет тренд\n";
        enhancedAnalysis += "• EMA - Экспоненциальная скользящая средняя, более чувствительная версия SMA\n";
        enhancedAnalysis += "• Volume - Объем торгов, подтверждает силу движения\n";
        
        this.showMessage(enhancedAnalysis, 'analysis');
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

    // Добавляем новые методы для работы со словарем
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
        
        // Скрываем уроки если они открыты
        document.getElementById('teacher-lessons').style.display = 'none';
    }

    searchTerm(query) {
        if (!query) return;
        
        const foundTerm = Object.entries(this.termsDictionary).find(([key, term]) => 
            term.name.toLowerCase().includes(query.toLowerCase()) ||
            key.toLowerCase().includes(query.toLowerCase())
        );

        if (foundTerm) {
            this.explainTerm(foundTerm[0]);
        } else {
            this.showMessage(`Термин "${query}" не найден. Попробуйте другой запрос.`, 'error');
        }
    }

    // Метод для быстрого объяснения индикатора
    explainIndicator(indicatorName) {
        switch (indicatorName.toLowerCase()) {
            case 'sma':
            case 'sma (20)':
                this.explainTerm('sma');
                break;
            case 'ema':
            case 'ema (12)':
                this.explainTerm('ema');
                break;
            case 'rsi':
                this.explainTerm('rsi');
                break;
            case 'ma':
                this.explainTerm('ma');
                break;
            case 'macd':
                this.explainTerm('macd');
                break;
            case 'volume':
                this.explainTerm('volume');
                break;
            default:
                this.showMessage(`Индикатор "${indicatorName}" не распознан. Используйте словарь для поиска.`, 'error');
        }
    }

    // Добавляем контекстные подсказки
    addChartTooltips() {
        const chartContainer = document.getElementById('candleChart');
        if (!chartContainer) return;

        // Добавляем подсказки к индикаторам
        const indicators = document.querySelectorAll('.indicator-label');
        indicators.forEach(indicator => {
            indicator.style.cursor = 'help';
            indicator.style.borderBottom = '1px dotted var(--text-light)';
            
            indicator.addEventListener('click', (e) => {
                e.stopPropagation();
                const term = indicator.textContent.trim();
                this.explainIndicator(term);
            });
        });
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
        
        // Объясняем термины
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

    // Быстрый расчет с текущей ценой
    quickCalculate() {
        const currentPrice = this.tradingApp.state.prices[this.tradingApp.state.currentAsset];
        const stopPrice = currentPrice * 0.98; // -2% для стоп-лосса
        
        document.getElementById('risk-entry').value = currentPrice.toFixed(2);
        document.getElementById('risk-stop').value = stopPrice.toFixed(2);
        
        this.calculate();
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
        this.tradingApp.executeTrade(order.type, order.asset, false, order.amount);
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
            },
            {
                id: 'order_master',
                title: 'Мастер ордеров',
                description: 'Создайте и исполните 5 отложенных ордеров',
                icon: '🎯',
                unlocked: false
            }
        ];
        this.riskCalculatorUses = 0;
        this.ordersExecuted = 0;
    }

    checkAchievements(tradingApp) {
        this.checkFirstTrade(tradingApp);
        this.checkProfitAchievement(tradingApp);
        this.checkDiversification(tradingApp);
        this.checkRiskManager();
        this.checkLearningComplete();
        this.checkConsistency(tradingApp);
        this.checkOrderMaster();
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

    checkOrderMaster() {
        if (this.ordersExecuted >= 5) {
            this.unlockAchievement('order_master');
        }
    }

    incrementRiskCalculatorUses() {
        this.riskCalculatorUses++;
        localStorage.setItem('risk_calculator_uses', this.riskCalculatorUses);
        this.checkRiskManager();
    }

    incrementOrdersExecuted() {
        this.ordersExecuted++;
        localStorage.setItem('orders_executed', this.ordersExecuted);
        this.checkOrderMaster();
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
        localStorage.setItem('orders_executed', this.ordersExecuted);
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
        
        const ordersExecuted = localStorage.getItem('orders_executed');
        if (ordersExecuted) {
            this.ordersExecuted = parseInt(ordersExecuted);
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

    showAdvancedStats() {
        const trades = this.tradingApp.state.history;
        if (trades.length === 0) {
            this.tradingApp.showAlert('Нет данных для анализа!', 'info');
            return;
        }

        let stats = this.calculateAdvancedStats(trades);
        
        let message = `📊 Детальная статистика:\n\n`;
        message += `Всего сделок: ${stats.totalTrades}\n`;
        message += `Прибыльных: ${stats.profitableTrades} (${stats.winRate}%)\n`;
        message += `Убыточных: ${stats.losingTrades}\n`;
        message += `Общая прибыль: ${stats.totalProfit.toFixed(2)} USDT\n`;
        message += `Общий убыток: ${stats.totalLoss.toFixed(2)} USDT\n`;
        message += `Чистая прибыль: ${stats.netProfit.toFixed(2)} USDT\n`;
        message += `Макс. просадка: ${stats.maxDrawdown.toFixed(2)}%\n`;
        message += `Соотношение прибыль/убыток: ${stats.profitLossRatio.toFixed(2)}\n`;
        message += `Средняя сделка: ${stats.avgTrade.toFixed(2)} USDT`;

        this.tradingApp.showAlert(message, stats.netProfit >= 0 ? 'success' : 'error');
    }

    calculateAdvancedStats(trades) {
        let totalProfit = 0;
        let totalLoss = 0;
        let profitableTrades = 0;
        let losingTrades = 0;
        let equityCurve = [100]; // Начальный депозит
        let maxDrawdown = 0;

        trades.forEach(trade => {
            const profit = trade.type === 'BUY' ? 
                (this.tradingApp.state.prices[trade.asset] - trade.price) * trade.amount :
                (trade.price - this.tradingApp.state.prices[trade.asset]) * trade.amount;

            if (profit >= 0) {
                totalProfit += profit;
                profitableTrades++;
            } else {
                totalLoss += Math.abs(profit);
                losingTrades++;
            }

            // Обновляем кривую equity для расчета просадки
            const currentEquity = equityCurve[equityCurve.length - 1] + profit;
            equityCurve.push(currentEquity);
            
            // Расчет максимальной просадки
            const peak = Math.max(...equityCurve);
            const drawdown = ((peak - currentEquity) / peak) * 100;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
        });

        return {
            totalTrades: trades.length,
            profitableTrades: profitableTrades,
            losingTrades: losingTrades,
            winRate: ((profitableTrades / trades.length) * 100) || 0,
            totalProfit: totalProfit,
            totalLoss: totalLoss,
            netProfit: totalProfit - totalLoss,
            maxDrawdown: maxDrawdown,
            profitLossRatio: totalLoss > 0 ? totalProfit / totalLoss : totalProfit,
            avgTrade: (totalProfit - totalLoss) / trades.length
        };
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
        this.achievementSystem = new AchievementSystem();
        this.tradingJournal = new TradingJournal(this);
        this.orderManager = new OrderManager(this);
        this.tg = window.Telegram?.WebApp;
        
        this.init();
    }

    async init() {
        await this.loadSavedData();
        this.achievementSystem.loadAchievements();
        this.initChart();
        this.setupEventListeners();
        this.setupHotkeys();
        await this.loadInitialData();
        this.updateUI();
        this.achievementSystem.displayAchievements();
        this.tradingJournal.updateStats();
        this.orderManager.updateOrdersUI();
        
        // Добавляем подсказки после загрузки
        setTimeout(() => {
            this.teacher.addChartTooltips();
        }, 1000);
    }

    async loadSavedData() {
        try {
            if (this.tg?.CloudStorage) {
                const keys = ['balance', 'portfolio', 'history', 'prices', 'orders'];
                
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
            const dataToSave = {
                balance: this.state.balance,
                portfolio: this.state.portfolio,
                history: this.state.history,
                prices: this.state.prices,
                orders: this.state.orders
            };

            // Показать индикатор сохранения
            const indicator = document.createElement('div');
            indicator.className = 'saving-indicator';
            indicator.textContent = '💾 Сохранение...';
            document.body.appendChild(indicator);
            setTimeout(() => indicator.classList.add('visible'), 10);

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

            // Скрыть индикатор через секунду
            setTimeout(() => {
                indicator.classList.remove('visible');
                setTimeout(() => indicator.remove(), 300);
            }, 1000);

        } catch (error) {
            console.error('Error saving data:', error);
            this.saveToLocalStorage({
                balance: this.state.balance,
                portfolio: this.state.portfolio,
                history: this.state.history,
                prices: this.state.prices,
                orders: this.state.orders
            });
        }
    }

    saveToLocalStorage(data) {
        localStorage.setItem('tradeBalance', data.balance.toString());
        localStorage.setItem('tradePortfolio', JSON.stringify(data.portfolio));
        localStorage.setItem('tradeHistory', JSON.stringify(data.history));
        localStorage.setItem('tradePrices', JSON.stringify(data.prices));
        localStorage.setItem('tradeOrders', JSON.stringify(data.orders));
    }

    exportData() {
        const data = {
            balance: this.state.balance,
            portfolio: this.state.portfolio,
            history: this.state.history,
            prices: this.state.prices,
            orders: this.state.orders,
            achievements: this.achievementSystem.achievements,
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
                
                // Восстанавливаем данные
                this.state.balance = data.balance || 100;
                this.state.portfolio = data.portfolio || {};
                this.state.history = data.history || [];
                this.state.prices = data.prices || {};
                this.state.orders = data.orders || [];
                
                if (data.achievements) {
                    this.achievementSystem.achievements = data.achievements;
                }
                
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
                
                // Проверяем ордера при каждом обновлении цены
                this.orderManager.checkOrders();
                
            } catch (error) {
                console.error("Ошибка обработки WebSocket сообщения:", error);
            }
        };
    }

    executeTrade(action, asset, isMaxTrade = false, amount = null) {
        let tradeAmount = amount;
        
        if (isMaxTrade && !amount) {
            if (action === 'BUY') {
                tradeAmount = this.state.balance;
            } else {
                tradeAmount = this.state.portfolio[asset] || 0;
            }
        }
        
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
            amount: tradeAmount,
            price,
            total: action === 'BUY' ? tradeAmount : tradeAmount * price,
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
            this.executeTrade('BUY', asset, true);
        });
        
        document.getElementById('sell-max-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('SELL', asset, true);
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
            this.toggleLessonsList();
        });

        document.getElementById('start-lesson').addEventListener('click', () => {
            const topic = document.getElementById('lesson-select').value;
            this.teacher.startLesson(topic);
        });

        // Словарь терминов
        document.getElementById('teacher-dictionary-btn').addEventListener('click', () => {
            this.teacher.showDictionary();
        });

        document.getElementById('term-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                this.teacher.searchTerm(query);
                e.target.value = '';
            }
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
            this.achievementSystem.incrementRiskCalculatorUses();
        });

        // Быстрый расчет риска
        document.getElementById('risk-entry-quick').addEventListener('click', () => {
            const currentPrice = this.state.prices[this.state.currentAsset];
            document.getElementById('risk-entry').value = currentPrice.toFixed(2);
        });

        document.getElementById('risk-stop-quick').addEventListener('click', () => {
            const currentPrice = this.state.prices[this.state.currentAsset];
            const stopPrice = currentPrice * 0.98;
            document.getElementById('risk-stop').value = stopPrice.toFixed(2);
        });

        // Дневник трейдера
        document.getElementById('show-journal').addEventListener('click', () => {
            this.showJournalDetails();
        });

        document.getElementById('show-advanced-stats').addEventListener('click', () => {
            this.tradingJournal.showAdvancedStats();
        });

        // Клик по индикаторам для объяснения
        document.querySelectorAll('.indicator-label').forEach(label => {
            label.addEventListener('click', (e) => {
                const term = e.target.textContent.trim();
                this.teacher.explainIndicator(term);
            });
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

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e);
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetData();
        });

        // Сохранение данных
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

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Alt + D - открыть словарь
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                this.teacher.showDictionary();
            }
            
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
            
            // Alt + L - уроки
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                this.toggleLessonsList();
            }
            
            // Alt + T - учитель
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTeacherSection();
            }
            
            // Alt + O - создание ордера
            if (e.altKey && e.key === 'o') {
                e.preventDefault();
                document.getElementById('create-order-btn').click();
            }
        });
    }

    toggleTeacherSection() {
        const section = document.getElementById('teacher-section');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }

    toggleLessonsList() {
        const lessons = document.getElementById('teacher-lessons');
        const dictionary = document.getElementById('teacher-dictionary');
        
        lessons.style.display = lessons.style.display === 'none' ? 'block' : 'none';
        dictionary.style.display = 'none';
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
