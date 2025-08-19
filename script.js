class TradingTeacher {
    constructor() {
        this.lessons = {
            basics: [
                "📚 Добро пожаловать в трейдинг! Трейдинг - это покупка и продажа активов с целью заработка на разнице цен.",
                "💰 Ключевые понятия: LONG (покупка в расчете на рост) и SHORT (продажа в расчете на падение).",
                "⏰ Таймфреймы важны! Дневные графики для стратегии, часовые - для точных входов, минутные - для скальпинга.",
                "🎯 Риск-менеджмент: никогда не рискуй более 2% депозита в одной сделке! Это золотое правило.",
                "📊 Анализируй объемы торгов: большой объем подтверждает движение цены. Маленький объем - возможный разворот.",
                "🔐 Всегда используй стоп-лосс! Защищай свой депозит от больших потерь.",
                "💡 Начинай с демо-счета! Только после стабильной прибыли переходи на реальные деньги."
            ],
            analysis: [
                "📈 Технический анализ: изучай графики и индикаторы для предсказания движения цены.",
                "🕯️ Японские свечи: каждая свеча показывает цену открытия, закрытия, максимум и минимум за период.",
                "📉 Медвежья свеча (красная) - цена закрытия ниже открытия. Бычья свеча (зеленая) - цена закрытия выше открытия.",
                "🎪 Паттерны: 'голова и плечи', 'двойное дно', 'флаг' - помогают предсказать развороты тренда.",
                "📡 Индикаторы: RSI показывает перекупленность/перепроданность, SMA - среднюю цену, MACD - momentum.",
                "🌊 Волны Эллиотта: цена движется импульсами и коррекциями. 5 волн вверх, 3 волны вниз.",
                "📊 Уровни поддержки и сопротивления: цена часто отскакивает от этих уровней."
            ],
            strategy: [
                "🎮 Стратегия - твой план действий. Без стратегии это азартная игра, а не трейдинг!",
                "🔍 Пример стратегии: покупай когда RSI ниже 30 (перепроданность), продавай когда выше 70 (перекупленность).",
                "⏱️ Скальпинг: много быстрых сделок с маленькой прибылью. Нужна хорошая концентрация.",
                "📈 Свинг-трейдинг: сделки на несколько дней. Меньше стресса, больше времени на анализ.",
                "📝 Веди дневник трейдера: записывай все сделки, анализируй ошибки, улучшай стратегию.",
                "🧘 Дисциплина важнее таланта! Следуй своему плану и управляй эмоциями.",
                "⚖️ Диверсификация: не вкладывай все в один актив. Распределяй риски."
            ]
        };
        
        this.currentProgress = 0;
        this.completedLessons = new Set();
    }

    getLesson(lessonType) {
        const lesson = this.lessons[lessonType];
        if (lesson) {
            return lesson[Math.floor(Math.random() * lesson.length)];
        }
        return "Выберите тему для обучения!";
    }

    getHint() {
        const hints = [
            "💡 Совет: начни с малых сумм пока не наберешься опыта! Не спеши заработать миллион за день.",
            "👀 Смотри на объем торгов - он подтверждает тренд! Большой объем = сильное движение.",
            "📆 Изучи экономический календарь - новости влияют на цены! FOMC, NFP, CPI - важные события.",
            "🧠 Не поддавайся FOMO (страх упустить выгоду) - терпение важнее скорости!",
            "📚 Изучи бестселлеры: 'Трейдинг для начинающих', 'Дисциплинированный трейдер'.",
            "⚡ Избегай эмоциональных решений! Торгуй по плану, а не из-за жадности или страха.",
            "🔄 Анализируй свои сделки: что работало, что нет? Учись на ошибках."
        ];
        return hints[Math.floor(Math.random() * hints.length)];
    }

    updateProgress() {
        this.currentProgress = Math.min(100, this.currentProgress + 8);
        document.getElementById('progress-fill').style.width = this.currentProgress + '%';
        document.getElementById('progress-text').textContent = this.currentProgress + '%';
        
        if (this.currentProgress >= 100) {
            document.getElementById('teacher-message').textContent = 
                "🎉 Поздравляю! Ты завершил базовый курс! Продолжай практиковаться!";
        }
    }
}

class TradingApp {
    constructor() {
        this.state = {
            balance: 10000,
            portfolio: { BTC: 0, ETH: 0, SOL: 0 },
            prices: { BTC: 0, ETH: 0, SOL: 0 },
            history: [],
            chart: null,
            candleSeries: null,
            socket: null,
            candles: [],
            currentAsset: 'BTC'
        };

        this.teacher = new TradingTeacher();
        this.init();
    }

    async init() {
        this.initChart();
        this.setupEventListeners();
        this.setupTeacher();
        await this.loadInitialData();
        this.updateUI();
    }

    setupTeacher() {
        const content = document.getElementById('teacher-content');
        const toggle = document.getElementById('teacher-toggle');
        
        toggle.addEventListener('click', () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            toggle.textContent = content.style.display === 'none' ? '▼' : '▲';
        });

        document.querySelectorAll('.teacher-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lesson = e.target.dataset.lesson;
                let message;
                
                if (lesson === 'hint') {
                    message = this.teacher.getHint();
                } else {
                    message = this.teacher.getLesson(lesson);
                    if (!this.teacher.completedLessons.has(lesson)) {
                        this.teacher.completedLessons.add(lesson);
                        this.teacher.updateProgress();
                    }
                }
                
                document.getElementById('teacher-message').textContent = message;
            });
        });
    }

    initChart() {
        const chartContainer = document.getElementById('candleChart');
        chartContainer.innerHTML = '';

        this.state.chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
            layout: {
                backgroundColor: '#1e293b',
                textColor: '#e2e8f0',
                fontSize: 12
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.5)' }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#2a2e39'
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal
            }
        });

        this.state.candleSeries = this.state.chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#10b981',
            wickDownColor: '#ef4444',
            wickUpColor: '#10b981',
            borderVisible: true,
            wickVisible: true
        });

        document.getElementById('chartLoader').style.display = 'none';
    }

    async loadInitialData() {
        const asset = document.getElementById('asset-select').value;
        this.state.currentAsset = asset;
        await this.fetchCandles(asset);
        this.connectWebSocket();
    }

    async fetchCandles(asset) {
        const symbol = `${asset}USDT`;
        
        try {
            document.getElementById('chartLoader').style.display = 'block';
            
            const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`);
            const data = await response.json();

            this.state.candles = data.map(item => ({
                time: item[0] / 1000,
                open: parseFloat(item[1]),
                high: parseFloat(item[2]),
                low: parseFloat(item[3]),
                close: parseFloat(item[4])
            }));

            this.state.candleSeries.setData(this.state.candles);
            
            const lastPrice = parseFloat(data[data.length - 1][4]);
            this.state.prices[asset] = lastPrice;
            
            document.getElementById('current-price').textContent = lastPrice.toFixed(2);
            document.getElementById('price-change').textContent = '+0.00%';
            document.getElementById('price-change').style.color = '#10b981';
            
            document.getElementById('chartLoader').style.display = 'none';
            
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            document.getElementById('chartLoader').textContent = "Ошибка загрузки данных";
        }
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

                this.state.prices[asset] = price;
                
                document.getElementById('current-price').textContent = price.toFixed(2);
                document.getElementById('price-change').textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                document.getElementById('price-change').style.color = change >= 0 ? '#10b981' : '#ef4444';
                
            } catch (error) {
                console.error("Ошибка обработки WebSocket сообщения:", error);
            }
        };

        this.state.socket.onerror = (error) => {
            console.error("WebSocket ошибка:", error);
        };

        this.state.socket.onclose = () => {
            console.log("WebSocket соединение закрыто");
        };
    }

    executeTrade(action, asset) {
        const amountInput = document.getElementById('trade-amount');
        const amount = parseFloat(amountInput.value);
        
        if (isNaN(amount) || amount <= 0) {
            this.showAlert('Введите корректную сумму!');
            amountInput.focus();
            return;
        }

        const price = this.state.prices[asset];
        let message = '';

        if (action === 'BUY') {
            const amountBought = amount / price;
            if (amount > this.state.balance) {
                this.showAlert('Недостаточно средств на балансе!');
                return;
            }
            
            this.state.balance -= amount;
            this.state.portfolio[asset] = (this.state.portfolio[asset] || 0) + amountBought;
            message = `✅ Куплено ${amountBought.toFixed(6)} ${asset} за ${amount.toFixed(2)} USDT`;
            
            setTimeout(() => {
                document.getElementById('teacher-message').textContent = 
                    "💡 После покупки установи стоп-лосс на 2-3% ниже цены входа для защиты депозита!";
            }, 2000);
            
        } else {
            if (!this.state.portfolio[asset] || this.state.portfolio[asset] <= 0) {
                this.showAlert(`Недостаточно ${asset} для продажи!`);
                return;
            }
            
            if (amount > this.state.portfolio[asset]) {
                this.showAlert(`Нельзя продать больше ${this.state.portfolio[asset].toFixed(6)} ${asset}`);
                return;
            }
            
            const total = amount * price;
            this.state.balance += total;
            this.state.portfolio[asset] -= amount;
            message = `🔴 Продано ${amount.toFixed(6)} ${asset} за ${total.toFixed(2)} USDT`;
            
            setTimeout(() => {
                document.getElementById('teacher-message').textContent = 
                    "💡 Фиксируй прибыль постепенно! Не жди максимума - цена может развернуться.";
            }, 2000);
        }

        this.state.history.push({
            type: action,
            asset,
            amount,
            price,
            total: action === 'BUY' ? amount : amount * price,
            timestamp: new Date().toLocaleString()
        });

        this.showAlert(message);
        this.updateUI();
    }

    updateUI() {
        document.getElementById('balance').textContent = this.state.balance.toFixed(2) + ' USDT';
        document.getElementById('btc-amount').textContent = (this.state.portfolio.BTC || 0).toFixed(6);
        document.getElementById('eth-amount').textContent = (this.state.portfolio.ETH || 0).toFixed(6);
        document.getElementById('sol-amount').textContent = (this.state.portfolio.SOL || 0).toFixed(6);
        this.updateHistory();
    }

    updateHistory() {
        const container = document.getElementById('history-items');
        container.innerHTML = '';
        
        if (this.state.history.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px;">Сделок пока нет</div>';
            return;
        }
        
        this.state.history.slice().reverse().forEach(trade => {
            const item = document.createElement('div');
            item.className = `history-item ${trade.type.toLowerCase()}`;
            item.innerHTML = `
                <div class="trade-type">${trade.type === 'BUY' ? '🟢 Куплено' : '🔴 Продано'} ${trade.asset}</div>
                <div class="trade-details">
                    <span>${trade.amount.toFixed(6)} ${trade.asset} по ${trade.price.toFixed(2)} USDT</span>
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
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
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
            this.loadInitialData();
        });

        document.getElementById('trade-amount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const asset = document.getElementById('asset-select').value;
                this.executeTrade('BUY', asset);
            }
        });
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
