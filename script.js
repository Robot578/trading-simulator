class TradingApp {
    constructor() {
        this.balance = 100.00;
        this.currentAsset = 'BTC';
        this.currentPrice = 0;
        this.priceChange = 0;
        this.portfolio = {
            BTC: 0,
            ETH: 0,
            SOL: 0
        };
        this.tradeHistory = [];
        this.activeOrders = [];
        this.achievements = {
            firstTrade: false,
            profit10: false
        };
        this.chart = null;
        this.candleSeries = null;
        this.volumeSeries = null;
        this.smaSeries = null;
        this.emaSeries = null;
        this.rsiSeries = null;
        this.currentTimeframe = '1h';
        this.chartData = {};
        this.isChartLoading = false;
        
        // Инициализация после полной загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.init();
            });
        } else {
            setTimeout(() => this.init(), 100);
        }
    }

    async init() {
        try {
            console.log('Инициализация приложения...');
            await this.loadSavedData();
            
            // Создаем экземпляры классов
            this.achievementSystem = new AchievementSystem(this);
            this.teacher = new TradingTeacher(this);
            this.orderManager = new OrderManager(this);
            this.riskManager = new RiskManager(this);
            
            // Инициализация UI
            this.achievementSystem.displayAchievements();
            this.initChart();
            this.setupEventListeners();
            this.setupHotkeys();
            this.setupSidebar();
            
            // Загрузка данных графика
            await this.loadInitialData();
            
            // Обновление UI
            this.updateUI();
            this.orderManager.updateOrdersUI();
            
            console.log('Приложение успешно инициализировано');
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка инициализации приложения: ' + error.message);
        }
    }

    initChart() {
        try {
            console.log('Инициализация графика...');
            const chartContainer = document.getElementById('candleChart');
            
            if (!chartContainer) {
                throw new Error('Контейнер для графика не найден');
            }
            
            // Очищаем контейнер
            chartContainer.innerHTML = '';
            
            // Создаем график
            this.chart = LightweightCharts.createChart(chartContainer, {
                width: chartContainer.clientWidth,
                height: chartContainer.clientHeight,
                layout: {
                    backgroundColor: '#1a1a1a',
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
            
            // Создаем свечную серию
            this.candleSeries = this.chart.addCandlestickSeries({
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderDownColor: '#ef5350',
                borderUpColor: '#26a69a',
                wickDownColor: '#ef5350',
                wickUpColor: '#26a69a',
            });
            
            // Создаем серию для объема
            this.volumeSeries = this.chart.addHistogramSeries({
                color: '#26a69a',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '',
                scaleMargins: {
                    top: 0.8,
                    bottom: 0,
                },
            });
            
            // Создаем серии для индикаторов
            this.smaSeries = this.chart.addLineSeries({
                color: '#2962FF',
                lineWidth: 1,
                title: 'SMA 20',
            });
            
            this.emaSeries = this.chart.addLineSeries({
                color: '#FF6D00',
                lineWidth: 1,
                title: 'EMA 12',
            });
            
            // RSI будет на отдельной панели
            const rsiPane = this.chart.addPane(1, { height: 100 });
            this.rsiSeries = rsiPane.addLineSeries({
                color: '#B39DDB',
                lineWidth: 1,
                title: 'RSI 14',
            });
            
            // Обработчик изменения размера
            const resizeObserver = new ResizeObserver(entries => {
                if (entries.length > 0 && this.chart) {
                    const { width, height } = entries[0].contentRect;
                    this.chart.applyOptions({ width, height });
                }
            });
            
            resizeObserver.observe(chartContainer);
            
            console.log('График успешно инициализирован');
            
        } catch (error) {
            console.error('Ошибка инициализации графика:', error);
            this.showError('Не удалось создать график: ' + error.message);
        }
    }

    async loadInitialData() {
        try {
            console.log('Загрузка данных графика...');
            this.showChartLoader(true);
            
            // Генерируем данные для текущего актива и таймфрейма
            await this.generateChartData(this.currentAsset, this.currentTimeframe);
            
            // Обновляем график
            if (this.candleSeries && this.chartData[this.currentAsset]) {
                const data = this.chartData[this.currentAsset];
                
                this.candleSeries.setData(data.candles);
                this.volumeSeries.setData(data.volumes);
                
                // Обновляем индикаторы
                this.updateIndicators();
                
                // Устанавливаем текущую цену
                const lastCandle = data.candles[data.candles.length - 1];
                this.currentPrice = lastCandle.close;
                this.priceChange = ((lastCandle.close - lastCandle.open) / lastCandle.open) * 100;
                
                this.updatePriceDisplay();
            }
            
            this.showChartLoader(false);
            console.log('Данные графика успешно загружены');
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.showChartLoader(false);
            this.showError('Не удалось загрузить данные графика: ' + error.message);
        }
    }

    async generateChartData(asset, timeframe) {
        return new Promise((resolve) => {
            console.log(`Генерация данных для ${asset}/${timeframe}...`);
            
            if (!this.chartData[asset]) {
                this.chartData[asset] = {
                    candles: [],
                    volumes: []
                };
                
                // Базовые цены для разных активов
                const basePrices = {
                    'BTC': 50000,
                    'ETH': 3000,
                    'SOL': 100
                };
                
                // Волатильность для разных активов
                const volatilities = {
                    'BTC': 0.02,
                    'ETH': 0.03,
                    'SOL': 0.05
                };
                
                const basePrice = basePrices[asset] || 100;
                const volatility = volatilities[asset] || 0.02;
                
                let currentPrice = basePrice;
                const now = Math.floor(Date.now() / 1000); // Текущее время в секундах
                const interval = this.getIntervalSeconds(timeframe);
                const candles = [];
                const volumes = [];
                
                // Генерируем 100 свечей
                for (let i = 100; i >= 0; i--) {
                    const time = now - (i * interval);
                    
                    // Генерируем случайное движение цены
                    const changePercent = (Math.random() - 0.5) * volatility;
                    const open = currentPrice;
                    const close = open * (1 + changePercent);
                    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
                    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
                    const volume = Math.random() * 100 + 50;
                    
                    candles.push({
                        time: time,
                        open: open,
                        high: high,
                        low: low,
                        close: close
                    });
                    
                    volumes.push({
                        time: time,
                        value: volume,
                        color: close >= open ? 'rgba(0, 150, 136, 0.5)' : 'rgba(255, 82, 82, 0.5)'
                    });
                    
                    currentPrice = close;
                }
                
                this.chartData[asset].candles = candles;
                this.chartData[asset].volumes = volumes;
            }
            
            console.log(`Данные для ${asset} сгенерированы`);
            resolve(this.chartData[asset]);
        });
    }

    getIntervalSeconds(timeframe) {
        switch (timeframe) {
            case '1h': return 60 * 60;      // 1 час в секундах
            case '4h': return 4 * 60 * 60;  // 4 часа в секундах
            case '1d': return 24 * 60 * 60; // 1 день в секундах
            default: return 60 * 60;
        }
    }

    updateIndicators() {
        if (!this.chartData[this.currentAsset]) return;
        
        const candles = this.chartData[this.currentAsset].candles;
        
        // Обновляем SMA
        try {
            if (document.getElementById('sma-toggle').checked) {
                const smaData = this.calculateSMA(candles, 20);
                this.smaSeries.setData(smaData);
            } else {
                this.smaSeries.setData([]);
            }
        } catch (error) {
            console.error('Ошибка обновления SMA:', error);
        }
        
        // Обновляем EMA
        try {
            if (document.getElementById('ema-toggle').checked) {
                const emaData = this.calculateEMA(candles, 12);
                this.emaSeries.setData(emaData);
            } else {
                this.emaSeries.setData([]);
            }
        } catch (error) {
            console.error('Ошибка обновления EMA:', error);
        }
        
        // Обновляем RSI
        try {
            if (document.getElementById('rsi-toggle').checked) {
                const rsiData = this.calculateRSI(candles, 14);
                this.rsiSeries.setData(rsiData);
            } else {
                this.rsiSeries.setData([]);
            }
        } catch (error) {
            console.error('Ошибка обновления RSI:', error);
        }
    }

    calculateSMA(data, period) {
        const result = [];
        for (let i = period - 1; i < data.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j].close;
            }
            result.push({
                time: data[i].time,
                value: sum / period
            });
        }
        return result;
    }

    calculateEMA(data, period) {
        const result = [];
        const k = 2 / (period + 1);
        let ema = data[0].close;

        for (let i = 0; i < data.length; i++) {
            if (i === 0) {
                ema = data[i].close;
            } else {
                ema = (data[i].close * k) + (ema * (1 - k));
            }
            
            if (i >= period - 1) {
                result.push({
                    time: data[i].time,
                    value: ema
                });
            }
        }
        return result;
    }

    calculateRSI(data, period) {
        if (data.length < period + 1) return [];
        
        const result = [];
        const gains = [];
        const losses = [];

        // Рассчитываем изменения
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }

        // Рассчитываем RSI
        for (let i = period; i < gains.length; i++) {
            let avgGain = 0;
            let avgLoss = 0;

            for (let j = 0; j < period; j++) {
                avgGain += gains[i - j];
                avgLoss += losses[i - j];
            }

            avgGain /= period;
            avgLoss /= period;

            if (avgLoss === 0) {
                result.push({ time: data[i + 1].time, value: 100 });
            } else {
                const rs = avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                result.push({ time: data[i + 1].time, value: rsi });
            }
        }

        return result;
    }

    setupEventListeners() {
        console.log('Настройка обработчиков событий...');
        
        // Выбор актива
        document.getElementById('asset-select').addEventListener('change', (e) => {
            this.currentAsset = e.target.value;
            document.getElementById('current-asset').textContent = `${this.currentAsset}/USDT`;
            this.loadInitialData();
        });
        
        // Переключение таймфреймов
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTimeframe = e.target.dataset.tf;
                this.loadInitialData();
            });
        });
        
        // Переключение индикаторов
        document.getElementById('sma-toggle').addEventListener('change', () => this.updateIndicators());
        document.getElementById('ema-toggle').addEventListener('change', () => this.updateIndicators());
        document.getElementById('rsi-toggle').addEventListener('change', () => this.updateIndicators());
        
        // Торговые кнопки
        document.getElementById('buy-btn').addEventListener('click', () => this.executeTrade('buy'));
        document.getElementById('sell-btn').addEventListener('click', () => this.executeTrade('sell'));
        document.getElementById('buy-max-btn').addEventListener('click', () => this.buyMax());
        
        // Кнопки учителя
        document.getElementById('teacher-hint').addEventListener('click', () => {
            this.teacher.giveHint();
        });
        
        document.getElementById('teacher-analysis').addEventListener('click', () => {
            this.teacher.analyzeMarket();
        });
        
        document.getElementById('teacher-lesson').addEventListener('click', () => {
            this.teacher.giveLesson();
        });
        
        document.getElementById('teacher-dictionary-btn').addEventListener('click', () => {
            const dictionary = document.getElementById('teacher-dictionary');
            dictionary.style.display = dictionary.style.display === 'none' ? 'block' : 'none';
        });
        
        // Риск менеджмент
        document.getElementById('calculate-risk').addEventListener('click', () => {
            this.riskManager.calculateRisk();
        });
        
        // Установка текущей цены в поля ввода при загрузке
        document.getElementById('risk-entry').value = this.currentPrice.toFixed(2);
        document.getElementById('risk-stop').value = (this.currentPrice * 0.98).toFixed(2);
        
        // Управление данными
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
        document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));
        document.getElementById('reset-btn').addEventListener('click', () => this.resetData());
        
        // Навигация по секциям
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionId = e.target.dataset.section + '-section';
                const section = document.getElementById(sectionId);
                
                if (section) {
                    // Скрываем все секции
                    document.querySelectorAll('.content-section').forEach(s => {
                        s.style.display = 'none';
                    });
                    
                    // Показываем выбранную секцию
                    section.style.display = 'block';
                    
                    // Обновляем активную кнопку
                    document.querySelectorAll('.nav-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                }
            });
        });
        
        // Закрытие секций
        document.querySelectorAll('.close-section').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.content-section').style.display = 'none';
            });
        });
        
        console.log('Обработчики событий настроены');
    }

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Покупка/продажа по горячим клавишам
            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                this.executeTrade('buy');
            } else if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                this.executeTrade('sell');
            }
        });
    }

    setupSidebar() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    executeTrade(type) {
        try {
            const amountInput = document.getElementById('trade-amount');
            const amount = parseFloat(amountInput.value);
            
            if (isNaN(amount) || amount <= 0) {
                this.showError('Введите корректную сумму');
                return;
            }
            
            if (type === 'buy') {
                if (amount > this.balance) {
                    this.showError('Недостаточно средств');
                    return;
                }
                
                const assetAmount = amount / this.currentPrice;
                this.portfolio[this.currentAsset] += assetAmount;
                this.balance -= amount;
                
                this.tradeHistory.push({
                    type: 'buy',
                    asset: this.currentAsset,
                    amount: assetAmount,
                    price: this.currentPrice,
                    total: amount,
                    time: new Date().toLocaleString()
                });
                
                this.teacher.showMessage(`Куплено ${assetAmount.toFixed(6)} ${this.currentAsset} по цене ${this.currentPrice.toFixed(2)} USDT`);
                
            } else if (type === 'sell') {
                const assetAmount = amount / this.currentPrice;
                
                if (assetAmount > this.portfolio[this.currentAsset]) {
                    this.showError('Недостаточно активов для продажи');
                    return;
                }
                
                const revenue = assetAmount * this.currentPrice;
                this.portfolio[this.currentAsset] -= assetAmount;
                this.balance += revenue;
                
                this.tradeHistory.push({
                    type: 'sell',
                    asset: this.currentAsset,
                    amount: assetAmount,
                    price: this.currentPrice,
                    total: revenue,
                    time: new Date().toLocaleString()
                });
                
                this.teacher.showMessage(`Продано ${assetAmount.toFixed(6)} ${this.currentAsset} по цене ${this.currentPrice.toFixed(2)} USDT`);
            }
            
            // Проверяем достижения
            this.achievementSystem.checkAchievements();
            
            // Обновляем UI
            this.updateUI();
            this.updateHistoryUI();
            this.saveData();
            
        } catch (error) {
            console.error('Ошибка выполнения сделки:', error);
            this.showError('Ошибка выполнения сделки');
        }
    }

    buyMax() {
        const maxAmount = this.balance;
        document.getElementById('trade-amount').value = maxAmount.toFixed(2);
        this.executeTrade('buy');
    }

    updateUI() {
        // Обновляем баланс
        document.getElementById('balance').textContent = `${this.balance.toFixed(2)} USDT`;
        
        // Обновляем портфель
        document.getElementById('btc-amount').textContent = this.portfolio.BTC.toFixed(6);
        document.getElementById('eth-amount').textContent = this.portfolio.ETH.toFixed(6);
        document.getElementById('sol-amount').textContent = this.portfolio.SOL.toFixed(6);
        
        // Рассчитываем общую стоимость
        const totalValue = this.balance + 
            (this.portfolio.BTC * this.getAssetPrice('BTC')) +
            (this.portfolio.ETH * this.getAssetPrice('ETH')) +
            (this.portfolio.SOL * this.getAssetPrice('SOL'));
        
        document.getElementById('total-value').textContent = `${totalValue.toFixed(2)} USDT`;
        
        // Обновляем статистику
        this.updateStatsUI();
    }

    getAssetPrice(asset) {
        // Для простоты используем текущую цену для всех активов
        // В реальном приложении здесь были бы разные цены для разных активов
        return this.currentPrice * (asset === 'BTC' ? 1 : asset === 'ETH' ? 0.06 : 0.002);
    }

    updatePriceDisplay() {
        document.getElementById('current-price').textContent = this.currentPrice.toFixed(2);
        
        const priceChangeElement = document.getElementById('price-change');
        priceChangeElement.textContent = `${this.priceChange >= 0 ? '+' : ''}${this.priceChange.toFixed(2)}%`;
        priceChangeElement.className = `price-change ${this.priceChange >= 0 ? 'positive' : 'negative'}`;
        
        // Обновляем поля калькулятора риска
        document.getElementById('risk-entry').value = this.currentPrice.toFixed(2);
        document.getElementById('risk-stop').value = (this.currentPrice * 0.98).toFixed(2);
    }

    updateHistoryUI() {
        const historyContainer = document.getElementById('history-items');
        
        if (this.tradeHistory.length === 0) {
            historyContainer.innerHTML = '<div class="empty-history">Сделок пока нет</div>';
            return;
        }
        
        historyContainer.innerHTML = this.tradeHistory.map(trade => `
            <div class="history-item ${trade.type}">
                <div class="history-type">${trade.type === 'buy' ? '🟢 Куплено' : '🔴 Продано'}</div>
                <div class="history-details">
                    <span>${trade.asset}/USDT</span>
                    <span>${trade.amount.toFixed(6)}</span>
                    <span>${trade.price.toFixed(2)} USDT</span>
                </div>
                <div class="history-total">${trade.total.toFixed(2)} USDT</div>
                <div class="history-time">${trade.time}</div>
            </div>
        `).reverse().join('');
    }

    updateStatsUI() {
        const totalTrades = this.tradeHistory.length;
        const winningTrades = this.tradeHistory.filter(trade => trade.type === 'sell').length;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;
        
        document.getElementById('total-trades').querySelector('.stat-value').textContent = totalTrades;
        document.getElementById('win-rate').querySelector('.stat-value').textContent = `${winRate.toFixed(1)}%`;
    }

    showChartLoader(show) {
        const loader = document.getElementById('chartLoadingOverlay');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
        this.isChartLoading = show;
    }

    showError(message) {
        // Простой вывод ошибки
        alert(`Ошибка: ${message}`);
    }

    async loadSavedData() {
        try {
            const savedData = localStorage.getItem('tradeLearnData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.balance = data.balance || this.balance;
                this.portfolio = data.portfolio || this.portfolio;
                this.tradeHistory = data.tradeHistory || this.tradeHistory;
                this.achievements = data.achievements || this.achievements;
                this.currentAsset = data.currentAsset || this.currentAsset;
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    saveData() {
        try {
            const data = {
                balance: this.balance,
                portfolio: this.portfolio,
                tradeHistory: this.tradeHistory,
                achievements: this.achievements,
                currentAsset: this.currentAsset
            };
            
            localStorage.setItem('tradeLearnData', JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }

    exportData() {
        const data = {
            balance: this.balance,
            portfolio: this.portfolio,
            tradeHistory: this.tradeHistory,
            achievements: this.achievements,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `tradelearn-data-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.teacher.showMessage('Данные успешно экспортированы');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                this.balance = data.balance || this.balance;
                this.portfolio = data.portfolio || this.portfolio;
                this.tradeHistory = data.tradeHistory || this.tradeHistory;
                this.achievements = data.achievements || this.achievements;
                
                this.updateUI();
                this.updateHistoryUI();
                this.achievementSystem.displayAchievements();
                
                this.teacher.showMessage('Данные успешно импортированы');
                this.saveData();
            } catch (error) {
                console.error('Ошибка импорта данных:', error);
                this.showError('Неверный формат файла');
            }
        };
        
        reader.readAsText(file);
        event.target.value = '';
    }

    resetData() {
        if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
            this.balance = 100.00;
            this.portfolio = { BTC: 0, ETH: 0, SOL: 0 };
            this.tradeHistory = [];
            this.achievements = { firstTrade: false, profit10: false };
            
            this.updateUI();
            this.updateHistoryUI();
            this.achievementSystem.displayAchievements();
            this.saveData();
            
            this.teacher.showMessage('Данные сброшены. Начинаем заново!');
        }
    }
}

class TradingTeacher {
    constructor(app) {
        this.app = app;
        this.hints = [
            "Обратите внимание на объем торгов - он подтверждает тренд.",
            "Сильный тренд часто сопровождается возрастающими объемами.",
            "Используйте несколько таймфреймов для анализа - от большего к меньшему.",
            "Не открывайте сделки против основного тренда.",
            "Сравнивайте поведение цены с индикаторами для подтверждения сигналов."
        ];
        
        this.lessons = [
            "Урок 1: Основы свечного анализа - научитесь читать японские свечи.",
            "Урок 2: Тренды и линии поддержки/сопротивления - ключевые уровни цены.",
            "Урок 3: Индикаторы технического анализа - как использовать SMA, EMA, RSI.",
            "Урок 4: Управление рисками - размер позиции и стоп-лосс.",
            "Урок 5: Психология трейдинга - контроль эмоций и дисциплина."
        ];
    }

    showMessage(message) {
        const messageElement = document.getElementById('teacher-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }

    giveHint() {
        const randomHint = this.hints[Math.floor(Math.random() * this.hints.length)];
        this.showMessage(`💡 Подсказка: ${randomHint}`);
    }

    analyzeMarket() {
        const trends = ['восходящий', 'нисходящий', 'боковой'];
        const strengths = ['сильный', 'умеренный', 'слабый'];
        const recommendations = ['открывать long-позиции', 'открывать short-позиции', 'воздержаться от торговли'];
        
        const trend = trends[Math.floor(Math.random() * trends.length)];
        const strength = strengths[Math.floor(Math.random() * strengths.length)];
        const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
        
        this.showMessage(`📊 Анализ рынка: ${strength} ${trend} тренд. Рекомендация: ${recommendation}.`);
    }

    giveLesson() {
        const randomLesson = this.lessons[Math.floor(Math.random() * this.lessons.length)];
        this.showMessage(`📚 ${randomLesson}`);
    }
}

class OrderManager {
    constructor(app) {
        this.app = app;
    }

    createOrder(type, price, amount) {
        const order = {
            id: Date.now(),
            type: type,
            asset: this.app.currentAsset,
            price: parseFloat(price),
            amount: parseFloat(amount),
            status: 'active',
            createdAt: new Date().toLocaleString()
        };
        
        this.app.activeOrders.push(order);
        this.updateOrdersUI();
        
        this.app.teacher.showMessage(`Создан ${type === 'STOP' ? 'стоп-лосс' : 'тейк-профит'} ордер для ${this.app.currentAsset}`);
    }

    updateOrdersUI() {
        const ordersContainer = document.getElementById('orders-container');
        
        if (this.app.activeOrders.length === 0) {
            ordersContainer.innerHTML = '<div class="empty-orders">Активных ордеров нет</div>';
            return;
        }
        
        ordersContainer.innerHTML = this.app.activeOrders.map(order => `
            <div class="order-item">
                <div class="order-type">${order.type === 'STOP' ? '🛑 Стоп-лосс' : '✅ Тейк-профит'}</div>
                <div class="order-details">
                    <span>${order.asset}/USDT</span>
                    <span>${order.amount.toFixed(6)}</span>
                    <span>${order.price.toFixed(2)} USDT</span>
                </div>
                <div class="order-time">${order.createdAt}</div>
                <button class="cancel-order" data-id="${order.id}">❌</button>
            </div>
        `).join('');
        
        // Добавляем обработчики для кнопок отмены
        ordersContainer.querySelectorAll('.cancel-order').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = parseInt(btn.dataset.id);
                this.cancelOrder(orderId);
            });
        });
    }

    cancelOrder(orderId) {
        this.app.activeOrders = this.app.activeOrders.filter(order => order.id !== orderId);
        this.updateOrdersUI();
        this.app.teacher.showMessage('Ордер отменен');
    }
}

class RiskManager {
    constructor(app) {
        this.app = app;
    }

    calculateRisk() {
        const deposit = parseFloat(document.getElementById('risk-deposit').value) || this.app.balance;
        const riskPercent = parseFloat(document.getElementById('risk-percent').value) || 2;
        const entryPrice = parseFloat(document.getElementById('risk-entry').value) || this.app.currentPrice;
        const stopPrice = parseFloat(document.getElementById('risk-stop').value) || (this.app.currentPrice * 0.98);
        
        if (entryPrice <= stopPrice) {
            document.getElementById('risk-results').innerHTML = '<div class="risk-error">Цена входа должна быть выше стоп-лосса</div>';
            return;
        }
        
        const riskAmount = deposit * (riskPercent / 100);
        const priceDifference = entryPrice - stopPrice;
        const volume = riskAmount / priceDifference;
        
        document.getElementById('risk-volume').textContent = volume.toFixed(6);
        document.getElementById('risk-amount').textContent = `${riskAmount.toFixed(2)} USDT`;
    }
}

class AchievementSystem {
    constructor(app) {
        this.app = app;
        this.achievements = [
            {
                id: 'firstTrade',
                title: 'Первая сделка',
                description: 'Совершите первую торговую операцию',
                icon: '🎯',
                check: () => this.app.tradeHistory.length > 0
            },
            {
                id: 'profit10',
                title: 'Профит +10%',
                description: 'Достигните прибыли +10% от начального депозита',
                icon: '💰',
                check: () => {
                    const totalValue = this.app.balance + 
                        (this.app.portfolio.BTC * this.app.getAssetPrice('BTC')) +
                        (this.app.portfolio.ETH * this.app.getAssetPrice('ETH')) +
                        (this.app.portfolio.SOL * this.app.getAssetPrice('SOL'));
                    return totalValue >= 110; // Начальный депозит 100 USDT
                }
            }
        ];
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!this.app.achievements[achievement.id] && achievement.check()) {
                this.app.achievements[achievement.id] = true;
                this.unlockAchievement(achievement);
            }
        });
        
        this.app.saveData();
    }

    unlockAchievement(achievement) {
        this.app.teacher.showMessage(`🏆 Достижение разблокировано: ${achievement.title}!`);
        this.displayAchievements();
    }

    displayAchievements() {
        const container = document.getElementById('achievements-container');
        if (!container) return;
        
        container.innerHTML = this.achievements.map(achievement => {
            const unlocked = this.app.achievements[achievement.id];
            return `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    ${unlocked ? '<div class="achievement-badge">✔️</div>' : ''}
                </div>
            `;
        }).join('');
    }
}

// Инициализация приложения
let tradingApp;

// Запускаем приложение после полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    tradingApp = new TradingApp();
});

// Обработчик изменения размера окна
window.addEventListener('resize', function() {
    if (tradingApp && tradingApp.chart) {
        const chartContainer = document.getElementById('candleChart');
        if (chartContainer) {
            tradingApp.chart.resize(
                chartContainer.clientWidth,
                chartContainer.clientHeight
            );
        }
    }
});
