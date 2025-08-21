class TradingTeacher {
    constructor(tradingApp) {
        this.tradingApp = tradingApp;
        this.lessons = {
            basics: [
                "Трейдинг - это покупка и продажа активов с целью получения прибыли.",
                "Основное правило: покупай дешево, продавай дорого.",
                "Всегда диверсифицируй портфель - не вкладывай все в один актив."
            ],
            indicators: [
                "SMA (простая скользящая средняя) показывает среднюю цену за период.",
                "EMA (экспоненциальная скользящая средняя) больше весиет последние данные.",
                "Когда цена выше SMA - тренд восходящий, ниже - нисходящий."
            ],
            risk: [
                "Никогда не рискуй более 2% от депозита в одной сделке!",
                "Всегда устанавливай стоп-лосс для ограничения убытков.",
                "Соотношение риск/прибыль должно быть не менее 1:2."
            ],
            psychology: [
                "Эмоции - главный враг трейдера. Действуй по плану.",
                "Жадность и страх часто приводят к убыточным сделкам.",
                "Веди дневник трейдера для анализа своих решений."
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
        
        let hint = '';
        if (trend > 0.5) {
            hint = "📈 Восходящий тренд! Рассмотри возможность покупки.";
        } else if (trend < -0.5) {
            hint = "📉 Нисходящий тренд! Будь осторожен с покупками.";
        } else {
            hint = "➡️ Боковой тренд. Жди четкого сигнала.";
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
        const lastPrice = prices[prices.length - 1];
        const sma20 = this.calculateSMA(prices, 20);
        const volumeAvg = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const lastVolume = volumes[volumes.length - 1];

        let analysis = `Текущая цена: ${lastPrice.toFixed(2)}\n`;
        analysis += `SMA(20): ${sma20.toFixed(2)}\n`;
        
        if (lastPrice > sma20) {
            analysis += "✅ Цена выше SMA - бычий сигнал\n";
        } else {
            analysis += "❌ Цена ниже SMA - медвежий сигнал\n";
        }

        if (lastVolume > volumeAvg * 1.5) {
            analysis += "📊 Высокий объем - возможен разворот\n";
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
        this.tg = window.Telegram?.WebApp;
        
        this.init();
    }

    // ... остальной код класса TradingApp без изменений ...

    setupEventListeners() {
        // Существующие обработчики...
        document.getElementById('buy-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('BUY', asset);
        });
        
        document.getElementById('sell-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('SELL', asset);
        });

        // Новые обработчики для учителя
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

        // ... остальные обработчики ...
    }

    toggleTeacherSection() {
        const section = document.getElementById('teacher-section');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }

    toggleLessonsList() {
        const lessons = document.getElementById('teacher-lessons');
        lessons.style.display = lessons.style.display === 'none' ? 'block' : 'none';
    }

    // ... остальные методы класса TradingApp ...
}

document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
