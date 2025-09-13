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
            
            // Закрываем все секции при открытии боковой панели на мобильных
            if (window.innerWidth <= 1024 && sidebar.classList.contains('show')) {
                this.hideAllSections();
            }
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
            this.showTradeModal('buy');
        });

        document.getElementById('sell-btn').addEventListener('click', () => {
            this.showTradeModal('sell');
        });

        // Модальное окно
        document.getElementById('trade-modal').addEventListener('click', (e) => {
            if (e.target.id === 'trade-modal') {
                this.hideTradeModal();
            }
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideTradeModal();
        });

        document.getElementById('confirm-trade').addEventListener('click', () => {
            this.executeTrade();
        });

        // Слайдер количества
        const amountSlider = document.getElementById('trade-amount');
        const amountInput = document.getElementById('amount-input');
        
        amountSlider.addEventListener('input', () => {
            amountInput.value = amountSlider.value;
            this.updateTradePreview();
        });

        amountInput.addEventListener('input', () => {
            const maxAmount = this.calculateMaxAmount();
            let value = Math.min(parseFloat(amountInput.value) || 0, maxAmount);
            amountSlider.value = value;
            amountInput.value = value;
            this.updateTradePreview();
        });

        // Процентные кнопки
        document.querySelectorAll('.percentage-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const percentage = parseFloat(e.target.dataset.percent);
                const maxAmount = this.calculateMaxAmount();
                const amount = maxAmount * (percentage / 100);
                
                amountSlider.value = amount;
                amountInput.value = amount.toFixed(4);
                this.updateTradePreview();
            });
        });

        // Ордеры
        document.getElementById('limit-price').addEventListener('input', () => {
            this.updateTradePreview();
        });

        // Обновление графика при ресайзе
        window.addEventListener('resize', () => {
            if (this.chart) {
                const chartContainer = document.getElementById('candleChart');
                this.chart.applyOptions({
                    width: chartContainer.clientWidth,
                    height: chartContainer.clientHeight
                });
            }
        });
    }

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'b':
                        e.preventDefault();
                        this.showTradeModal('buy');
                        break;
                    case 's':
                        e.preventDefault();
                        this.showTradeModal('sell');
                        break;
                    case '1':
                        e.preventDefault();
                        this.switchTimeframe('1h');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTimeframe('4h');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTimeframe('1d');
                        break;
                }
            }
        });
    }

    switchTimeframe(timeframe) {
        this.currentTimeframe = timeframe;
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tf === timeframe) {
                btn.classList.add('active');
            }
        });
        this.updateChartData();
    }

    showTradeModal(type) {
        const modal = document.getElementById('trade-modal');
        const title = document.getElementById('modal-title');
        
        this.tradeType = type;
        title.textContent = type === 'buy' ? 'Купить' : 'Продать';
        title.className = type === 'buy' ? 'buy' : 'sell';
        
        this.updateTradeModal();
        modal.style.display = 'flex';
    }

    hideTradeModal() {
        document.getElementById('trade-modal').style.display = 'none';
    }

    updateTradeModal() {
        const maxAmount = this.calculateMaxAmount();
        const amountSlider = document.getElementById('trade-amount');
        const amountInput = document.getElementById('amount-input');
        
        amountSlider.max = maxAmount;
        amountSlider.value = 0;
        amountInput.value = '0';
        
        document.getElementById('current-price-display').textContent = this.currentPrice.toFixed(2);
        document.getElementById('limit-price').value = this.currentPrice.toFixed(2);
        
        this.updateTradePreview();
    }

    calculateMaxAmount() {
        if (this.tradeType === 'buy') {
            return this.balance / this.currentPrice;
        } else {
            return this.portfolio[this.currentAsset];
        }
    }

    updateTradePreview() {
        const amount = parseFloat(document.getElementById('amount-input').value) || 0;
        const price = parseFloat(document.getElementById('limit-price').value) || this.currentPrice;
        const total = amount * price;
        const fee = total * 0.001; // 0.1% комиссия

        document.getElementById('trade-total').textContent = total.toFixed(2);
        document.getElementById('trade-fee').textContent = fee.toFixed(2);
        document.getElementById('trade-net').textContent = (this.tradeType === 'buy' ? total + fee : total - fee).toFixed(2);
    }

    executeTrade() {
        const amount = parseFloat(document.getElementById('amount-input').value) || 0;
        const price = parseFloat(document.getElementById('limit-price').value) || this.currentPrice;
        
        if (amount <= 0) {
            this.teacher.showMessage('Введите корректное количество', 'error');
            return;
        }

        if (this.tradeType === 'buy') {
            const totalCost = amount * price * 1.001; // Цена + комиссия
            if (totalCost > this.balance) {
                this.teacher.showMessage('Недостаточно средств', 'error');
                return;
            }
            
            this.balance -= totalCost;
            this.portfolio[this.currentAsset] += amount;
            
            this.tradeHistory.push({
                type: 'buy',
                asset: this.currentAsset,
                amount,
                price,
                total: totalCost,
                time: new Date()
            });
            
            this.teacher.showMessage(`Куплено ${amount} ${this.currentAsset} по ${price.toFixed(2)} USDT`, 'success');
            
        } else {
            if (amount > this.portfolio[this.currentAsset]) {
                this.teacher.showMessage('Недостаточно активов для продажи', 'error');
                return;
            }
            
            const totalRevenue = amount * price * 0.999; // Цена - комиссия
            this.balance += totalRevenue;
            this.portfolio[this.currentAsset] -= amount;
            
            this.tradeHistory.push({
                type: 'sell',
                asset: this.currentAsset,
                amount,
                price,
                total: totalRevenue,
                time: new Date()
            });
            
            this.teacher.showMessage(`Продано ${amount} ${this.currentAsset} по ${price.toFixed(2)} USDT`, 'success');
        }

        // Проверяем достижения
        this.achievementSystem.checkAchievements();
        
        this.updateUI();
        this.hideTradeModal();
        this.saveData();
    }

    updateUI() {
        // Баланс и портфель
        document.getElementById('balance').textContent = this.balance.toFixed(2);
        
        const portfolioGrid = document.getElementById('portfolio-grid');
        portfolioGrid.innerHTML = '';
        
        Object.entries(this.portfolio).forEach(([asset, amount]) => {
            if (amount > 0) {
                const value = amount * (asset === this.currentAsset ? this.currentPrice : this.getAssetPrice(asset));
                const element = document.createElement('div');
                element.className = 'portfolio-item';
                element.innerHTML = `
                    <span class="asset">${asset}</span>
                    <span class="amount">${amount.toFixed(4)}</span>
                    <span class="value">${value.toFixed(2)} USDT</span>
                `;
                portfolioGrid.appendChild(element);
            }
        });

        if (portfolioGrid.children.length === 0) {
            portfolioGrid.innerHTML = '<div class="empty-portfolio">Активы отсутствуют</div>';
        }

        // История сделок
        this.updateTradeHistory();
    }

    getAssetPrice(asset) {
        // Для упрощения используем текущую цену для всех активов
        // В реальном приложении здесь был бы запрос к API
        switch (asset) {
            case 'BTC': return 50000;
            case 'ETH': return 3000;
            case 'SOL': return 100;
            default: return 1;
        }
    }

    updateTradeHistory() {
        const historyList = document.getElementById('trade-history');
        historyList.innerHTML = '';
        
        const recentTrades = this.tradeHistory.slice(-10).reverse();
        
        recentTrades.forEach(trade => {
            const li = document.createElement('li');
            li.className = `trade-item ${trade.type}`;
            li.innerHTML = `
                <span class="trade-type">${trade.type === 'buy' ? 'Куплено' : 'Продано'}</span>
                <span class="trade-asset">${trade.amount} ${trade.asset}</span>
                <span class="trade-price">по ${trade.price.toFixed(2)}</span>
                <span class="trade-time">${trade.time.toLocaleTimeString()}</span>
            `;
            historyList.appendChild(li);
        });

        if (recentTrades.length === 0) {
            historyList.innerHTML = '<li class="empty-history">История сделок пуста</li>';
        }
    }

    async loadSavedData() {
        try {
            const saved = localStorage.getItem('tradingAppData');
            if (saved) {
                const data = JSON.parse(saved);
                this.balance = data.balance || this.balance;
                this.portfolio = data.portfolio || this.portfolio;
                this.tradeHistory = data.tradeHistory || this.tradeHistory;
                this.achievements = data.achievements || this.achievements;
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    saveData() {
        const data = {
            balance: this.balance,
            portfolio: this.portfolio,
            tradeHistory: this.tradeHistory,
            achievements: this.achievements
        };
        localStorage.setItem('tradingAppData', JSON.stringify(data));
    }
}

class AchievementSystem {
    constructor(app) {
        this.app = app;
        this.achievements = {
            firstTrade: {
                title: 'Первая сделка',
                description: 'Выполните вашу первую торговую операцию',
                unlocked: app.achievements.firstTrade,
                icon: '🥇'
            },
            profit10: {
                title: 'Профит +10%',
                description: 'Заработайте 10% прибыли от начального депозита',
                unlocked: app.achievements.profit10,
                icon: '💰'
            },
            portfolioDiversified: {
                title: 'Диверсификация',
                description: 'Владейте тремя разными активами одновременно',
                unlocked: false,
                icon: '🌐'
            },
            dayTrader: {
                title: 'Дневной трейдер',
                description: 'Выполните 10 сделок за один день',
                unlocked: false,
                icon: '📈'
            }
        };
    }

    checkAchievements() {
        // Первая сделка
        if (!this.achievements.firstTrade.unlocked && this.app.tradeHistory.length > 0) {
            this.unlockAchievement('firstTrade');
        }

        // Прибыль +10%
        if (!this.achievements.profit10.unlocked) {
            const initialBalance = 100.00;
            const currentBalance = this.app.balance + 
                Object.entries(this.app.portfolio).reduce((total, [asset, amount]) => {
                    return total + (amount * this.app.getAssetPrice(asset));
                }, 0);
            
            const profit = ((currentBalance - initialBalance) / initialBalance) * 100;
            if (profit >= 10) {
                this.unlockAchievement('profit10');
            }
        }

        // Диверсификация
        if (!this.achievements.portfolioDiversified.unlocked) {
            const ownedAssets = Object.entries(this.app.portfolio).filter(([_, amount]) => amount > 0);
            if (ownedAssets.length >= 3) {
                this.unlockAchievement('portfolioDiversified');
            }
        }

        // Дневной трейдер
        if (!this.achievements.dayTrader.unlocked) {
            const today = new Date().toDateString();
            const todayTrades = this.app.tradeHistory.filter(trade => 
                trade.time.toDateString() === today
            );
            if (todayTrades.length >= 10) {
                this.unlockAchievement('dayTrader');
            }
        }
    }

    unlockAchievement(achievementKey) {
        this.achievements[achievementKey].unlocked = true;
        this.app.achievements[achievementKey] = true;
        
        const achievement = this.achievements[achievementKey];
        this.showAchievementPopup(achievement);
        this.displayAchievements();
        this.app.saveData();
    }

    showAchievementPopup(achievement) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <h4>Достижение разблокировано!</h4>
                <h3>${achievement.title}</h3>
                <p>${achievement.description}</p>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 300);
        }, 3000);
    }

    displayAchievements() {
        const container = document.getElementById('achievements-grid');
        container.innerHTML = '';
        
        Object.values(this.achievements).forEach(achievement => {
            const element = document.createElement('div');
            element.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            element.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
                <div class="achievement-status">
                    ${achievement.unlocked ? '✅' : '🔒'}
                </div>
            `;
            container.appendChild(element);
        });
    }
}

class TradingTeacher {
    constructor(app) {
        this.app = app;
        this.tips = [
            {
                condition: () => app.tradeHistory.length === 0,
                message: 'Начните с небольшой покупки, чтобы освоиться с интерфейсом!',
                level: 'beginner'
            },
            {
                condition: () => app.priceChange < -2,
                message: 'Цена упала более чем на 2%. Возможно, хорошая возможность для покупки?',
                level: 'intermediate'
            },
            {
                condition: () => app.priceChange > 5,
                message: 'Сильный рост! Рассмотрите возможность фиксации части прибыли.',
                level: 'intermediate'
            },
            {
                condition: () => {
                    const btcValue = app.portfolio.BTC * app.getAssetPrice('BTC');
                    const totalValue = app.balance + btcValue + 
                        app.portfolio.ETH * app.getAssetPrice('ETH') + 
                        app.portfolio.SOL * app.getAssetPrice('SOL');
                    return btcValue / totalValue > 0.7;
                },
                message: 'Ваш портфель сильно сконцентрирован на BTC. Рассмотрите диверсификацию.',
                level: 'advanced'
            }
        ];
    }

    addInteractiveTips() {
        this.showRandomTip();
        
        // Добавляем подсказки при наведении на элементы
        this.addHoverTips();
    }

    showRandomTip() {
        const availableTips = this.tips.filter(tip => tip.condition());
        if (availableTips.length > 0) {
            const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
            this.showMessage(randomTip.message, 'info');
        }
    }

    showMessage(message, type = 'info') {
        const messageBox = document.createElement('div');
        messageBox.className = `teacher-message ${type}`;
        messageBox.innerHTML = `
            <span class="message-icon">💡</span>
            <span class="message-text">${message}</span>
            <button class="message-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.getElementById('teacher-messages').appendChild(messageBox);
        
        setTimeout(() => {
            if (messageBox.parentElement) {
                messageBox.remove();
            }
        }, 5000);
    }

    addHoverTips() {
        // Подсказки для элементов интерфейса
        const elements = [
            {
                selector: '#buy-btn',
                message: 'Купить актив по текущей рыночной цене',
                position: 'top'
            },
            {
                selector: '#sell-btn',
                message: 'Продать актив по текущей рыночной цене',
                position: 'top'
            },
            {
                selector: '.timeframe-btn[data-tf="1h"]',
                message: 'Часовой таймфрейм - хорош для краткосрочной торговли',
                position: 'top'
            },
            {
                selector: '.portfolio-item',
                message: 'Нажмите для просмотра детальной информации об активе',
                position: 'right'
            }
        ];

        elements.forEach(({ selector, message, position }) => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('mouseenter', (e) => {
                    this.showTooltip(e.target, message, position);
                });
                element.addEventListener('mouseleave', () => {
                    this.hideTooltip();
                });
            }
        });
    }

    showTooltip(element, message, position) {
        let tooltip = document.getElementById('teacher-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'teacher-tooltip';
            tooltip.className = 'teacher-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.textContent = message;
        tooltip.style.display = 'block';

        const rect = element.getBoundingClientRect();
        switch (position) {
            case 'top':
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
                tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
                break;
            case 'right':
                tooltip.style.top = (rect.top + rect.height / 2 - tooltip.offsetHeight / 2) + 'px';
                tooltip.style.left = (rect.right + 10) + 'px';
                break;
        }
    }

    hideTooltip() {
        const tooltip = document.getElementById('teacher-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
}

class OrderManager {
    constructor(app) {
        this.app = app;
        this.orders = [];
    }

    placeOrder(type, asset, amount, price, orderType = 'limit') {
        const order = {
            id: Date.now(),
            type,
            asset,
            amount,
            price,
            orderType,
            status: 'open',
            createdAt: new Date()
        };

        this.orders.push(order);
        this.updateOrdersUI();
        return order;
    }

    cancelOrder(orderId) {
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = 'cancelled';
            this.updateOrdersUI();
            return true;
        }
        return false;
    }

    updateOrdersUI() {
        const ordersGrid = document.getElementById('orders-grid');
        ordersGrid.innerHTML = '';

        const openOrders = this.orders.filter(order => order.status === 'open');

        if (openOrders.length === 0) {
            ordersGrid.innerHTML = '<div class="empty-orders">Активные ордера отсутствуют</div>';
            return;
        }

        openOrders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = `order-item ${order.type}`;
            orderElement.innerHTML = `
                <div class="order-header">
                    <span class="order-type">${order.type === 'buy' ? 'Покупка' : 'Продажа'}</span>
                    <span class="order-asset">${order.asset}</span>
                    <button class="cancel-order" onclick="app.orderManager.cancelOrder(${order.id})">×</button>
                </div>
                <div class="order-details">
                    <span>Количество: ${order.amount.toFixed(4)}</span>
                    <span>Цена: ${order.price.toFixed(2)} USDT</span>
                    <span>Всего: ${(order.amount * order.price).toFixed(2)} USDT</span>
                </div>
                <div class="order-footer">
                    <span>${order.createdAt.toLocaleTimeString()}</span>
                </div>
            `;
            ordersGrid.appendChild(orderElement);
        });
    }
}

class RiskManager {
    constructor(app) {
        this.app = app;
        this.settings = {
            maxPositionSize: 0.5, // Макс. размер позиции (50% от баланса)
            stopLoss: 0.1,        // Стоп-лосс 10%
            takeProfit: 0.2       // Тейк-профит 20%
        };
    }

    calculatePositionSize(price) {
        const maxAmount = (this.app.balance * this.settings.maxPositionSize) / price;
        return maxAmount;
    }

    validateTrade(type, amount, price) {
        const errors = [];

        if (type === 'buy') {
            const totalCost = amount * price * 1.001;
            if (totalCost > this.app.balance) {
                errors.push('Недостаточно средств');
            }

            if (amount * price > this.app.balance * this.settings.maxPositionSize) {
                errors.push(`Размер позиции превышает максимальный лимит (${this.settings.maxPositionSize * 100}% от баланса)`);
            }
        } else {
            if (amount > this.app.portfolio[this.app.currentAsset]) {
                errors.push('Недостаточно активов для продажи');
            }
        }

        if (amount <= 0) {
            errors.push('Некорректное количество');
        }

        return errors;
    }

    calculateRiskReward(entryPrice, stopLoss, takeProfit) {
        const risk = Math.abs(entryPrice - stopLoss);
        const reward = Math.abs(takeProfit - entryPrice);
        return reward / risk;
    }
}

// Инициализация приложения
const app = new TradingApp();

// Глобальные функции для использования в HTML
window.showSection = function(section) {
    app.showSection(section);
};

window.hideAllSections = function() {
    app.hideAllSections();
};
