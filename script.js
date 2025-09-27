// Основные переменные
let chart;
let candleSeries;
let volumeSeries;
let smaSeries;
let emaSeries;
let rsiSeries;
let currentData = [];
let balance = 100.00;
let portfolio = {
    'BTC': 0,
    'ETH': 0, 
    'SOL': 0,
    'ADA': 0,
    'DOT': 0
};
let tradeHistory = [];
let activeOrders = [];
let currentAsset = 'BTCUSDT';
let currentTimeframe = '1m';
let indicators = {
    sma: true,
    ema: false,
    rsi: false,
    volume: true
};
let wsConnection = null;
let realTimeData = null;

// База знаний учителя
const teacherKnowledge = {
    questions: {
        'что такое трейдинг': 'Трейдинг - это торговля финансовыми инструментами с целью получения прибыли от изменения их цены.',
        'как начать торговать': 'Начните с изучения основ, откройте демо-счет, разработайте стратегию и торгуйте на небольшие суммы.',
        'что такое стоп лосс': 'Стоп-лосс - это ордер, который автоматически закрывает позицию при достижении определенного уровня убытка.',
        'что такое тейк профит': 'Тейк-профит - это ордер, который автоматически закрывает позицию при достижении определенного уровня прибыли.',
        'как анализировать график': 'Используйте технический анализ: изучайте свечные паттерны, индикаторы, уровни поддержки и сопротивления.',
        'что такое бычий рынок': 'Бычий рынок - это период роста цен, когда инвесторы настроены оптимистично.',
        'что такое медвежий рынок': 'Медвежий рынок - это период падения цен, когда инвесторы настроены пессимистично.',
        'как управлять рисками': 'Рискуйте не более 1-2% от депозита на сделку, используйте стоп-лосс и диверсифицируйте портфель.',
        'что такое диверсификация': 'Диверсификация - это распределение капитала между разными активами для снижения рисков.',
        'какие индикаторы использовать': 'Начните с SMA, EMA, RSI и MACD. Каждый индикатор имеет свои особенности и сигналы.'
    },

    lessons: {
        'basics': {
            title: '📖 Основы трейдинга',
            content: `Трейдинг - это искусство buying low and selling high (покупать дешево, продавать дорого). 
            
            Основные понятия:
            • Long (лонг) - покупка актива в ожидании роста цены
            • Short (шорт) - продажа актива в ожидании падения цены
            • Spread (спред) - разница между ценой покупки и продажи
            • Volume (объем) - количество торгуемых активов
            
            Важно: никогда не рискуйте больше, чем можете позволить себе потерять!`
        },
        'candles': {
            title: '🕯️ Свечной анализ',
            content: `Японские свечи показывают цену открытия, закрытия, максимум и минимум за период.
            
            Основные паттерны:
            • Бычья свеча - закрытие выше открытия (обычно зеленая)
            • Медвежья свеча - закрытие ниже открытия (обычно красная)
            • Доджи - маленькое тело, нерешительность рынка
            • Молот - бычий разворотный паттерн
            • Повешенный - медвежий разворотный паттерн
            
            Анализируйте свечи в контексте тренда!`
        },
        'indicators': {
            title: '📊 Технические индикаторы',
            content: `Индикаторы помогают анализировать рынок и находить точки входа.
            
            Популярные индикаторы:
            • SMA (Simple Moving Average) - простая скользящая средняя
            • EMA (Exponential Moving Average) - экспоненциальная скользящая средняя
            • RSI (Relative Strength Index) - индекс относительной силы
            • MACD (Moving Average Convergence Divergence) - схождение/расхождение скользящих средних
            
            Не используйте слишком много индикаторов - это создаст путаницу!`
        },
        'risk': {
            title: '🛡️ Управление рисками',
            content: `Управление рисками - ключ к успешному трейдингу!
            
            Основные правила:
            • Рискуйте не более 1-2% от депозита на сделку
            • Всегда устанавливайте стоп-лосс
            • Соотношение риск/прибыль должно быть не менее 1:2
            • Ведите торговый журнал
            • Контролируйте эмоции - жадность и страх главные враги трейдера
            
            Помните: сохранить капитал важнее, чем заработать!`
        }
    },

    dictionary: {
        'sma': {
            title: 'SMA (Simple Moving Average)',
            description: 'Простая скользящая средняя - индикатор, показывающий среднюю цену актива за определенный период. Сглаживает ценовые колебания и помогает определить тренд.'
        },
        'ema': {
            title: 'EMA (Exponential Moving Average)',
            description: 'Экспоненциальная скользящая средняя - похожа на SMA, но придает больший вес последним ценам, что делает ее более чувствительной к recent price changes.'
        },
        'rsi': {
            title: 'RSI (Relative Strength Index)',
            description: 'Индекс относительной силы - осциллятор, измеряющий скорость и изменение ценовых движений. Значения выше 70 указывают на перекупленность, ниже 30 - на перепроданность.'
        },
        'stoploss': {
            title: 'Stop-Loss (Стоп-Лосс)',
            description: 'Ордер, который автоматически закрывает позицию при достижении определенного уровня убытка. Защищает от больших потерь.'
        },
        'takeprofit': {
            title: 'Take-Profit (Тейк-Профит)',
            description: 'Ордер, который автоматически закрывает позицию при достижении определенного уровня прибыли. Позволяет зафиксировать прибыль.'
        },
        'leverage': {
            title: 'Кредитное плечо (Leverage)',
            description: 'Торговля с заемными средствами, которая позволяет открывать позиции большего объема при меньшем депозите. Увеличивает как прибыль, так и убытки.'
        },
        'bullmarket': {
            title: 'Бычий рынок (Bull Market)',
            description: 'Период роста цен на рынке, когда инвесторы настроены оптимистично и ожидают дальнейшего повышения цен.'
        },
        'bearmarket': {
            title: 'Медвежий рынок (Bear Market)',
            description: 'Период падения цен на рынке, когда инвесторы настроены пессимистично и ожидают дальнейшего снижения цен.'
        }
    },

    getSmartAnswer: function(question) {
        question = question.toLowerCase();
        
        if (question.includes('как выбрать') && question.includes('актив')) {
            return "Выбирайте активы с хорошим объемом торгов, изучайте их фундаментальные показатели и следите за новостями.";
        }
        
        if (question.includes('лучшее время') && question.includes('торг')) {
            return "Лучшее время для торговли зависит от волатильности актива. Криптовалюты часто активны круглосуточно, а фондовые рынки - в часы работы бирж.";
        }
        
        if (question.includes('сколько') && question.includes('зарабат')) {
            return "Доходность зависит от многих факторов: вашей стратегии, риска, рыночных условий. Реальные ожидания: 5-20% в месяц при грамотном подходе.";
        }
        
        if (question.includes('новичк')) {
            return "Новичкам рекомендую: 1) Изучить основы 2) Торговать на демо-счете 3) Начать с маленьких сумм 4) Фокусироваться на обучении, а не на заработке.";
        }
        
        if (question.includes('ошибк') && question.includes('начина')) {
            return "Частые ошибки новичков: 1) Торговля без стоп-лосса 2) Излишний риск 3) Эмоциональные решения 4) Отсутствие торгового плана 5) Погоня за убытками.";
        }
        
        return "Хороший вопрос! Рекомендую изучить этот topic в разделе 'Уроки' или спросите более конкретно.";
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadHistoricalData();
    connectWebSocket();
});

// Инициализация приложения
function initializeApp() {
    loadFromLocalStorage();
    initializeChart();
    
    const savedIndicators = localStorage.getItem('tradelearn_indicators');
    if (savedIndicators) {
        indicators = {...indicators, ...JSON.parse(savedIndicators)};
        updateIndicatorCheckboxes();
    }
    
    updateUI();
}

// Настройка обработчиков событий
function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            showSection(section);
        });
    });
    
    document.querySelectorAll('.close-section').forEach(btn => {
        btn.addEventListener('click', () => {
            hideAllSections();
        });
    });
    
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    
    document.getElementById('asset-select').addEventListener('change', (e) => {
        currentAsset = e.target.value;
        if (wsConnection) {
            wsConnection.close();
        }
        loadHistoricalData();
        connectWebSocket();
    });
    
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentTimeframe = e.currentTarget.dataset.tf;
            if (wsConnection) {
                wsConnection.close();
            }
            loadHistoricalData();
            connectWebSocket();
        });
    });
    
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
    
    document.getElementById('volume-toggle').addEventListener('change', (e) => {
        indicators.volume = e.target.checked;
        updateIndicators();
        saveIndicatorsToLocalStorage();
    });
    
    document.getElementById('buy-btn').addEventListener('click', () => executeTrade('buy'));
    document.getElementById('sell-btn').addEventListener('click', () => executeTrade('sell'));
    document.getElementById('buy-max-btn').addEventListener('click', buyMax);
    
    document.getElementById('calculate-risk').addEventListener('click', calculateRisk);
    
    document.getElementById('teacher-hint').addEventListener('click', showTeacherHint);
    document.getElementById('teacher-analysis').addEventListener('click', showTeacherAnalysis);
    document.getElementById('teacher-lesson').addEventListener('click', showTeacherLesson);
    document.getElementById('teacher-dictionary-btn').addEventListener('click', toggleDictionary);
    document.getElementById('ask-question').addEventListener('click', answerQuestion);
    document.getElementById('teacher-question').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') answerQuestion();
    });
    document.getElementById('close-term').addEventListener('click', () => {
        document.getElementById('term-details').style.display = 'none';
    });
    
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const lessonId = e.currentTarget.dataset.lesson;
            showLesson(lessonId);
        });
    });
    
    document.querySelectorAll('.dictionary-term').forEach(term => {
        term.addEventListener('click', (e) => {
            const termId = e.currentTarget.dataset.term;
            showTermDefinition(termId);
        });
    });
    
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file').addEventListener('change', importData);
    document.getElementById('reset-btn').addEventListener('click', resetData);
    
    document.getElementById('create-order-btn').addEventListener('click', createOrder);
}

// Инициализация графика
function initializeChart() {
    const chartContainer = document.getElementById('candleChart');
    
    chart = LightweightCharts.createChart(chartContainer, {
        layout: {
            background: { color: '#121212' },
            textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
            vertLines: { color: 'rgba(42, 46, 57, 0.3)' },
            horzLines: { color: 'rgba(42, 46, 57, 0.3)' },
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
    
    candleSeries = chart.addCandlestickSeries({
        upColor: '#00c853',
        downColor: '#ff5252',
        borderDownColor: '#ff5252',
        borderUpColor: '#00c853',
        wickDownColor: '#ff5252',
        wickUpColor: '#00c853',
    });
    
    volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: 'volume',
    });
    
    chart.priceScale('volume').applyOptions({
        scaleMargins: {
            top: 0.8,
            bottom: 0,
        },
    });
    
    smaSeries = chart.addLineSeries({
        color: '#2962ff',
        lineWidth: 2,
        title: 'SMA 20',
    });
    
    emaSeries = chart.addLineSeries({
        color: '#ff6d00',
        lineWidth: 2,
        title: 'EMA 12',
    });
    
    rsiSeries = chart.addLineSeries({
        color: '#9c27b0',
        lineWidth: 2,
        priceScaleId: 'rsi',
        title: 'RSI 14',
    });
    
    chart.priceScale('rsi').applyOptions({
        scaleMargins: {
            top: 0.7,
            bottom: 0.1,
        },
    });
    
    chart.subscribeCrosshairMove(param => {
        if (!param.point) return;
        
        const data = param.seriesData.get(candleSeries);
        if (data) {
            showTooltip(param.point.x, param.point.y, data);
        } else {
            hideTooltip();
        }
    });
    
    new ResizeObserver(entries => {
        if (entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({ width, height });
    }).observe(chartContainer);
}

// Загрузка исторических данных с Binance
async function loadHistoricalData() {
    showLoading();
    
    try {
        const symbol = currentAsset;
        const interval = currentTimeframe;
        const limit = 500;
        
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        const klines = await response.json();
        
        const candleData = klines.map(k => ({
            time: k[0] / 1000,
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5])
        }));
        
        const volumeData = klines.map(k => ({
            time: k[0] / 1000,
            value: parseFloat(k[5]),
            color: parseFloat(k[4]) >= parseFloat(k[1]) ? 'rgba(0, 200, 83, 0.5)' : 'rgba(255, 82, 82, 0.5)'
        }));
        
        currentData = candleData;
        
        candleSeries.setData(candleData);
        volumeSeries.setData(volumeData);
        
        updateCurrentPrice(candleData[candleData.length - 1]);
        calculateIndicators(candleData);
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showError('Не удалось загрузить данные с Binance');
    } finally {
        hideLoading();
    }
}

// Подключение к WebSocket для реального времени
function connectWebSocket() {
    if (wsConnection) {
        wsConnection.close();
    }
    
    const symbol = currentAsset.toLowerCase();
    const stream = `${symbol}@kline_${currentTimeframe}`;
    
    wsConnection = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);
    
    wsConnection.onopen = () => {
        console.log('WebSocket подключен');
    };
    
    wsConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.k) {
            const kline = data.k;
            const newCandle = {
                time: kline.t / 1000,
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
                volume: parseFloat(kline.v)
            };
            
            const newVolume = {
                time: kline.t / 1000,
                value: parseFloat(kline.v),
                color: parseFloat(kline.c) >= parseFloat(kline.o) ? 'rgba(0, 200, 83, 0.5)' : 'rgba(255, 82, 82, 0.5)'
            };
            
            if (!kline.x) {
                candleSeries.update(newCandle);
                volumeSeries.update(newVolume);
            } else {
                currentData.push(newCandle);
                if (currentData.length > 500) {
                    currentData.shift();
                }
                
                candleSeries.update(newCandle);
                volumeSeries.update(newVolume);
                
                updateCurrentPrice(newCandle);
                calculateIndicators(currentData);
            }
            
            realTimeData = newCandle;
        }
    };
    
    wsConnection.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
    };
    
    wsConnection.onclose = () => {
        console.log('WebSocket отключен');
        setTimeout(() => connectWebSocket(), 5000);
    };
}

// Расчет индикаторов
function calculateIndicators(data) {
    if (data.length < 20) return;
    
    const smaData = calculateSMA(data, 20);
    smaSeries.setData(smaData);
    
    const emaData = calculateEMA(data, 12);
    emaSeries.setData(emaData);
    
    const rsiData = calculateRSI(data, 14);
    rsiSeries.setData(rsiData);
    
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
    
    for (let i = 0; i < data.length; i++) {
        if (i === 0) {
            ema = data[i].close;
        } else {
            ema = (data[i].close - ema) * k + ema;
        }
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
        
        avgGain = (avgGain * (period - 1) + Math.max(change, 0)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.max(-change, 0)) / period;
        
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
    
    volumeSeries.applyOptions({
        visible: indicators.volume
    });
}

// Обновить чекбоксы индикаторов
function updateIndicatorCheckboxes() {
    document.getElementById('sma-toggle').checked = indicators.sma;
    document.getElementById('ema-toggle').checked = indicators.ema;
    document.getElementById('rsi-toggle').checked = indicators.rsi;
    document.getElementById('volume-toggle').checked = indicators.volume;
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
    alert(message);
}

// Обновить текущую цену
function updateCurrentPrice(bar) {
    const priceElement = document.getElementById('current-price');
    const changeElement = document.getElementById('price-change');
    const assetElement = document.getElementById('current-asset');
    
    const prevPrice = currentData.length > 1 ? currentData[currentData.length - 2].close : bar.open;
    const change = ((bar.close - prevPrice) / prevPrice) * 100;
    
    assetElement.textContent = currentAsset.replace('USDT', '/USDT');
    priceElement.textContent = bar.close.toFixed(2);
    changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
    
    priceElement.classList.add('price-update');
    setTimeout(() => priceElement.classList.remove('price-update'), 1000);
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
    if (!realTimeData) {
        showError('Нет данных о текущей цене');
        return;
    }
    
    const amount = parseFloat(document.getElementById('trade-amount').value);
    const currentPrice = realTimeData.close;
    const assetSymbol = currentAsset.replace('USDT', '');
    
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
        portfolio[assetSymbol] = (portfolio[assetSymbol] || 0) + assetAmount;
        balance -= amount;
        
        tradeHistory.push({
            type: 'buy',
            asset: assetSymbol,
            amount: assetAmount,
            price: currentPrice,
            total: amount,
            timestamp: Date.now()
        });
        
    } else if (type === 'sell') {
        const assetAmount = amount / currentPrice;
        
        if (assetAmount > (portfolio[assetSymbol] || 0)) {
            showError('Недостаточно актива');
            return;
        }
        
        portfolio[assetSymbol] = (portfolio[assetSymbol] || 0) - assetAmount;
        balance += amount;
        
        tradeHistory.push({
            type: 'sell',
            asset: assetSymbol,
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
    if (!realTimeData) {
        showError('Нет данных о текущей цене');
        return;
    }
    
    const currentPrice = realTimeData.close;
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
        "Анализируйте график перед совершением сделки. Ищите подтверждения!",
        "Не поддавайтесь эмоциям - торгуйте по плану, а не по настроению.",
        "Диверсифицируйте портфель для снижения рисков. Не кладите все яйца в одну корзину!",
        "Изучайте основы технического анализа - это фундамент успешного трейдинга.",
        "Ведите торговый журнал! Анализируйте свои успехи и ошибки.",
        "Тренд - ваш друг. Не пытайтесь торговать против тренда, особенно новичкам.",
        "Паттерны повторяются! Изучайте исторические данные и графические модели.",
        "Управление капиталом важнее, чем точность прогнозов!",
        "Обучайтесь постоянно! Рынки меняются, и ваши знания должны обновляться."
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('teacher-message').textContent = randomMessage;
}

// Показать анализ учителя
function showTeacherAnalysis() {
    if (!realTimeData) {
        document.getElementById('teacher-message').textContent = "Нет данных для анализа. Подождите загрузки графика.";
        return;
    }
    
    const currentPrice = realTimeData.close;
    const analysis = `Текущая цена ${currentAsset.replace('USDT', '/USDT')}: ${currentPrice.toFixed(2)}. `;
    
    document.getElementById('teacher-message').textContent = analysis + "Рекомендую изучить график и индикаторы.";
}

// Показать урок учителя
function showTeacherLesson() {
    const lessons = document.getElementById('teacher-lessons');
    const dictionary = document.getElementById('teacher-dictionary');
    const termDetails = document.getElementById('term-details');
    
    if (lessons.style.display === 'block') {
        lessons.style.display = 'none';
    } else {
        lessons.style.display = 'block';
        dictionary.style.display = 'none';
        termDetails.style.display = 'none';
        document.getElementById('teacher-message').textContent = "Выберите урок для изучения:";
    }
}

// Ответить на вопрос
function answerQuestion() {
    const questionInput = document.getElementById('teacher-question');
    const question = questionInput.value.toLowerCase().trim();
    
    if (!question) return;
    
    let answer = "Извините, я не понял вопрос. Попробуйте спросить о: трейдинге, индикаторах, рисках, стоп-лоссе или тейк-профите.";
    
    for (const [key, value] of Object.entries(teacherKnowledge.questions)) {
        if (question.includes(key)) {
            answer = value;
            break;
        }
    }
    
    if (question.includes('привет') || question.includes('здравств')) {
        answer = "Привет! Я ваш учитель по трейдингу. Задавайте вопросы, и я с радостью помогу!";
    }
    
    if (question.includes('спасибо') || question.includes('благодар')) {
        answer = "Пожалуйста! Всегда рад помочь. Удачи в трейдинге! 🚀";
    }
    
    if (answer === "Извините, я не понял вопрос...") {
        answer = teacherKnowledge.getSmartAnswer(question);
    }
    
    document.getElementById('teacher-message').textContent = answer;
    questionInput.value = '';
}

// Показать урок
function showLesson(lessonId) {
    const lesson = teacherKnowledge.lessons[lessonId];
    if (lesson) {
        document.getElementById('teacher-message').innerHTML = `
            <strong>${lesson.title}</strong><br><br>
            ${lesson.content.replace(/\n/g, '<br>')}
        `;
    }
}

// Показать определение термина
function showTermDefinition(termId) {
    const term = teacherKnowledge.dictionary[termId];
    if (term) {
        document.getElementById('term-title').textContent = term.title;
        document.getElementById('term-description').textContent = term.description;
        document.getElementById('term-details').style.display = 'block';
        document.getElementById('teacher-dictionary').style.display = 'none';
    }
}

// Переключить словарь
function toggleDictionary() {
    const dictionary = document.getElementById('teacher-dictionary');
    const lessons = document.getElementById('teacher-lessons');
    const termDetails = document.getElementById('term-details');
    
    if (dictionary.style.display === 'block') {
        dictionary.style.display = 'none';
    } else {
        dictionary.style.display = 'block';
        lessons.style.display = 'none';
        termDetails.style.display = 'none';
    }
}

// Создать ордер
function createOrder() {
    if (!realTimeData) {
        showError('Нет данных о текущей цене');
        return;
    }
    
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
        asset: currentAsset.replace('USDT', ''),
        timestamp: Date.now()
    });
    
    updateOrdersList();
    saveToLocalStorage();
    
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
        portfolio = { 'BTC': 0, 'ETH': 0, 'SOL': 0, 'ADA': 0, 'DOT': 0 };
        tradeHistory = [];
        activeOrders = [];
        indicators = { sma: true, ema: false, rsi: false, volume: true };
        
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
    document.getElementById('balance').textContent = balance.toFixed(2) + ' USDT';
    
    document.getElementById('btc-amount').textContent = portfolio.BTC.toFixed(6);
    document.getElementById('eth-amount').textContent = portfolio.ETH.toFixed(6);
    document.getElementById('sol-amount').textContent = portfolio.SOL.toFixed(6);
    document.getElementById('ada-amount').textContent = portfolio.ADA.toFixed(6);
    document.getElementById('dot-amount').textContent = portfolio.DOT.toFixed(6);
    
    const currentPrice = realTimeData ? realTimeData.close : 0;
    let totalValue = balance;
    Object.keys(portfolio).forEach(asset => {
        totalValue += portfolio[asset] * currentPrice;
    });
    
    document.getElementById('total-value').textContent = totalValue.toFixed(2) + ' USDT';
    
    updateHistoryList();
    updateOrdersList();
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

window.cancelOrder = cancelOrder;
