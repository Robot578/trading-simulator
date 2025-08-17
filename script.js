class TradingApp {
    constructor() {
        this.state = {
            balance: 10000,
            portfolio: { BTC: 0, ETH: 0, SOL: 0, ADA: 0 },
            prices: { BTC: 0, ETH: 0, SOL: 0, ADA: 0 },
            history: [],
            chart: null,
            volumeSeries: null,
            rsiSeries: null,
            candleSeries: null,
            smaSeries: null,
            socket: null,
            timeframe: '1h',
            candles: []
        };

        this.init();
    }

    async init() {
        this.initCharts();
        this.setupEventListeners();
        this.loadInitialData();
        this.updateUI();
    }

    initCharts() {
        const chartContainer = document.getElementById('candleChart');
        chartContainer.innerHTML = '';

        // Основной график
        this.state.chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 350,
            layout: {
                backgroundColor: '#1e293b',
                textColor: 'rgba(255, 255, 255, 0.9)'
            },
            grid: {
                vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
                horzLines: { color: 'rgba(197, 203, 206, 0.1)' }
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal
            },
            timeScale: {
                timeVisible: true,
                borderColor: 'rgba(197, 203, 206, 0.1)'
            }
        });

        // Свечной график
        this.state.candleSeries = this.state.chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#10b981',
            wickDownColor: '#ef4444',
            wickUpColor: '#10b981'
        });

        // Линия SMA
        this.state.smaSeries = this.state.chart.addLineSeries({
            color: '#f7931a',
            lineWidth: 2
        });

        // График объема
        const volumeChart = LightweightCharts.createChart(document.getElementById('volumeChart'), {
            width: chartContainer.clientWidth,
            height: 80,
            layout: {
                backgroundColor: '#1e293b',
                textColor: 'rgba(255, 255, 255, 0.9)'
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: false }
            },
            timeScale: {
                visible: false
            }
        });

        this.state.volumeSeries = volumeChart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume'
            },
            priceScaleId: ''
        });

        // График RSI
        const rsiChart = LightweightCharts.createChart(document.getElementById('rsiChart'), {
            width: chartContainer.clientWidth,
            height: 80,
            layout: {
                backgroundColor: '#1e293b',
                textColor: 'rgba(255, 255, 255, 0.9)'
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: false }
            },
            timeScale: {
                visible: false
            }
        });

        this.state.rsiSeries = rsiChart.addLineSeries({
            color: '#9c27b0',
            lineWidth: 1
        });
    }

    async loadInitialData() {
        const asset = document.getElementById('asset-select').value;
        await this.fetchCandles(asset);
        this.connectWebSocket();
    }

    async fetchCandles(asset) {
        const symbol = `${asset}USDT`;
        const timeframe = this.state.timeframe;
        const limit = 100;

        try {
            const response = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}`
            );
            const data = await response.json();

            this.state.candles = data.map(item => ({
                time: item[0] / 1000,
                open: parseFloat(item[1]),
                high: parseFloat(item[2]),
                low: parseFloat(item[3]),
                close: parseFloat(item[4]),
                volume: parseFloat(item[5])
            }));

            this.updateCharts();
            document.getElementById('chartLoader').style.display = 'none';
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }
    }

    updateCharts() {
        // Обновляем свечи
        this.state.candleSeries.setData(this.state.candles);

        // Обновляем объемы
        const volumeData = this.state.candles.map(candle => ({
            time: candle.time,
            value: candle.volume,
            color: candle.close > candle.open ? '#10b981' : '#ef4444'
        }));
        this.state.volumeSeries.setData(volumeData);

        // Рассчитываем и обновляем SMA
        const closePrices = this.state.candles.map(c => c.close);
        const sma = this.calculateSMA(closePrices, 14);
        const smaData = this.state.candles.slice(13).map((candle, i) => ({
            time: candle.time,
            value: sma[i]
        }));
        this.state.smaSeries.setData(smaData);

        // Рассчитываем и обновляем RSI
        const rsi = this.calculateRSI(closePrices, 14);
        const rsiData = this.state.candles.slice(14).map((candle, i) => ({
            time: candle.time,
            value: rsi[i]
        }));
        this.state.rsiSeries.setData(rsiData);
    }

    calculateSMA(data, windowSize) {
        const sma = [];
        for (let i = windowSize - 1; i < data.length; i++) {
            const sum = data.slice(i - windowSize + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / windowSize);
        }
        return sma;
    }

    calculateRSI(data, period) {
        const rsi = new technicalindicators.RSI({ values: data, period });
        return rsi.result;
    }

    connectWebSocket() {
        if (this.state.socket) this.state.socket.close();

        const asset = document.getElementById('asset-select').value;
        const symbol = `${asset}USDT`.toLowerCase();
        const timeframe = this.state.timeframe;

        this.state.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@kline_${timeframe}`);

        this.state.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const candleData = data.k;

            const newCandle = {
                time: candleData.t / 1000,
                open: parseFloat(candleData.o),
                high: parseFloat(candleData.h),
                low: parseFloat(candleData.l),
                close: parseFloat(candleData.c),
                volume: parseFloat(candleData.v)
            };

            // Обновляем последнюю свечу
            if (!candleData.x) {
                this.state.candles[this.state.candles.length - 1] = newCandle;
            } else {
                // Добавляем новую свечу
                this.state.candles.push(newCandle);
                if (this.state.candles.length > 100) {
                    this.state.candles.shift();
                }
            }

            this.updateCharts();
        };
    }

    setupEventListeners() {
        // Смена актива
        document.getElementById('asset-select').addEventListener('change', () => {
            this.loadInitialData();
        });

        // Смена таймфрейма
        document.getElementById('timeframe-select').addEventListener('change', (e) => {
            this.state.timeframe = e.target.value;
            this.loadInitialData();
        });

        // Показать/скрыть индикаторы
        document.getElementById('sma-toggle').addEventListener('change', (e) => {
            this.state.smaSeries.applyOptions({ visible: e.target.checked });
        });

        document.getElementById('rsi-toggle').addEventListener('change', (e) => {
            document.getElementById('rsiChart').style.display = e.target.checked ? 'block' : 'none';
        });

        // Торговые кнопки
        document.getElementById('buy-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('BUY', asset);
        });

        document.getElementById('sell-btn').addEventListener('click', () => {
            const asset = document.getElementById('asset-select').value;
            this.executeTrade('SELL', asset);
        });
    }

    executeTrade(action, asset) {
        const amount = parseFloat(document.getElementById('trade-amount').value);
        const price = this.state.prices[asset] || this.state.candles.slice(-1)[0].close;

        // ... (остальная логика торговли)
    }

    updateUI() {
        // ... (обновление интерфейса)
    }
}

document.addEventListener('DOMContentLoaded', () => new TradingApp());
