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

    async loadPrices() {
        try {
            const btcResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
            const ethResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
            
            const btcData = await btcResponse.json();
            const ethData = await ethResponse.json();
            
            this.state.prices.BTC = parseFloat(btcData.price);
            this.state.prices.ETH = parseFloat(ethData.price);
        } catch (error) {
            console.error("Ошибка загрузки цен:", error);
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
                options: this.getChartOptions()
            });
            
            loader.style.display = 'none';
        } catch (error) {
            console.error("Ошибка графика:", error);
            loader.textContent = "Ошибка загрузки данных";
        }
    }

    async fetchChartData() {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${this.state.currentSymbol}&interval=1h&limit=24`);
            const data = await response.json();
            
            return {
                labels: data.map(item => new Date(item[0]).toLocaleTimeString()),
                prices: data.map(item => parseFloat(item[4]))
            };
        } catch (error) {
            throw new Error("Не удалось загрузить данные");
        }
    }

    connectWebSocket() {
        if (this.state.socket) {
            this.state.socket.close();
        }
        
        this.state.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${this.state.currentSymbol.toLowerCase()}@ticker`);
        
        this.state.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const asset = this.state.currentSymbol.includes('BTC') ? 'BTC' : 'ETH';
            const newPrice = parseFloat(data.c);
            
            this.state.prevPrices[asset] = this.state.prices[asset];
            this.state.prices[asset] = newPrice;
            
            this.updatePriceChange();
            this.updateUI();
            
            // Обновляем график каждые 10 секунд
            if (Date.now() % 10 === 0) {
                this.updateChart();
            }
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

    async updateChart() {
        if (!this.state.chart) return;
        
        try {
            const data = await this.fetchChartData();
            this.state.chart.data.labels = data.labels;
            this.state.chart.data.datasets[0].data = data.prices;
            this.state.chart.update();
        } catch (error) {
            console.error("Ошибка обновления графика:", error);
        }
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
            total: action === 'BUY' ? amount : amount * price,
            timestamp: new Date().toLocaleString()
        });

        this.showAlert(message);
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
                    <span>${trade.amount.toFixed(6)} ${trade.asset} по ${trade.price.toFixed(2)}</span>
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
        
        document.getElementById('asset-select').addEventListener('change', async () => {
            const asset = document.getElementById('asset-select').value;
            this.state.currentSymbol = `${asset}USDT`;
            await this.updateChart();
            this.connectWebSocket();
            this.updateUI();
        });
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new TradingApp();
});
