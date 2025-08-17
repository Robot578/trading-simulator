class TradingApp {
    constructor() {
        this.state = {
            balance: 10000,
            portfolio: { BTC: 0, ETH: 0, SOL: 0 },
            prices: { BTC: 0, ETH: 0, SOL: 0 },
            history: [],
            chart: null,
            socket: null,
            lastUpdate: null
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.initChart();
        this.connectWebSocket();
        this.updateUI();
    }

    async initChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        const loader = document.getElementById('chartLoader');
        
        this.state.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Цена',
                    data: [],
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247, 147, 26, 0.1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
        
        loader.style.display = 'none';
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

            // Обновляем график (макс. 30 точек)
            if (Date.now() - this.state.lastUpdate > 1000) {
                this.state.chart.data.labels.push(new Date().toLocaleTimeString());
                this.state.chart.data.datasets[0].data.push(price);
                if (this.state.chart.data.datasets[0].data.length > 30) {
                    this.state.chart.data.labels.shift();
                    this.state.chart.data.datasets[0].data.shift();
                }
                this.state.chart.update();
                this.state.lastUpdate = Date.now();
            }
        };

        this.state.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
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
            this.connectWebSocket();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new TradingApp());
