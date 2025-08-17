class TradingApp {
    constructor() {
        this.state = {
            balance: 10000,
            portfolio: { BTC: 0, ETH: 0 },
            prices: { BTC: 0, ETH: 0 },
            prevPrices: { BTC: 0, ETH: 0 },
            history: [],
            chart: null,
            socket: null,
            currentSymbol: 'BTCUSDT'
        };
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadPrices();
        await this.initChart();
        this.connectWebSocket();
        this.updateUI();
    }

    async fetchWithProxy(url) {
        try {
            // Альтернативный прокси, если cors-anywhere не работает
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            return await response.json();
        } catch (error) {
            console.error("Ошибка прокси:", error);
            throw error;
        }
    }

    async loadPrices() {
        try {
            const btcData = await this.fetchWithProxy('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
            const ethData = await this.fetchWithProxy('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
            
            this.state.prices.BTC = parseFloat(btcData.price);
            this.state.prices.ETH = parseFloat(ethData.price);
            this.state.prevPrices = { ...this.state.prices };
        } catch (error) {
            console.error("Ошибка загрузки цен:", error);
            // Запасные значения
            this.state.prices = { BTC: 50000, ETH: 3000 };
        }
    }

    async initChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        const loader = document.getElementById('chartLoader');
        
        try {
            const data = await this.fetchChartData();
            
            this.state.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: `${this.state.currentSymbol} Цена`,
                        data: data.prices,
                        borderColor: '#f7931a',
                        backgroundColor: 'rgba(247, 147, 26, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `Цена: ${ctx.parsed.y.toFixed(2)} USDT`
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: { grid: { color: 'rgba(255,255,255,0.1)' } }
                    }
                }
            });
            
            loader.style.display = 'none';
        } catch (error) {
            console.error("Ошибка графика:", error);
            loader.textContent = "Данные загружены (режим демо)";
            // Запасные данные для демо
            this.initDemoChart(ctx);
        }
    }

    initDemoChart(ctx) {
        const now = new Date();
        const demoData = {
            labels: Array.from({ length: 24 }, (_, i) => {
                const d = new Date(now);
                d.setHours(d.getHours() - 24 + i);
                return d.toLocaleTimeString();
            }),
            prices: Array.from({ length: 24 }, (_, i) => 
                50000 * (1 + Math.sin(i/3) * 0.02 + (Math.random() - 0.5) * 0.01)
        };

        this.state.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: demoData.labels,
                datasets: [{
                    label: `${this.state.currentSymbol} (демо)`,
                    data: demoData.prices,
                    borderColor: '#f7931a',
                    borderWidth: 2
                }]
            }
        });
    }

    async fetchChartData() {
        try {
            const data = await this.fetchWithProxy(
                `https://api.binance.com/api/v3/klines?symbol=${this.state.currentSymbol}&interval=1h&limit=24`
            );
            return {
                labels: data.map(item => new Date(item[0]).toLocaleTimeString()),
                prices: data.map(item => parseFloat(item[4]))
            };
        } catch (error) {
            throw new Error("Не удалось загрузить график");
        }
    }

    connectWebSocket() {
        if (this.state.socket) this.state.socket.close();
        
        this.state.socket = new WebSocket(
            `wss://stream.binance.com:9443/ws/${this.state.currentSymbol.toLowerCase()}@ticker`
        );

        this.state.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const asset = this.state.currentSymbol.includes('BTC') ? 'BTC' : 'ETH';
            const newPrice = parseFloat(data.c);
            
            this.state.prevPrices[asset] = this.state.prices[asset];
            this.state.prices[asset] = newPrice;
            this.updatePriceChange();
            this.updateUI();
        };
    }

    updatePriceChange() {
        const asset = document.getElementById('asset-select').value;
        const priceChangeElement = document.getElementById('price-change');
        
        if (this.state.prevPrices[asset] === 0) return;
        
        const change = ((this.state.prices[asset] - this.state.prevPrices[asset]) / this.state.prevPrices[asset]) * 100;
        priceChangeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        priceChangeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    executeTrade(action, asset) {
        const amount = parseFloat(document.getElementById('trade-amount').value);
        if (isNaN(amount) {
            this.showAlert('Введите корректную сумму!');
            return;
        }

        const price = this.state.prices[asset];
        if (action === 'BUY') {
            const cost = amount;
            if (cost > this.state.balance) {
                this.showAlert('Недостаточно средств!');
                return;
            }
            this.state.balance -= cost;
            this.state.portfolio[asset] += amount / price;
            this.showAlert(`Куплено ${(amount / price).toFixed(6)} ${asset}`);
        } else {
            const assetAmount = amount;
            if (assetAmount > this.state.portfolio[asset]) {
                this.showAlert(`Недостаточно ${asset} для продажи!`);
                return;
            }
            this.state.balance += assetAmount * price;
            this.state.portfolio[asset] -= assetAmount;
            this.showAlert(`Продано ${assetAmount.toFixed(6)} ${asset}`);
        }

        this.state.history.push({
            type: action,
            asset,
            amount,
            price,
            timestamp: new Date().toLocaleString()
        });
        this.updateUI();
    }

    updateUI() {
        document.getElementById('balance').textContent = this.state.balance.toFixed(2) + ' USDT';
        const asset = document.getElementById('asset-select').value;
        document.getElementById('current-price').textContent = this.state.prices[asset].toFixed(2);
        document.getElementById('btc-amount').textContent = this.state.portfolio.BTC.toFixed(6);
        document.getElementById('eth-amount').textContent = this.state.portfolio.ETH.toFixed(6);
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
                    <span>${trade.type === 'BUY' 
                        ? `${(trade.amount / trade.price).toFixed(6)} ${trade.asset}` 
                        : `${trade.amount.toFixed(6)} ${trade.asset}`} 
                    по ${trade.price.toFixed(2)}</span>
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
        setTimeout(() => alert.remove(), 3000);
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
            this.state.currentSymbol = `${document.getElementById('asset-select').value}USDT`;
            this.state.chart.destroy();
            this.initChart();
            this.connectWebSocket();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
