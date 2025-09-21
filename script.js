// Основные переменные
let chart;
let candleSeries;
let smaSeries;
let emaSeries;
let rsiSeries;
let currentData = [];
let balance = 100.00;
let portfolio = {
    'BTC': 0,
    'ETH': 0, 
    'SOL': 0
};
let tradeHistory = [];
let activeOrders = [];
let currentAsset = 'BTC';
let currentTimeframe = '1h';
let indicators = {
    sma: true,
    ema: false,
    rsi: false
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadChartData();
    updateUI();
});

// Инициализация приложения
function initializeApp() {
    // Загрузка данных из localStorage
    loadFromLocalStorage();
    
    // Инициализация графика
    initializeChart();
    
    // Настройка индикаторов из localStorage
    const savedIndicators = localStorage.getItem('tradelearn_indicators');
    if (savedIndicators) {
        indicators = {...indicators, ...JSON.parse(savedIndicators)};
        updateIndicatorCheckboxes();
    }
    
    // Обновление UI
    updateUI();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            showSection(section);
        });
    });
    
    // Закрытие секций
    document.querySelectorAll('.close-section').forEach(btn => {
        btn.addEventListener('click', () => {
            hideAllSections();
        });
    });
    
    // Переключение сайдбара
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    
    // Выбор актива
    document.getElementById('asset-select').addEventListener('change', (e) => {
        currentAsset = e.target.value;
        loadChartData();
    });
    
    // Таймфреймы
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentTimeframe = e.currentTarget.dataset.tf;
            loadChartData();
        });
    });
    
    // Индикаторы
    document.getElementById('sma-toggle').addEventListener('change', (e) => {
        indicators.sma = e.target.checked;
        updateIndicators();
        saveIndicatorsToLocalStorage();
    });
    
    document.getElementById('ema-toggle').addEventListener('change', (e) => {
        indicators.ema = e.target.checked;
        updateIndicators();
        saveIndicatorsToLocalStorage();
    });
    
    document.getElementById('rsi-toggle').addEventListener('change', (e) => {
        indicators.rsi = e.target.checked;
        updateIndicators();
        saveIndicatorsToLocalStorage();
    });
    
    // Торговля
    document.getElementById('buy-btn').addEventListener('click', () => executeTrade('buy'));
    document.getElementById('sell-btn').addEventListener('click', () => executeTrade('sell'));
    document.getElementById('buy-max-btn').addEventListener('click', buyMax);
    
    // Риск менеджмент
    document.getElementById('calculate-risk').addEventListener('click', calculateRisk);
    
    // Учитель
    document.getElementById('teacher-hint').addEventListener('click', showTeacherHint);
    document.getElementById('teacher-analysis').addEventListener('click', showTeacherAnalysis);
    document.getElementById('teacher-lesson').addEventListener('click', showTeacherLesson);
    document.getElementById('teacher-dictionary-btn').addEventListener('click', toggleDictionary);
    
    // Данные
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('reset-btn').addEventListener('click', resetData);
    
    // Ордера
    document.getElementById('create-order-btn').addEventListener('click', createOrder);
}

// Инициализация графика
function initializeChart() {
    const chartContainer = document.getElementById('candleChart');
    
    // Создаем график
    chart = LightweightCharts.createChart(chartContainer, {
        layout: {
            background: { color: '#121212' },
            textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
            vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
            horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: false,
            borderColor: 'rgba(197, 203, 206, 0.4)',
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
    });
    
    // Создаем свечную серию
    candleSeries = chart.addCandlestickSeries({
        upColor: '#00c853',
        downColor: '#ff5252',
        borderDownColor: '#ff5252',
        borderUpColor: '#00c853',
        wickDownColor: '#ff5252',
        wickUpColor: '#00c853',
    });
    
    // Создаем SMA
    smaSeries = chart.addLineSeries({
        color: '#2962ff',
        lineWidth: 2,
        priceScaleId: 'left',
        title: 'SMA 20',
    });
    
    // Создаем EMA
    emaSeries = chart.addLineSeries({
        color: '#ff6d00',
        lineWidth: 2,
        priceScaleId: 'left',
        title: 'EMA 12',
    });
    
    // Создаем RSI (на отдельной шкале)
    rsiSeries = chart.addLineSeries({
        color: '#9c27b0',
        lineWidth: 2,
        priceScaleId: 'rsi',
        title: 'RSI 14',
    });
    
    // Добавляем шкалу для RSI
    chart.priceScale('rsi').applyOptions({
        scaleMargins: {
            top: 0.8,
            bottom: 0.1,
        },
        mode: LightweightCharts.PriceScaleMode.Percentage,
    });
    
    // Настройка подсказки
    chart.subscribeCrosshairMove(param => {
        if (!param.point) return;
        
        const data = param.seriesData.get(candleSeries);
        if (data) {
            showTooltip(param.point.x, param.point.y, data);
        } else {
            hideTooltip();
        }
    });
    
    // Обработка ресайза
    new ResizeObserver(entries => {
        if (entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({ width, height });
    }).observe(chartContainer);
}

// Загрузка данных графика
async function loadChartData() {
    showLoading();
    
    try {
        // Симуляция загрузки данных
        const data = await simulateChartData();
        currentData = data;
        
        // Обновляем график
        candleSeries.setData(data);
        
        // Обновляем текущую цену
        updateCurrentPrice(data[data.length - 1]);
        
        // Рассчитываем индикаторы
        calculateIndicators(data);
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showError('Не удалось загрузить данные графика');
    } finally {
        hideLoading();
    }
}

// Симуляция данных графика
async function simulateChartData() {
    return new Promise(resolve => {
        setTimeout(() => {
            const now = Date.now();
            const data = [];
            let price = 50000 + Math.random() * 10000;
            
            for (let i = 100; i > 0; i--) {
                const time = now - i * 3600000;
                const open = price;
                const change = (Math.random() - 0.5) * 200;
                price = price + change;
                const high = Math.max(open, price) + Math.random() * 100;
                const low = Math.min(open, price) - Math.random() * 100;
                const close = price;
                
                data.push({
                    time: Math.floor(time / 1000),
                    open: open,
                    high: high,
                    low: low,
                    close: close
                });
            }
            resolve(data);
        }, 1000);
    });
}

// Рассчитать индикаторы
function calculateIndicators(data) {
    // SMA 20
    const smaData = calculateSMA(data, 20);
    
    // EMA 12
    const emaData = calculateEMA(data, 12);
    
    // RSI 14
    const rsiData = calculateRSI(data, 14);
    
    // Обновляем графики индикаторов
    smaSeries.setData(smaData);
    emaSeries.setData(emaData);
    rsiSeries.setData(rsiData);
    
    // Обновляем видимость индикаторов
    updateIndicators();
}

// Расчет SMA
function calculateSMA(data, period) {
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

// Расчет EMA
function calculateEMA(data, period) {
    const result = [];
    const k = 2 / (period + 1);
    let ema = data[0].close;
    
    result.push({
        time: data[0].time,
        value: ema
    });
    
    for (let i = 1; i < data.length; i++) {
        ema = (data[i].close - ema) * k + ema;
        result.push({
            time: data[i].time,
            value: ema
        });
    }
    return result;
}

// Расчет RSI
function calculateRSI(data, period) {
    const result = [];
    let gains = 0;
    let losses = 0;
    
    // Первые period-1 значений пропускаем
    for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i - 1].close;
        if (change >= 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    for (let i = period + 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        let currentGain = 0;
        let currentLoss = 0;
        
        if (change >= 0) {
            currentGain = change;
        } else {
            currentLoss = Math.abs(change);
        }
        
        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
        
        const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
        const rsi = 100 - (100 / (1 + rs));
        
        result.push({
            time: data[i].time,
            value: rsi
        });
    }
    
    return result;
}

// Обновить видимость индикаторов
function updateIndicators() {
    smaSeries.applyOptions({
        visible: indicators.sma
    });
    
    emaSeries.applyOptions({
        visible: indicators.ema
    });
    
    rsiSeries.applyOptions({
        visible: indicators.rsi
    });
}

// Обновить чекбоксы индикаторов
function updateIndicatorCheckboxes() {
    document.getElementById('sma-toggle').checked = indicators.sma;
    document.getElementById('ema-toggle').checked = indicators.ema;
    document.getElementById('rsi-toggle').checked = indicators.rsi;
}

// Сохранить настройки индикаторов
function saveIndicatorsToLocalStorage() {
    localStorage.setItem('tradelearn_indicators', JSON.stringify(indicators));
}

// Показать секцию
function showSection(sectionId) {
    hideAllSections();
    const section = document.getElementById(`${sectionId}-section`);
    if (section) {
        section.style.display = 'block';
    }
}

// Скрыть все секции
function hideAllSections() {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
}

// Переключение сайдбара
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

// Показать загрузку
function showLoading() {
    document.getElementById('chartLoadingOverlay').style.display = 'flex';
}

// Скрыть загрузку
function hideLoading() {
    document.getElementById('chartLoadingOverlay').style.display = 'none';
}

// Показать ошибку
function showError(message) {
    // Реализация показа ошибок
    console.error(message);
}

// Обновить текущую цену
function updateCurrentPrice(bar) {
    const priceElement = document.getElementById('current-price');
    const changeElement = document.getElementById('price-change');
    
    const prevPrice = currentData.length > 1 ? currentData[currentData.length - 2].close : bar.open;
    const change = ((bar.close - prevPrice) / prevPrice) * 100;
    
    priceElement.textContent = bar.close.toFixed(2);
    changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
}

// Показать подсказку
function showTooltip(x, y, data) {
    const tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) return;
    
    const change = ((data.close - data.open) / data.open) * 100;
    const changeClass = change >= 0 ? 'profit' : 'loss';
    
    tooltip.innerHTML = `
        <div class="tooltip-header">${new Date(data.time * 1000).toLocaleString()}</div>
        <div class="tooltip-content">
            <span class="tooltip-label">Open:</span>
            <span class="tooltip-value">${data.open.toFixed(2)}</span>
            
            <span class="tooltip-label">High:</span>
            <span class="tooltip-value">${data.high.toFixed(2)}</span>
            
            <span class="tooltip-label">Low:</span>
            <span class="tooltip-value">${data.low.toFixed(2)}</span>
            
            <span class="tooltip-label">Close:</span>
            <span class="tooltip-value">${data.close.toFixed(2)}</span>
            
            <span class="tooltip-label">Change:</span>
            <span class="tooltip-value ${changeClass}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span>
        </div>
    `;
    
    const chartContainer = document.querySelector('.chart-container');
    const rect = chartContainer.getBoundingClientRect();
    
    tooltip.style.left = (x + rect.left) + 'px';
    tooltip.style.top = (y + rect.top - 100) + 'px';
    tooltip.style.display = 'block';
}

// Скрыть подсказку
function hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Выполнить сделку
function executeTrade(type) {
    const amount = parseFloat(document.getElementById('trade-amount').value);
    const currentPrice = currentData[currentData.length - 1].close;
    
    if (isNaN(amount) || amount <= 0) {
        showError('Введите корректную сумму');
        return;
    }
    
    if (type === 'buy') {
        if (amount > balance) {
            showError('Недостаточно средств');
            return;
        }
        
        const assetAmount = amount / currentPrice;
        portfolio[currentAsset] = (portfolio[currentAsset] || 0) + assetAmount;
        balance -= amount;
        
        tradeHistory.push({
            type: 'buy',
            asset: currentAsset,
            amount: assetAmount,
            price: currentPrice,
            total: amount,
            timestamp: Date.now()
        });
        
    } else if (type === 'sell') {
        const assetAmount = amount / currentPrice;
        
        if (assetAmount > (portfolio[currentAsset] || 0)) {
            showError('Недостаточно актива');
            return;
        }
        
        portfolio[currentAsset] = (portfolio[currentAsset] || 0) - assetAmount;
        balance += amount;
        
        tradeHistory.push({
            type: 'sell',
            asset: currentAsset,
            amount: assetAmount,
            price: currentPrice,
            total: amount,
            timestamp: Date.now()
        });
    }
    
    updateUI();
    saveToLocalStorage();
    showTeacherHint();
}

// Купить на все средства
function buyMax() {
    const currentPrice = currentData[currentData.length - 1].close;
    const maxAmount = balance;
    document.getElementById('trade-amount').value = maxAmount.toFixed(2);
    executeTrade('buy');
}

// Рассчитать риск
function calculateRisk() {
    const deposit = parseFloat(document.getElementById('risk-deposit').value);
    const riskPercent = parseFloat(document.getElementById('risk-percent').value);
    const entryPrice = parseFloat(document.getElementById('risk-entry').value);
    const stopPrice = parseFloat(document.getElementById('risk-stop').value);
    
    if (isNaN(deposit) || isNaN(riskPercent) || isNaN(entryPrice) || isNaN(stopPrice)) {
        showError('Заполните все поля');
        return;
    }
    
    const riskAmount = deposit * (riskPercent / 100);
    const priceDifference = Math.abs(entryPrice - stopPrice);
    const volume = riskAmount / priceDifference;
    
    document.getElementById('risk-volume').textContent = volume.toFixed(6);
    document.getElementById('risk-amount').textContent = riskAmount.toFixed(2) + ' USDT';
}

// Показать подсказку учителя
function showTeacherHint() {
    const messages = [
        "Помните о стоп-лоссах! Рискуйте не более 2% от депозита.",
        "Анализируйте график перед совершением сделки.",
        "Не поддавайтесь эмоциям - торгуйте по плану.",
        "Диверсифицируйте портфель для снижения рисков.",
        "Изучайте основы технического анализа."
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('teacher-message').textContent = randomMessage;
}

// Показать анализ учителя
function showTeacherAnalysis() {
    const currentPrice = currentData[currentData.length - 1].close;
    const analysis = `Текущая цена ${currentAsset}: ${currentPrice.toFixed(2)}. `;
    
    document.getElementById('teacher-message').textContent = analysis + "Рекомендую изучить график и индикаторы.";
}

// Показать урок учителя
function showTeacherLesson() {
    const lessons = [
        "Урок: Основы свечного анализа - научитесь читать японские свечи.",
        "Урок: Индикаторы RSI и MACD - как использовать в торговле.",
        "Урок: Управление рисками - ключ к успешному трейдингу.",
        "Урок: Психология трейдинга - контролируйте эмоции.",
        "Урок: Построение торговой стратегии - с нуля до профи."
    ];
    
    const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
    document.getElementById('teacher-message').textContent = randomLesson;
}

// Переключить словарь
function toggleDictionary() {
    const dictionary = document.getElementById('teacher-dictionary');
    dictionary.style.display = dictionary.style.display === 'none' ? 'block' : 'none';
}

// Создать ордер
function createOrder() {
    const orderType = document.getElementById('order-type').value;
    const orderPrice = parseFloat(document.getElementById('order-price').value);
    const orderAmount = parseFloat(document.getElementById('order-amount').value);
    
    if (isNaN(orderPrice) || isNaN(orderAmount) || orderPrice <= 0 || orderAmount <= 0) {
        showError('Заполните все поля корректно');
        return;
    }
    
    activeOrders.push({
        type: orderType,
        price: orderPrice,
        amount: orderAmount,
        asset: currentAsset,
        timestamp: Date.now()
    });
    
    updateOrdersList();
    saveToLocalStorage();
    
    // Очищаем поля
    document.getElementById('order-price').value = '';
    document.getElementById('order-amount').value = '';
}

// Обновить список ордеров
function updateOrdersList() {
    const container = document.getElementById('orders-container');
    
    if (activeOrders.length === 0) {
        container.innerHTML = '<div class="empty-orders">Активных ордеров нет</div>';
        return;
    }
    
    container.innerHTML = activeOrders.map((order, index) => `
        <div class="order-item ${order.type.toLowerCase().replace('_', '-')}">
            <div class="order-info">
                <div class="order-type">${order.type === 'STOP' ? 'Стоп-лосс' : 'Тейк-профит'}</div>
                <div class="order-details">
                    ${order.asset} | Цена: ${order.price.toFixed(2)} | Объем: ${order.amount.toFixed(6)}
                </div>
            </div>
            <div class="order-actions">
                <button class="order-cancel-btn" onclick="cancelOrder(${index})">Отмена</button>
            </div>
        </div>
    `).join('');
}

// Отменить ордер
function cancelOrder(index) {
    activeOrders.splice(index, 1);
    updateOrdersList();
    saveToLocalStorage();
}

// Экспорт данных
function exportData() {
    const data = {
        balance,
        portfolio,
        tradeHistory,
        activeOrders,
        indicators
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tradelearn-data.json';
    a.click();
    
    URL.revokeObjectURL(url);
}

// Импорт данных
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            balance = data.balance || balance;
            portfolio = data.portfolio || portfolio;
            tradeHistory = data.tradeHistory || tradeHistory;
            activeOrders = data.activeOrders || activeOrders;
            indicators = data.indicators || indicators;
            
            updateUI();
            updateIndicatorCheckboxes();
            updateIndicators();
            saveToLocalStorage();
            saveIndicatorsToLocalStorage();
            showError('Данные успешно импортированы');
            
        } catch (error) {
            showError('Ошибка при импорте данных');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// Сброс данных
function resetData() {
    if (confirm('Вы уверены? Все данные будут удалены.')) {
        balance = 100.00;
        portfolio = { 'BTC': 0, 'ETH': 0, 'SOL': 0 };
        tradeHistory = [];
        activeOrders = [];
        indicators = { sma: true, ema: false, rsi: false };
        
        updateUI();
        updateIndicatorCheckboxes();
        updateIndicators();
        saveToLocalStorage();
        saveIndicatorsToLocalStorage();
        showError('Данные сброшены');
    }
}

// Обновление интерфейса
function updateUI() {
    // Баланс
    document.getElementById('balance').textContent = balance.toFixed(2) + ' USDT';
    
    // Портфель
    document.getElementById('btc-amount').textContent = portfolio.BTC.toFixed(6);
    document.getElementById('eth-amount').textContent = portfolio.ETH.toFixed(6);
    document.getElementById('sol-amount').textContent = portfolio.SOL.toFixed(6);
    
    // Общая стоимость
    const currentPrice = currentData.length > 0 ? currentData[currentData.length - 1].close : 0;
    const totalValue = balance + (portfolio.BTC * currentPrice) + (portfolio.ETH * currentPrice * 0.05) + (portfolio.SOL * currentPrice * 0.001);
    document.getElementById('total-value').textContent = totalValue.toFixed(2) + ' USDT';
    
    // История
    updateHistoryList();
    
    // Ордера
    updateOrdersList();
    
    // Статистика
    updateStatistics();
}

// Обновить историю сделок
function updateHistoryList() {
    const container = document.getElementById('history-items');
    
    if (tradeHistory.length === 0) {
        container.innerHTML = '<div class="empty-history">Сделок пока нет</div>';
        return;
    }
    
    container.innerHTML = tradeHistory.slice().reverse().map(trade => `
        <div class="history-item ${trade.type === 'buy' ? '' : 'loss'}">
            <div class="history-info">
                <div class="history-type">${trade.type === 'buy' ? 'Покупка' : 'Продажа'} ${trade.asset}</div>
                <div class="history-details">
                    ${new Date(trade.timestamp).toLocaleString()} | 
                    Цена: ${trade.price.toFixed(2)} | 
                    Объем: ${trade.amount.toFixed(6)}
                </div>
            </div>
            <div class="history-amount ${trade.type === 'buy' ? 'loss' : 'profit'}">
                ${trade.type === 'buy' ? '-' : '+'}${trade.total.toFixed(2)} USDT
            </div>
        </div>
    `).join('');
}

// Обновить статистику
function updateStatistics() {
    const totalTrades = tradeHistory.length;
    const winningTrades = tradeHistory.filter(trade => trade.type === 'sell').length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;
    
    document.getElementById('total-trades').querySelector('.stat-value').textContent = totalTrades;
    document.getElementById('win-rate').querySelector('.stat-value').textContent = winRate.toFixed(1) + '%';
}

// Сохранить в localStorage
function saveToLocalStorage() {
    const data = {
        balance,
        portfolio,
        tradeHistory,
        activeOrders
    };
    
    localStorage.setItem('tradelearn_data', JSON.stringify(data));
}

// Загрузить из localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('tradelearn_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            balance = data.balance || balance;
            portfolio = data.portfolio || portfolio;
            tradeHistory = data.tradeHistory || tradeHistory;
            activeOrders = data.activeOrders || activeOrders;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }
}

// Глобальные функции для обработки событий
window.cancelOrder = cancelOrder;
