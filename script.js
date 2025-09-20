// Основные переменные
let chart;
let candleSeries;
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

// Переменные для рисования
let drawingTool = null;
let drawingColor = '#2962ff';
let drawingSeries = [];
let isDrawing = false;
let drawingStartPoint = null;

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
    
    // Инструменты рисования
    setupDrawingTools();
}

// Настройка инструментов рисования
function setupDrawingTools() {
    // Кнопки инструментов
    document.querySelectorAll('.drawing-tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tool = e.currentTarget.dataset.tool;
            
            if (tool === drawingTool) {
                // Если инструмент уже активен, деактивируем его
                drawingTool = null;
                e.currentTarget.classList.remove('active');
            } else {
                // Активируем новый инструмент
                document.querySelectorAll('.drawing-tool-btn').forEach(b => b.classList.remove('active'));
                drawingTool = tool;
                e.currentTarget.classList.add('active');
            }
        });
    });
    
    // Выбор цвета
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (e) => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            e.currentTarget.classList.add('active');
            drawingColor = e.currentTarget.dataset.color;
        });
    });
    
    // Кнопка очистки
    document.getElementById('clear-drawings').addEventListener('click', clearAllDrawings);
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
    
    // Добавляем SMA
    const smaSeries = chart.addLineSeries({
        color: '#2962ff',
        lineWidth: 2,
        priceScaleId: 'left',
    });
    
    // Добавляем EMA
    const emaSeries = chart.addLineSeries({
        color: '#ff6d00',
        lineWidth: 2,
        priceScaleId: 'left',
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
    
    // Обработка кликов для рисования
    chartContainer.addEventListener('mousedown', handleDrawingStart);
    chartContainer.addEventListener('mousemove', handleDrawingMove);
    chartContainer.addEventListener('mouseup', handleDrawingEnd);
    chartContainer.addEventListener('mouseleave', handleDrawingEnd);
    
    // Обработка ресайза
    new ResizeObserver(entries => {
        if (entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({ width, height });
    }).observe(chartContainer);
}

// Обработка начала рисования
function handleDrawingStart(event) {
    if (!drawingTool) return;
    
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const coordinate = chart.timeScale().coordinateToLogical(x);
    const price = chart.priceScale('left').coordinateToPrice(y);
    
    if (coordinate && price) {
        isDrawing = true;
        drawingStartPoint = { x, y, coordinate, price };
        
        // Создаем новую серию для рисования
        if (drawingTool === 'line' || drawingTool === 'ray') {
            const lineSeries = chart.addLineSeries({
                color: drawingColor,
                lineWidth: 2,
                lineStyle: drawingTool === 'ray' ? 2 : 0, // Пунктир для луча
                priceScaleId: 'left',
            });
            drawingSeries.push(lineSeries);
        } else if (drawingTool === 'horizontal') {
            const lineSeries = chart.addLineSeries({
                color: drawingColor,
                lineWidth: 1,
                lineStyle: 2, // Пунктир
                priceScaleId: 'left',
            });
            drawingSeries.push(lineSeries);
        }
    }
}

// Обработка движения мыши при рисовании
function handleDrawingMove(event) {
    if (!isDrawing || !drawingStartPoint) return;
    
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const coordinate = chart.timeScale().coordinateToLogical(x);
    const price = chart.priceScale('left').coordinateToPrice(y);
    
    if (coordinate && price) {
        const currentSeries = drawingSeries[drawingSeries.length - 1];
        
        if (drawingTool === 'line') {
            // Рисуем линию между начальной и текущей точкой
            currentSeries.setData([
                { time: drawingStartPoint.coordinate, value: drawingStartPoint.price },
                { time: coordinate, value: price }
            ]);
        } else if (drawingTool === 'ray') {
            // Рисуем луч (бесконечную линию)
            const timeScale = chart.timeScale();
            const visibleRange = timeScale.getVisibleRange();
            
            if (visibleRange) {
                // Рассчитываем угол луча
                const dx = coordinate - drawingStartPoint.coordinate;
                const dy = price - drawingStartPoint.price;
                
                if (dx !== 0) {
                    const slope = dy / dx;
                    const startValue = drawingStartPoint.price - slope * drawingStartPoint.coordinate;
                    
                    // Создаем точки для отрисовки луча по всей видимой области
                    const lineData = [
                        { time: visibleRange.from, value: startValue + slope * visibleRange.from },
                        { time: visibleRange.to, value: startValue + slope * visibleRange.to }
                    ];
                    
                    currentSeries.setData(lineData);
                }
            }
        } else if (drawingTool === 'horizontal') {
            // Горизонтальная линия
            currentSeries.setData([
                { time: drawingStartPoint.coordinate, value: drawingStartPoint.price },
                { time: coordinate, value: drawingStartPoint.price }
            ]);
        }
    }
}

// Обработка окончания рисования
function handleDrawingEnd() {
    isDrawing = false;
    drawingStartPoint = null;
}

// Очистка всех рисунков
function clearAllDrawings() {
    drawingSeries.forEach(series => {
        chart.removeSeries(series);
    });
    drawingSeries = [];
}

// Загрузка данных графика
async function loadChartData() {
    showLoading();
    
    try {
        // Симуляция загрузки данных (в реальном приложении здесь был бы API запрос)
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

// Рассчитать индикаторы
function calculateIndicators(data) {
    // Здесь будет расчет SMA, EMA и других индикаторов
    const smaData = calculateSMA(data, 20);
    const emaData = calculateEMA(data, 20);
    
    // Обновление графиков индикаторов
    updateIndicatorSeries('sma', smaData);
    updateIndicatorSeries('ema', emaData);
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
    
    result.push({ time: data[0].time, value: ema });
    
    for (let i = 1; i < data.length; i++) {
        ema = (data[i].close - ema) * k + ema;
        result.push({ time: data[i].time, value: ema });
    }
    return result;
}

// Обновление серий индикаторов
function updateIndicatorSeries(indicator, data) {
    // Здесь будет обновление графиков индикаторов
}

// Показать подсказку
function showTooltip(x, y, data) {
    const tooltip = document.getElementById('chartTooltip');
    if (!tooltip) return;
    
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
        </div>
    `;
    
    tooltip.style.left = (x + 10) + 'px';
    tooltip.style.top = (y + 10) + 'px';
    tooltip.style.display = 'block';
}

// Скрыть подсказку
function hideTooltip() {
    const tooltip = document.getElementById('chartTooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Исполнение сделки
function executeTrade(type) {
    const amount = parseFloat(document.getElementById('trade-amount').value) || 0;
    const price = currentData[currentData.length - 1].close;
    
    if (amount <= 0) {
        alert('Введите корректную сумму');
        return;
    }
    
    const cost = amount * price;
    
    if (type === 'buy') {
        if (cost > balance) {
            alert('Недостаточно средств');
            return;
        }
        balance -= cost;
        portfolio[currentAsset] = (portfolio[currentAsset] || 0) + amount;
    } else {
        if (amount > (portfolio[currentAsset] || 0)) {
            alert('Недостаточно активов');
            return;
        }
        balance += cost;
        portfolio[currentAsset] = (portfolio[currentAsset] || 0) - amount;
    }
    
    // Добавляем в историю
    tradeHistory.unshift({
        type: type,
        asset: currentAsset,
        amount: amount,
        price: price,
        total: cost,
        timestamp: Date.now(),
        profit: type === 'sell' ? cost - (amount * (portfolio.avgPrice || price)) : 0
    });
    
    updateUI();
    saveToLocalStorage();
}

// Покупка на все средства
function buyMax() {
    const price = currentData[currentData.length - 1].close;
    const maxAmount = balance / price;
    document.getElementById('trade-amount').value = maxAmount.toFixed(4);
}

// Расчет риска
function calculateRisk() {
    // Реализация расчета риска
    alert('Функция расчета риска будет реализована в будущем');
}

// Показать подсказку учителя
function showTeacherHint() {
    const hints = [
        "Обратите внимание на уровни поддержки и сопротивления на графике.",
        "Объемы торгов могут указывать на силу движения цены.",
        "Используйте стоп-лоссы для управления рисками.",
        "Диверсифицируйте портфель для снижения рисков.",
        "Анализируйте тренды перед принятием торговых решений."
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    document.getElementById('teacher-message').textContent = randomHint;
}

// Показать анализ учителя
function showTeacherAnalysis() {
    const lastBar = currentData[currentData.length - 1];
    const prevBar = currentData[currentData.length - 2];
    
    let analysis = `Текущая цена: ${lastBar.close.toFixed(2)}. `;
    
    if (lastBar.close > prevBar.close) {
        analysis += "Бычье движение. Возможен рост. ";
    } else {
        analysis += "Медвежье движение. Возможен спад. ";
    }
    
    if (Math.abs(lastBar.close - prevBar.close) / prevBar.close > 0.03) {
        analysis += "Сильное движение! Будьте осторожны с рисками.";
    } else {
        analysis += "Движение в пределах нормы.";
    }
    
    document.getElementById('teacher-message').textContent = analysis;
}

// Показать урок учителя
function showTeacherLesson() {
    const lessons = [
        "Уровни поддержки и сопротивления: это ценовые уровни, где покупатели или продавцы входят в рынок в большом количестве.",
        "Скользящие средние: помогают определить направление тренда и возможные точки разворота.",
        "RSI (Relative Strength Index): индикатор, показывающий перекупленность или перепроданность актива.",
        "Объемы торгов: высокие объемы подтверждают силу движения цены.",
        "Стоп-лосс: ордер для ограничения убытков при неблагоприятном движении цены."
    ];
    
    const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
    document.getElementById('teacher-message').textContent = randomLesson;
}

// Переключить словарь
function toggleDictionary() {
    const dictionary = document.getElementById('teacher-dictionary');
    dictionary.style.display = dictionary.style.display === 'none' ? 'block' : 'none';
}

// Экспорт данных
function exportData() {
    const data = {
        balance: balance,
        portfolio: portfolio,
        tradeHistory: tradeHistory,
        activeOrders: activeOrders
    };
    
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'trading-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
            
            updateUI();
            saveToLocalStorage();
            alert('Данные успешно импортированы!');
        } catch (error) {
            alert('Ошибка при импорте данных: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Сброс данных
function resetData() {
    if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
        balance = 100.00;
        portfolio = { 'BTC': 0, 'ETH': 0, 'SOL': 0 };
        tradeHistory = [];
        activeOrders = [];
        
        updateUI();
        saveToLocalStorage();
    }
}

// Создание ордера
function createOrder() {
    // Реализация создания ордера
    alert('Функция создания ордера будет реализована в будущем');
}

// Обновление UI
function updateUI() {
    // Обновление баланса
    document.getElementById('balance-amount').textContent = balance.toFixed(2) + ' USD';
    
    // Обновление портфеля
    updatePortfolioDisplay();
    
    // Обновление истории
    updateHistoryDisplay();
    
    // Обновление ордеров
    updateOrdersDisplay();
}

// Обновление отображения портфеля
function updatePortfolioDisplay() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;
    
    let totalValue = balance;
    let html = '';
    
    for (const [asset, amount] of Object.entries(portfolio)) {
        if (amount > 0) {
            const price = currentData.length > 0 ? currentData[currentData.length - 1].close : 0;
            const value = amount * price;
            totalValue += value;
            
            html += `
                <div class="portfolio-item">
                    <span>${asset}</span>
                    <span>${amount.toFixed(4)} (${value.toFixed(2)} USD)</span>
                </div>
            `;
        }
    }
    
    html += `
        <div class="portfolio-item total">
            <span>Общий баланс</span>
            <span>${totalValue.toFixed(2)} USD</span>
        </div>
    `;
    
    portfolioGrid.innerHTML = html;
}

// Обновление отображения истории
function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (tradeHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-history">Нет истории сделок</div>';
        return;
    }
    
    let html = '';
    tradeHistory.slice(0, 10).forEach(trade => {
        const isProfit = trade.type === 'sell' && trade.profit > 0;
        const isLoss = trade.type === 'sell' && trade.profit <= 0;
        
        html += `
            <div class="history-item ${isLoss ? 'loss' : ''}">
                <div class="history-info">
                    <span class="history-type">${trade.type === 'buy' ? 'Покупка' : 'Продажа'} ${trade.asset}</span>
                    <span class="history-details">
                        ${trade.amount.toFixed(4)} по ${trade.price.toFixed(2)} USD
                    </span>
                </div>
                <span class="history-amount ${isProfit ? 'profit' : isLoss ? 'loss' : ''}">
                    ${trade.type === 'buy' ? '-' : '+'}${trade.total.toFixed(2)} USD
                    ${trade.type === 'sell' && `(${trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)})`}
                </span>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

// Обновление отображения ордеров
function updateOrdersDisplay() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;
    
    if (activeOrders.length === 0) {
        ordersList.innerHTML = '<div class="empty-orders">Нет активных ордеров</div>';
        return;
    }
    
    // Здесь будет обновление списка ордеров
}

// Сохранение в localStorage
function saveToLocalStorage() {
    const data = {
        balance: balance,
        portfolio: portfolio,
        tradeHistory: tradeHistory,
        activeOrders: activeOrders
    };
    
    localStorage.setItem('tradingAppData', JSON.stringify(data));
}

// Загрузка из localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('tradingAppData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            balance = data.balance || balance;
            portfolio = data.portfolio || portfolio;
            tradeHistory = data.tradeHistory || tradeHistory;
            activeOrders = data.activeOrders || activeOrders;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }
}

// Обновление статистики журнала
function updateJournalStats() {
    // Здесь будет обновление статистики журнала
}

// Обновление достижений
function updateAchievements() {
    // Здесь будет обновление достижений
}
