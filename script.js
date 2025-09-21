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
let notifications = [];
let achievements = [
    { id: 'first_trade', title: 'Первая сделка', desc: 'Совершите первую торговую операцию', unlocked: false, icon: '🎯' },
    { id: 'profit_10', title: 'Профит +10%', desc: 'Достигните прибыли +10%', unlocked: false, icon: '💰' },
    { id: 'risk_manager', title: 'Управление рисками', desc: 'Используйте стоп-лосс в 5 сделках', unlocked: false, icon: '🛡️' },
    { id: 'diversification', title: 'Диверсификация', desc: 'Торгуйте всеми тремя активами', unlocked: false, icon: '📊' }
];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadChartData();
    updateUI();
    checkAchievements();
});

// Инициализация приложения
function initializeApp() {
    // Загрузка данных из localStorage
    loadFromLocalStorage();
    
    // Инициализация графика
    initializeChart();
    
    // Обновление UI
    updateUI();
    
    // Запуск симуляции цены
    startPriceSimulation();
}

// Запуск симуляции изменения цены в реальном времени
function startPriceSimulation() {
    setInterval(() => {
        if (currentData.length > 0) {
            const lastBar = currentData[currentData.length - 1];
            const newPrice = lastBar.close * (1 + (Math.random() - 0.5) * 0.002);
            
            // Обновляем последнюю свечу
            const newBar = {
                time: Math.floor(Date.now() / 1000),
                open: lastBar.close,
                high: Math.max(lastBar.close, newPrice) * (1 + Math.random() * 0.001),
                low: Math.min(lastBar.close, newPrice) * (1 - Math.random() * 0.001),
                close: newPrice
            };
            
            candleSeries.update(newBar);
            currentData[currentData.length - 1] = newBar;
            
            // Обновляем текущую цену
            updateCurrentPrice(newBar);
            
            // Проверяем ордера
            checkOrders(newBar.close);
        }
    }, 5000); // Обновление каждые 5 секунд
}

// Проверка срабатывания ордеров
function checkOrders(currentPrice) {
    for (let i = activeOrders.length - 1; i >= 0; i--) {
        const order = activeOrders[i];
        let shouldExecute = false;
        
        if (order.type === 'STOP' && order.price >= currentPrice) {
            shouldExecute = true;
        } else if (order.type === 'TAKE_PROFIT' && order.price <= currentPrice) {
            shouldExecute = true;
        }
        
        if (shouldExecute) {
            executeOrder(order, i);
        }
    }
}

// Выполнение ордера
function executeOrder(order, index) {
    const tradeAmount = order.amount * order.price;
    
    if (order.type === 'STOP') {
        // Продажа по стоп-лоссу
        if (portfolio[order.asset] >= order.amount) {
            portfolio[order.asset] -= order.amount;
            balance += tradeAmount;
            
            tradeHistory.push({
                type: 'sell',
                asset: order.asset,
                amount: order.amount,
                price: order.price,
                total: tradeAmount,
                timestamp: Date.now(),
                isOrder: true
            });
            
            addNotification(`Сработал стоп-лосс для ${order.asset} по цене ${order.price.toFixed(2)}`);
        }
    }
    
    // Удаляем ордер
    activeOrders.splice(index, 1);
    updateOrdersList();
    saveToLocalStorage();
    updateUI();
}

// Добавление уведомления
function addNotification(message, type = 'info') {
    notifications.unshift({
        id: Date.now(),
        message,
        type,
        timestamp: Date.now(),
        read: false
    });
    
    // Ограничиваем количество уведомлений
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    updateNotificationBadge();
    saveToLocalStorage();
}

// Обновление бейджа уведомлений
function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    document.getElementById('notification-count').textContent = unreadCount;
    document.getElementById('notification-count').style.display = unreadCount > 0 ? 'block' : 'none';
}

// Быстрая торговля
function quickTrade(type) {
    const amounts = [10, 25, 50, 100];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
    document.getElementById('trade-amount').value = randomAmount;
    executeTrade(type);
}

// Показать модальное окно
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Скрыть модальное окно
function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Подтверждение действия
function confirmAction(message) {
    return new Promise((resolve) => {
        document.getElementById('confirmation-message').textContent = message;
        showModal('confirmation-modal');
        
        document.querySelector('.confirm-btn').onclick = () => {
            hideModal('confirmation-modal');
            resolve(true);
        };
        
        document.querySelector('.cancel-btn').onclick = () => {
            hideModal('confirmation-modal');
            resolve(false);
        };
    });
}

// Показать уведомления
function showNotifications() {
    const container = document.getElementById('notification-list');
    if (notifications.length === 0) {
        container.innerHTML = '<div class="notification-item">Уведомлений пока нет</div>';
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.type} ${notif.read ? 'read' : 'unread'}">
            <div class="notification-message">${notif.message}</div>
            <div class="notification-time">${new Date(notif.timestamp).toLocaleTimeString()}</div>
        </div>
    `).join('');
    
    // Помечаем как прочитанные
    notifications.forEach(notif => notif.read = true);
    updateNotificationBadge();
    saveToLocalStorage();
    
    showModal('notification-modal');
}

// Проверка достижений
function checkAchievements() {
    // Первая сделка
    if (tradeHistory.length > 0 && !achievements[0].unlocked) {
        unlockAchievement(0);
    }
    
    // Прибыль +10%
    const initialBalance = 100;
    const currentBalance = balance + Object.keys(portfolio).reduce((total, asset) => {
        const currentPrice = currentData.length > 0 ? currentData[currentData.length - 1].close : 0;
        return total + (portfolio[asset] * currentPrice * getAssetMultiplier(asset));
    }, 0);
    
    if (currentBalance >= initialBalance * 1.1 && !achievements[1].unlocked) {
        unlockAchievement(1);
    }
    
    // Управление рисками (5 ордеров стоп-лосс)
    const stopOrdersCount = tradeHistory.filter(t => t.isOrder && t.type === 'sell').length;
    if (stopOrdersCount >= 5 && !achievements[2].unlocked) {
        unlockAchievement(2);
    }
    
    // Диверсификация (торговля всеми активами)
    const tradedAssets = new Set(tradeHistory.map(t => t.asset));
    if (tradedAssets.size >= 3 && !achievements[3].unlocked) {
        unlockAchievement(3);
    }
}

// Разблокировка достижения
function unlockAchievement(index) {
    achievements[index].unlocked = true;
    addNotification(`Достижение разблокировано: ${achievements[index].title}`, 'achievement');
    updateAchievementsDisplay();
    saveToLocalStorage();
}

// Обновление отображения достижений
function updateAchievementsDisplay() {
    const container = document.getElementById('achievements-container');
    container.innerHTML = achievements.map(ach => `
        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-title">${ach.title}</div>
            <div class="achievement-desc">${ach.desc}</div>
            ${ach.unlocked ? '<div class="achievement-badge">✔️</div>' : ''}
        </div>
    `).join('');
}

// Мультипликатор стоимости активов
function getAssetMultiplier(asset) {
    const multipliers = {
        'BTC': 1,
        'ETH': 0.05, // ETH примерно в 20 раз дешевле BTC
        'SOL': 0.001 // SOL примерно в 1000 раз дешевле BTC
    };
    return multipliers[asset] || 1;
}

// Анализ текущего рынка
function analyzeMarket() {
    if (currentData.length < 20) return 'Недостаточно данных для анализа';
    
    const prices = currentData.slice(-20).map(d => d.close);
    const avgPrice = prices.reduce((a, b) => a + b) / prices.length;
    const currentPrice = prices[prices.length - 1];
    const trend = currentPrice > avgPrice ? 'восходящий' : 'нисходящий';
    const volatility = (Math.max(...prices) - Math.min(...prices)) / avgPrice * 100;
    
    return `Тренд: ${trend}, Волатильность: ${volatility.toFixed(2)}%, Текущая цена: ${currentPrice.toFixed(2)}`;
}

// Обновленная функция executeTrade с улучшениями
async function executeTrade(type) {
    const amount = parseFloat(document.getElementById('trade-amount').value);
    const currentPrice = currentData[currentData.length - 1].close;
    
    if (isNaN(amount) || amount <= 0) {
        showError('Введите корректную сумму');
        return;
    }
    
    const confirmed = await confirmAction(`Вы уверены, что хотите ${type === 'buy' ? 'купить' : 'продать'} на ${amount} USDT?`);
    if (!confirmed) return;
    
    // ... остальная логика выполнения сделки
}

// Добавлены новые обработчики событий в setupEventListeners
function setupEventListeners() {
    // ... существующие обработчики
    
    // Уведомления
    document.getElementById('notifications-btn').addEventListener('click', showNotifications);
    
    // Быстрая торговля
    document.querySelectorAll('.quick-trade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const amount = e.target.dataset.amount;
            document.getElementById('trade-amount').value = amount;
        });
    });
    
    // Модальные окна
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            hideModal(e.target.closest('.modal').id);
        });
    });
    
    // Закрытие модальных окон по клику вне области
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target.id);
        }
    });
    
    // Индикаторы
    document.getElementById('bollinger-toggle').addEventListener('change', updateIndicators);
}

// Обновление индикаторов
function updateIndicators() {
    // Реализация расчета и отображения индикаторов
    if (document.getElementById('bollinger-toggle').checked) {
        addBollingerBands();
    }
}

// Добавление полос Боллинджера
function addBollingerBands() {
    // Реализация расчета полос Боллинджера
}

// Обновленная функция saveToLocalStorage
function saveToLocalStorage() {
    const data = {
        balance,
        portfolio,
        tradeHistory,
        activeOrders,
        notifications,
        achievements,
        version: '1.1'
    };
    
    localStorage.setItem('tradelearn_data', JSON.stringify(data));
}

// Обновленная функция loadFromLocalStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('tradelearn_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            balance = data.balance || balance;
            portfolio = data.portfolio || portfolio;
            tradeHistory = data.tradeHistory || tradeHistory;
            activeOrders = data.activeOrders || activeOrders;
            notifications = data.notifications || notifications;
            achievements = data.achievements || achievements;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }
}

// Глобальные функции
window.quickTrade = quickTrade;
window.showNotifications = showNotifications;
