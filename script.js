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
        
        this.init();
    }

    async init() {
        await this.loadSavedData();
        this.achievementSystem = new AchievementSystem(this);
        this.teacher = new TradingTeacher(this);
        this.orderManager = new OrderManager(this);
        this.riskManager = new RiskManager(this);
        
        this.achievementSystem.displayAchievements();
        this.initChart();
        this.setupEventListeners();
        this.setupHotkeys();
        this.setupSidebar();
        await this.loadInitialData();
        this.updateUI();
        this.orderManager.updateOrdersUI();
        
        setTimeout(() => {
            this.teacher.addInteractiveTips();
        }, 1000);
    }

    setupSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content-wrapper');
        const toggleBtn = document.getElementById('sidebar-toggle');
        const navButtons = document.querySelectorAll('.nav-btn');
        const contentSections = document.querySelector('.content-sections');
        const closeButtons = document.querySelectorAll('.close-section');

        // Переключение боковой панели
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            mainContent.classList.toggle('expanded');
        });

        // Навигация по секциям
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                
                // Убрать активный класс со всех кнопок
                navButtons.forEach(b => b.classList.remove('active'));
                // Добавить активный класс к текущей кнопке
                e.currentTarget.classList.add('active');
                
                // Показать соответствующую секцию
                this.showSection(section);
            });
        });

        // Закрытие секций
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllSections();
                // Активировать кнопку графика
                document.querySelector('[data-section="chart"]').classList.add('active');
            });
        });

        // Закрытие секций при клике вне их
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.content-sections') && 
                !e.target.closest('.nav-btn') && 
                contentSections.style.display === 'block') {
                this.hideAllSections();
                document.querySelector('[data-section="chart"]').classList.add('active');
            }
        });
    }

    showSection(section) {
        const contentSections = document.querySelector('.content-sections');
        const allSections = document.querySelectorAll('.content-section');
        
        // Скрыть все секции
        allSections.forEach(sec => {
            sec.style.display = 'none';
        });
        
        // Показать выбранную секцию
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            contentSections.style.display = 'block';
        }
    }

    hideAllSections() {
        const contentSections = document.querySelector('.content-sections');
        const allSections = document.querySelectorAll('.content-section');
        
        allSections.forEach(sec => {
            sec.style.display = 'none';
        });
        
        contentSections.style.display = 'none';
    }

    initChart() {
        const chartContainer = document.getElementById('candleChart');
        chartContainer.innerHTML = '';
        
        this.chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
            layout: {
                backgroundColor: '#ffffff',
                textColor: '#1e293b',
            },
            grid: {
                vertLines: {
                    color: '#e2e8f0',
                },
                horzLines: {
                    color: '#e2e8f0',
                },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: '#e2e8f0',
            },
            timeScale: {
                borderColor: '#e2e8f0',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        this.candleSeries = this.chart.addCandlestickSeries({
            upColor: '#00c853',
            downColor: '#ff1744',
            borderDownColor: '#ff1744',
            borderUpColor: '#00c853',
            wickDownColor: '#ff1744',
            wickUpColor: '#00c853',
        });

        this.volumeSeries = this.chart.addHistogramSeries({
            color: '#2962ff',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        // Индикаторы
        this.smaSeries = this.chart.addLineSeries({
            color: '#2962ff',
            lineWidth: 2,
            priceScaleId: 'left',
            title: 'SMA 20',
        });

        this.emaSeries = this.chart.addLineSeries({
            color: '#ff6d00',
            lineWidth: 2,
            priceScaleId: 'left',
            title: 'EMA 12',
        });

        // RSI будет на отдельной панели
        this.rsiPane = this.chart.addPane();
        this.rsiSeries = this.rsiPane.addLineSeries({
            color: '#8e24aa',
            lineWidth: 2,
            priceScaleId: 'rsi',
            title: 'RSI 14',
        });

        this.rsiPane.height(100);

        // Подсказка при наведении
        this.chart.subscribeCrosshairMove(param => {
            this.handleCrosshairMove(param);
        });

        // Ресайз графика
        new ResizeObserver(entries => {
            if (entries.length === 0) return;
            const { width, height } = entries[0].contentRect;
            this.chart.applyOptions({ width, height });
        }).observe(chartContainer);
    }

    async loadInitialData() {
        this.showChartLoader();
        
        try {
            // Загружаем данные для всех активов и таймфреймов
            const assets = ['BTC', 'ETH', 'SOL'];
            const timeframes = ['1h', '4h', '1d'];
            
            for (const asset of assets) {
                this.chartData[asset] = {};
                for (const tf of timeframes) {
                    const data = await this.fetchChartData(asset, tf);
                    this.chartData[asset][tf] = data;
                }
            }
            
            // Показываем данные для текущего актива и таймфрейма
            await this.updateChartData();
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.teacher.showMessage('Ошибка загрузки данных. Проверьте подключение к интернету.', 'error');
        } finally {
            this.hideChartLoader();
        }
    }

    async fetchChartData(asset, timeframe) {
        // Имитация загрузки данных с сервера
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const data = [];
        const now = Date.now();
        const interval = this.getIntervalMs(timeframe);
        let price = this.getInitialPrice(asset);
        
        // Генерируем 200 свечей
        for (let i = 200; i >= 0; i--) {
            const time = now - (i * interval);
            const open = price;
            
            // Генерируем случайное движение цены
            const change = (Math.random() - 0.5) * this.getVolatility(asset);
            price = price * (1 + change);
            
            const high = open * (1 + Math.abs(change) * 1.2);
            const low = open * (1 - Math.abs(change) * 0.8);
            const close = price;
            const volume = Math.random() * 1000 + 500;
            
            data.push({
                time: Math.floor(time / 1000),
                open,
                high,
                low,
                close,
                volume
            });
        }
        
        return data;
    }

    getIntervalMs(timeframe) {
        switch (timeframe) {
            case '1h': return 60 * 60 * 1000;
            case '4h': return 4 * 60 * 60 * 1000;
            case '1d': return 24 * 60 * 60 * 1000;
            default: return 60 * 60 * 1000;
        }
    }

    getInitialPrice(asset) {
        switch (asset) {
            case 'BTC': return 50000 + Math.random() * 10000;
            case 'ETH': return 3000 + Math.random() * 1000;
            case 'SOL': return 100 + Math.random() * 50;
            default: return 100;
        }
    }

    getVolatility(asset) {
        switch (asset) {
            case 'BTC': return 0.02;
            case 'ETH': return 0.03;
            case 'SOL': return 0.05;
            default: return 0.01;
        }
    }

    async updateChartData() {
        if (!this.chartData[this.currentAsset] || !this.chartData[this.currentAsset][this.currentTimeframe]) {
            return;
        }

        const data = this.chartData[this.currentAsset][this.currentTimeframe];
        this.candleSeries.setData(data.map(d => ({
            time: d.time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close
        })));

        this.volumeSeries.setData(data.map(d => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(0, 200, 83, 0.5)' : 'rgba(255, 23, 68, 0.5)'
        })));

        // Обновляем индикаторы
        this.updateIndicators(data);
        
        // Обновляем текущую цену
        const lastCandle = data[data.length - 1];
        this.currentPrice = lastCandle.close;
        this.priceChange = ((lastCandle.close - lastCandle.open) / lastCandle.open) * 100;
        
        this.updatePriceDisplay();
    }

    updateIndicators(data) {
        // SMA 20
        if (document.getElementById('sma-toggle').checked) {
            const smaData = this.calculateSMA(data, 20);
            this.smaSeries.setData(smaData);
        } else {
            this.smaSeries.setData([]);
        }

        // EMA 12
        if (document.getElementById('ema-toggle').checked) {
            const emaData = this.calculateEMA(data, 12);
            this.emaSeries.setData(emaData);
        } else {
            this.emaSeries.setData([]);
        }

        // RSI 14
        if (document.getElementById('rsi-toggle').checked) {
            const rsiData = this.calculateRSI(data, 14);
            this.rsiSeries.setData(rsiData);
        } else {
            this.rsiSeries.setData([]);
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
                ema = (data[i].close - ema) * k + ema;
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
                result.push({ time: data[i].time, value: 100 });
            } else {
                const rs = avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                result.push({ time: data[i].time, value: rsi });
            }
        }

        return result;
    }

    handleCrosshairMove(param) {
        const tooltip = document.getElementById('chart-tooltip');
        
        if (!param.point) {
            tooltip.style.display = 'none';
            return;
        }

        const data = param.seriesData.get(this.candleSeries);
        if (!data) {
            tooltip.style.display = 'none';
            return;
        }

        const price = data.close;
        const change = ((price - data.open) / data.open) * 100;
        const changeClass = change >= 0 ? 'positive' : 'negative';

        tooltip.innerHTML = `
            <h4>${this.currentAsset}/USDT</h4>
            <p>Время: ${new Date(data.time * 1000).toLocaleString()}</p>
            <p>Цена: <span class="price">${price.toFixed(2)} USDT</span></p>
            <p>Изменение: <span class="change ${changeClass}">${change.toFixed(2)}%</span></p>
            <p>Объем: ${data.volume ? data.volume.toFixed(2) : '0'} USDT</p>
        `;

        const chartContainer = document.getElementById('candleChart');
        const rect = chartContainer.getBoundingClientRect();
        
        tooltip.style.left = (param.point.x + 20) + 'px';
        tooltip.style.top = (param.point.y - 60) + 'px';
        tooltip.style.display = 'block';
    }

    updatePriceDisplay() {
        document.getElementById('current-price').textContent = this.currentPrice.toFixed(2);
        document.getElementById('price-change').textContent = `${this.priceChange >= 0 ? '+' : ''}${this.priceChange.toFixed(2)}%`;
        
        const priceChangeElement = document.getElementById('price-change');
        priceChangeElement.className = `price-change ${this.priceChange >= 0 ? 'positive' : 'negative'}`;
        
        if (this.priceChange >= 0) {
            priceChangeElement.style.background = 'var(--profit-light)';
            priceChangeElement.style.color = 'var(--profit-dark)';
        } else {
            priceChangeElement.style.background = 'var(--loss-light)';
            priceChangeElement.style.color = 'var(--loss-dark)';
        }
    }

    showChartLoader() {
        this.isChartLoading = true;
        document.getElementById('chartLoadingOverlay').style.display = 'flex';
        document.getElementById('chartLoader').style.display = 'block';
    }

    hideChartLoader() {
        this.isChartLoading = false;
        document.getElementById('chartLoadingOverlay').style.display = 'none';
        document.getElementById('chartLoader').style.display = 'none';
    }

    setupEventListeners() {
        // Переключение актива
        document.getElementById('asset-select').addEventListener('change', (e) => {
            this.currentAsset = e.target.value;
            this.updateChartData();
            this.updateUI();
        });

        // Переключение таймфрейма
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTimeframe = e.target.dataset.tf;
                
                document.querySelectorAll('.timeframe-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                
                this.updateChartData();
            });
        });

        // Переключение индикаторов
        document.getElementById('sma-toggle').addEventListener('change', () => {
            this.updateChartData();
        });

        document.getElementById('ema-toggle').addEventListener('change', () => {
            this.updateChartData();
        });

        document.getElementById('rsi-toggle').addEventListener('change', () => {
            this.updateChartData();
        });

        // Торговые кнопки
        document.getElementById('buy-btn').addEventListener('click', () => {
            this.executeTrade('buy');
        });

        document.getElementById('sell-btn').addEventListener('click', () => {
            this.executeTrade('sell');
        });

        document.getElementById('buy-max-btn').addEventListener('click', () => {
            this.buyMax();
        });

        // Учитель
        document.getElementById('teacher-hint').addEventListener('click', () => {
            this.teacher.giveHint();
        });

        document.getElementById('teacher-analysis').addEventListener('click', () => {
            this.teacher.giveAnalysis();
        });

        document.getElementById('teacher-lesson').addEventListener('click', () => {
            this.teacher.giveLesson();
        });

        document.getElementById('teacher-dictionary-btn').addEventListener('click', () => {
            this.teacher.toggleDictionary();
        });

        // Риски
        document.getElementById('calculate-risk').addEventListener('click', () => {
            this.riskManager.calculateRisk();
        });

        // Ордера
        document.getElementById('create-order-btn').addEventListener('click', () => {
            this.orderManager.createOrder();
        });

        // Данные
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

        // Словарь терминов
        document.querySelectorAll('.dictionary-term').forEach(term => {
            term.addEventListener('click', (e) => {
                const termName = e.currentTarget.dataset.term;
                this.teacher.explainTerm(termName);
            });
        });
    }

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Пропускаем комбинации с Ctrl/Alt
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            switch (e.key) {
                case 'b':
                case 'B':
                    e.preventDefault();
                    this.executeTrade('buy');
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    this.executeTrade('sell');
                    break;
                case '1':
                    this.showSection('chart');
                    break;
                case '2':
                    this.showSection('teacher');
                    break;
                case '3':
                    this.showSection('trading');
                    break;
                case '4':
                    this.showSection('orders');
                    break;
                case 'Escape':
                    this.hideAllSections();
                    break;
            }
        });
    }

    executeTrade(type) {
        const amount = parseFloat(document.getElementById('trade-amount').value);
        
        if (isNaN(amount) || amount <= 0) {
            this.teacher.showMessage('Введите корректную сумму для торговли', 'error');
            return;
        }

        if (type === 'buy') {
            if (amount > this.balance) {
                this.teacher.showMessage('Недостаточно средств на балансе', 'error');
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
                timestamp: Date.now()
            });

            this.teacher.showMessage(`Куплено ${assetAmount.toFixed(6)} ${this.currentAsset} за ${amount.toFixed(2)} USDT`);

        } else if (type === 'sell') {
            const assetAmount = amount / this.currentPrice;
            
            if (assetAmount > this.portfolio[this.currentAsset]) {
                this.teacher.showMessage('Недостаточно активов для продажи', 'error');
                return;
            }

            this.portfolio[this.currentAsset] -= assetAmount;
            this.balance += amount;

            this.tradeHistory.push({
                type: 'sell',
                asset: this.currentAsset,
                amount: assetAmount,
                price: this.currentPrice,
                total: amount,
                timestamp: Date.now()
            });

            this.teacher.showMessage(`Продано ${assetAmount.toFixed(6)} ${this.currentAsset} за ${amount.toFixed(2)} USDT`);
        }

        // Проверяем достижения
        if (!this.achievements.firstTrade) {
            this.achievements.firstTrade = true;
            this.achievementSystem.unlockAchievement('firstTrade');
        }

        this.updateUI();
        this.saveData();
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
        
        // Обновляем общую стоимость
        const totalValue = this.calculateTotalValue();
        document.getElementById('total-value').textContent = `${totalValue.toFixed(2)} USDT`;
        
        // Обновляем историю
        this.updateTradeHistory();
        
        // Обновляем статистику
        this.updateStats();
    }

    calculateTotalValue() {
        let total = this.balance;
        
        // Здесь должна быть логика расчета стоимости активов по текущим ценам
        // Для простоты используем последние известные цены
        total += this.portfolio.BTC * (this.currentAsset === 'BTC' ? this.currentPrice : 50000);
        total += this.portfolio.ETH * (this.currentAsset === 'ETH' ? this.currentPrice : 3000);
        total += this.portfolio.SOL * (this.currentAsset === 'SOL' ? this.currentPrice : 100);
        
        return total;
    }

    updateTradeHistory() {
        const container = document.getElementById('history-items');
        container.innerHTML = '';
        
        if (this.tradeHistory.length === 0) {
            container.innerHTML = '<div class="empty-history">Сделок пока нет</div>';
            return;
        }
        
        const recentTrades = this.tradeHistory.slice(-10).reverse();
        
        recentTrades.forEach(trade => {
            const profitClass = trade.type === 'buy' ? 'profit-negative' : 'profit-positive';
            const profitSign = trade.type === 'buy' ? '-' : '+';
            
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-info">
                    <div class="history-type">${trade.type === 'buy' ? 'Покупка' : 'Продажа'} ${trade.asset}</div>
                    <div class="history-price">${trade.price.toFixed(2)} USDT</div>
                    <div class="history-amount">${trade.amount.toFixed(6)} ${trade.asset}</div>
                </div>
                <div class="history-profit ${profitClass}">
                    ${profitSign}${trade.total.toFixed(2)} USDT
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateStats() {
        const totalTrades = this.tradeHistory.length;
        const winningTrades = this.tradeHistory.filter(trade => trade.type === 'sell').length;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;
        
        document.getElementById('total-trades').querySelector('.stat-value').textContent = totalTrades;
        document.getElementById('win-rate').querySelector('.stat-value').textContent = `${winRate.toFixed(1)}%`;
    }

    async saveData() {
        const data = {
            balance: this.balance,
            portfolio: this.portfolio,
            tradeHistory: this.tradeHistory,
            achievements: this.achievements,
            activeOrders: this.activeOrders
        };
        
        localStorage.setItem('tradeLearnData', JSON.stringify(data));
    }

    async loadSavedData() {
        const saved = localStorage.getItem('tradeLearnData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.balance = data.balance || 100.00;
                this.portfolio = data.portfolio || { BTC: 0, ETH: 0, SOL: 0 };
                this.tradeHistory = data.tradeHistory || [];
                this.achievements = data.achievements || { firstTrade: false, profit10: false };
                this.activeOrders = data.activeOrders || [];
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
            }
        }
    }

    exportData() {
        const data = {
            balance: this.balance,
            portfolio: this.portfolio,
            tradeHistory: this.tradeHistory,
            achievements: this.achievements,
            activeOrders: this.activeOrders,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tradelearn_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
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
                this.activeOrders = data.activeOrders || this.activeOrders;
                
                this.updateUI();
                this.orderManager.updateOrdersUI();
                this.achievementSystem.displayAchievements();
                this.saveData();
                
                this.teacher.showMessage('Данные успешно импортированы');
            } catch (error) {
                this.teacher.showMessage('Ошибка импорта данных. Неверный формат файла.', 'error');
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
            this.activeOrders = [];
            
            this.updateUI();
            this.orderManager.updateOrdersUI();
            this.achievementSystem.displayAchievements();
            this.saveData();
            
            this.teacher.showMessage('Данные успешно сброшены');
        }
    }
}

class TradingTeacher {
    constructor(app) {
        this.app = app;
        this.messages = {
            welcome: "Добро пожаловать! Я помогу вам освоить основы трейдинга.",
            hints: [
                "Сначала изучите график и индикаторы перед торговлей.",
                "Используйте стоп-лосс для ограничения рисков.",
                "Начинайте с малых сумм для обучения.",
                "Анализируйте тренды перед открытием позиций."
            ],
            lessons: [
                "Тренд - ваш друг. Всегда торгуйте в направлении тренда.",
                "Риск-менеджмент - ключ к успеху. Рискуйте не более 2% от депозита.",
                "Индикаторы помогают принимать решения, но не гарантируют успех.",
                "Эмоции - главный враг трейдера. Следуйте своему плану."
            ]
        };
    }

    showMessage(message, type = 'info') {
        const messageElement = document.getElementById('teacher-message');
        messageElement.textContent = message;
        messageElement.className = `teacher-message ${type}`;
    }

    giveHint() {
        const randomHint = this.messages.hints[Math.floor(Math.random() * this.messages.hints.length)];
        this.showMessage(`💡 Подсказка: ${randomHint}`, 'hint');
    }

    giveAnalysis() {
        const analysis = this.generateAnalysis();
        this.showMessage(`📊 Анализ: ${analysis}`, 'analysis');
    }

    generateAnalysis() {
        const trends = ['восходящий', 'нисходящий', 'боковой'];
        const signals = ['покупки', 'продажи', 'ожидания'];
        const randomTrend = trends[Math.floor(Math.random() * trends.length)];
        const randomSignal = signals[Math.floor(Math.random() * signals.length)];
        
        return `Текущий тренд ${randomTrend}. Индикаторы показывают сигнал ${randomSignal}.`;
    }

    giveLesson() {
        const randomLesson = this.messages.lessons[Math.floor(Math.random() * this.messages.lessons.length)];
        this.showMessage(`📚 Урок: ${randomLesson}`, 'lesson');
    }

    toggleDictionary() {
        const dictionary = document.getElementById('teacher-dictionary');
        dictionary.style.display = dictionary.style.display === 'none' ? 'block' : 'none';
    }

    explainTerm(term) {
        const explanations = {
            sma: "SMA (Simple Moving Average) - простая скользящая средняя. Показывает среднюю цену за определенный период.",
            ema: "EMA (Exponential Moving Average) - экспоненциальная скользящая средняя. Более чувствительна к последним ценам.",
            rsi: "RSI (Relative Strength Index) - индекс относительной силы. Показывает перекупленность или перепроданность актива.",
            stoploss: "Stop-Loss - ордер для ограничения убытков. Автоматически закрывает позицию при достижении определенной цены."
        };
        
        this.showMessage(`📖 ${explanations[term] || 'Термин не найден'}`, 'info');
    }

    addInteractiveTips() {
        this.addChartTip();
        this.addTradingTip();
    }

    addChartTip() {
        setTimeout(() => {
            this.showMessage("💡 Попробуйте переключать таймфреймы кнопками 1H, 4H, 1D для анализа разных периодов");
        }, 3000);
    }

    addTradingTip() {
        setTimeout(() => {
            this.showMessage("💡 Используйте горячие клавиши: B - купить, S - продать, 1-4 - переключение разделов");
        }, 8000);
    }
}

class OrderManager {
    constructor(app) {
        this.app = app;
    }

    createOrder() {
        const type = document.getElementById('order-type').value;
        const price = parseFloat(document.getElementById('order-price').value);
        const amount = parseFloat(document.getElementById('order-amount').value);
        
        if (isNaN(price) || isNaN(amount) || price <= 0 || amount <= 0) {
            this.app.teacher.showMessage('Введите корректные значения цены и объема', 'error');
            return;
        }

        const order = {
            id: Date.now(),
            type,
            asset: this.app.currentAsset,
            price,
            amount,
            status: 'active',
            createdAt: Date.now()
        };

        this.app.activeOrders.push(order);
        this.updateOrdersUI();
        this.app.saveData();
        
        this.app.teacher.showMessage(`Ордер создан: ${type === 'STOP' ? 'Стоп-лосс' : 'Тейк-профит'} на ${price} USDT`);
    }

    cancelOrder(orderId) {
        this.app.activeOrders = this.app.activeOrders.filter(order => order.id !== orderId);
        this.updateOrdersUI();
        this.app.saveData();
        
        this.app.teacher.showMessage('Ордер отменен');
    }

    updateOrdersUI() {
        const container = document.getElementById('orders-container');
        container.innerHTML = '';
        
        if (this.app.activeOrders.length === 0) {
            container.innerHTML = '<div class="empty-orders">Активных ордеров нет</div>';
            return;
        }
        
        const activeOrders = this.app.activeOrders.filter(order => 
            order.status === 'active' && order.asset === this.app.currentAsset
        );
        
        if (activeOrders.length === 0) {
            container.innerHTML = '<div class="empty-orders">Активных ордеров для этого актива нет</div>';
            return;
        }
        
        activeOrders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            orderElement.innerHTML = `
                <div class="order-info">
                    <div class="order-type">${order.type === 'STOP' ? 'Стоп-лосс' : 'Тейк-профит'}</div>
                    <div class="order-price">${order.price.toFixed(2)} USDT</div>
                    <div class="order-amount">${order.amount.toFixed(6)} ${order.asset}</div>
                </div>
                <button class="cancel-order-btn" onclick="app.orderManager.cancelOrder(${order.id})">
                    Отменить
                </button>
            `;
            container.appendChild(orderElement);
        });
    }

    checkOrders() {
        this.app.activeOrders.forEach(order => {
            if (order.status === 'active' && order.asset === this.app.currentAsset) {
                const shouldTrigger = order.type === 'STOP' ? 
                    this.app.currentPrice <= order.price : 
                    this.app.currentPrice >= order.price;
                
                if (shouldTrigger) {
                    this.executeOrder(order);
                }
            }
        });
    }

    executeOrder(order) {
        order.status = 'executed';
        
        // Здесь должна быть логика исполнения ордера
        this.app.teacher.showMessage(`Ордер исполнен: ${order.type} по цене ${order.price} USDT`);
        
        this.updateOrdersUI();
        this.app.saveData();
    }
}

class RiskManager {
    constructor(app) {
        this.app = app;
    }

    calculateRisk() {
        const deposit = parseFloat(document.getElementById('risk-deposit').value);
        const riskPercent = parseFloat(document.getElementById('risk-percent').value);
        const entryPrice = parseFloat(document.getElementById('risk-entry').value);
        const stopPrice = parseFloat(document.getElementById('risk-stop').value);
        
        if (isNaN(deposit) || isNaN(riskPercent) || isNaN(entryPrice) || isNaN(stopPrice)) {
            this.app.teacher.showMessage('Заполните все поля калькулятора риска', 'error');
            return;
        }

        if (entryPrice <= stopPrice) {
            this.app.teacher.showMessage('Цена входа должна быть выше стоп-лосса для лонга', 'error');
            return;
        }

        const riskAmount = deposit * (riskPercent / 100);
        const riskPerUnit = entryPrice - stopPrice;
        const volume = riskAmount / riskPerUnit;

        document.getElementById('risk-volume').textContent = volume.toFixed(6);
        document.getElementById('risk-amount').textContent = `${riskAmount.toFixed(2)} USDT`;
        
        this.app.teacher.showMessage(`Рекомендуемый объем: ${volume.toFixed(6)} ${this.app.currentAsset}`);
    }
}

class AchievementSystem {
    constructor(app) {
        this.app = app;
        this.achievements = {
            firstTrade: {
                title: "Первая сделка",
                description: "Совершите первую торговую операцию",
                icon: "🎯",
                unlocked: false
            },
            profit10: {
                title: "Профит +10%",
                description: "Достигните прибыли +10% от начального депозита",
                icon: "💰",
                unlocked: false
            }
        };
    }

    unlockAchievement(achievementId) {
        if (this.achievements[achievementId] && !this.achievements[achievementId].unlocked) {
            this.achievements[achievementId].unlocked = true;
            this.app.achievements[achievementId] = true;
            this.showAchievementNotification(achievementId);
            this.displayAchievements();
            this.app.saveData();
        }
    }

    showAchievementNotification(achievementId) {
        const achievement = this.achievements[achievementId];
        this.app.teacher.showMessage(`🏆 Достижение разблокировано: ${achievement.title}! ${achievement.description}`);
    }

    displayAchievements() {
        const container = document.getElementById('achievements-container');
        container.innerHTML = '';
        
        Object.entries(this.achievements).forEach(([id, achievement]) => {
            const card = document.createElement('div');
            card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
            `;
            container.appendChild(card);
        });
    }

    checkAchievements() {
        // Проверка достижения прибыли +10%
        const totalValue = this.app.calculateTotalValue();
        if (totalValue >= 110 && !this.achievements.profit10.unlocked) {
            this.unlockAchievement('profit10');
        }
    }
}

// Инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new TradingApp();
});

// Глобальные функции для обработчиков событий
window.app = app;
