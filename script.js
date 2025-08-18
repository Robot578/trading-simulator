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
            candles: []
        };

        this.init();
    }

    async init() {
        this.initChart();
        this.setupEventListeners();
        this.loadInitialData();
        this.updateUI();
    }

    initChart() {
        const chartContainer = document.getElementById('candleChart');
        chartContainer.innerHTML = '';

        this.state.chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 400,
            layout: {
                backgroundColor: '#1e293b',
                textColor: '#e2e8f0'
            },
            grid: {
                vertLines: { color: '#334155' },
                horzLines: { color: '#334155' }
            },
            timeScale: {
                timeVisible: true,
                borderColor: '#334155'
            }
        });

        this.state.candleSeries = this.state.chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#10b981',
            wickDownColor: '#ef4444',
            wickUpColor: '#10b981'
        });

        document.getElementById('chartLoader').style.display = 'none';
    }

    async loadInitialData() {
        const asset = document.getElementById('asset-select').value;
        await this.fetchCandles(asset);
        this.connectWebSocket();
    }

    async fetchCandles(asset) {
        const symbol = `${asset}USDT`;
        
        try {
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
            this.state.prices[asset] = parseFloat(data[data.length - 1][4]);
            this.updateUI();
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }
    }

    connectWebSocket() {
        if (this.state.socket) this.state.socket.close();

        const asset = document.getElementById('asset-select').value;
        const symbol = `${asset}USDT`.toLowerCase();

        this.state.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);

        this.state.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.c);
            const change = parseFloat(data.P);

            this.state.prices[asset] = price;
            
            document.getElementById('current-price').textContent = price.toFixed(2);
            document.getElementById('price-change').textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
            document.getElementById('price-change').style.color = change >= 0 ? '#10b981' : '#ef4444';
        };
    }

    executeTrade(action, asset) {
        const amount = parseFloat(document.getElementById('trade-amount').value);
        if (isNaN(amount) || amount <= 0) {
            this.showAlert('Введите корректную сумму!');
            return;
        }

        const price = this.state.prices[asset];
        let message = '';

        if (action === 'BUY') {
            const amountBought = amount / price;
            if (amount > this.state.balance) {
                this.showAlert('Недостаточно средств!');
                return;
            }
            this.state.balance -= amount;
            this.state.portfolio[asset] += amountBought;
            message = `Куплено ${amountBought.toFixed(6)} ${asset} за ${amount.toFixed(2)} USDT`;
        } else {
            if (this.state.portfolio[asset] <= 0) {
                this.showAlert(`Недостаточно ${asset} для продажи!`);
                return;
            }
            const total = amount * price;
            this.state.balance += total;
            this.state.portfolio[asset] -= amount;
            message = `Продано ${amount.toFixed(6)} ${asset} за ${total.toFixed(2)} USDT`;
        }

        this.state.history.push({
            type: action,
            asset,
            amount,
            price,
            total: amount * price,
            timestamp: new Date().toLocaleString()
        });

        this.showAlert(message);
        this.updateUI();
    }

    updateUI() {
        document.getElementById('balance').textContent = this.state.balance.toFixed(2) + ' USDT';
        document.getElementById('btc-amount').textContent = this.state.portfolio.BTC.toFixed(6);
        document.getElementById('eth-amount').textContent = this.state.portfolio.ETH.toFixed(6);
        document.getElementById('sol-amount').textContent = this.state.portfolio.SOL.toFixed(6);
        this.updateHistory();
    }

    updateHistory() {
        const container = document.getElementById('history-items');
        container.innerHTML = '';
        
        this.state.history.slice().reverse().forEach(trade => {
            const item = document.createElement('div');
            item.className = `history-item ${trade.type.toLowerCase()}`;
            item.innerHTML = `
                <div class="trade-type">${trade.type === 'BUY' ? '🟢 Куплено' : '🔴 Продано'} ${trade.asset}</div>
                <div class="trade-details">
                    <span>${trade.amount.toFixed(6)} по ${trade.price.toFixed(2)} USDT</span>
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
            alert.remove();
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
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
