document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const closeButtons = document.querySelectorAll('.close-section');
    
    // Показать раздел по умолчанию
    showSection('default');
    
    // Обработчик кнопки переключения боковой панели
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('expanded');
        });
    }
    
    // Обработчики для пунктов меню
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Убираем активный класс у всех пунктов меню
            menuItems.forEach(mi => mi.classList.remove('active'));
            
            // Добавляем активный класс к текущему пункту меню
            this.classList.add('active');
            
            // Показываем выбранную секцию
            showSection(sectionId);
            
            // На мобильных устройствах сворачиваем боковую панель после выбора
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('expanded');
            }
        });
    });
    
    // Обработчики для кнопок закрытия
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Скрываем все секции
            hideAllSections();
            
            // Показываем раздел по умолчанию
            showSection('default');
            
            // Убираем активный класс у всех пунктов меню
            menuItems.forEach(mi => mi.classList.remove('active'));
        });
    });
    
    // Функция показа секции
    function showSection(sectionId) {
        // Скрываем все секции
        hideAllSections();
        
        // Показываем выбранную секцию
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Прокручиваем к началу секции
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Функция скрытия всех секций
    function hideAllSections() {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
    }
    
    // Инициализация учителя
    const teacherMessage = document.getElementById('teacher-message');
    const teacherHint = document.getElementById('teacher-hint');
    const teacherAnalysis = document.getElementById('teacher-analysis');
    const teacherLesson = document.getElementById('teacher-lesson');
    
    if (teacherHint) {
        teacherHint.addEventListener('click', function() {
            showTeacherMessage("💡 Подсказка: Начинайте с небольших сумм и всегда используйте стоп-лосс для ограничения рисков. Не рискуйте более 2% от депозита в одной сделке!");
        });
    }
    
    if (teacherAnalysis) {
        teacherAnalysis.addEventListener('click', function() {
            showTeacherMessage("📊 Анализ рынка: В настоящее время наблюдается восходящий тренд. Рекомендуется искать возможности для покупки на коррекциях. Обратите внимание на уровни поддержки и сопротивления.");
        });
    }
    
    if (teacherLesson) {
        teacherLesson.addEventListener('click', function() {
            showTeacherMessage("📚 Урок: Управление капиталом - ключевой навык успешного трейдера. Всегда определяйте размер позиции до входа в сделку и устанавливайте стоп-лосс. Помните: сохранить капитал важнее, чем его приумножить!");
        });
    }
    
    function showTeacherMessage(message) {
        if (teacherMessage) {
            teacherMessage.textContent = message;
            
            // Анимация появления сообщения
            teacherMessage.style.opacity = '0';
            teacherMessage.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                teacherMessage.style.opacity = '1';
            }, 10);
        }
    }
    
    // Инициализация калькулятора риска
    const calculateRiskBtn = document.getElementById('calculate-risk');
    const riskVolume = document.getElementById('risk-volume');
    const riskAmount = document.getElementById('risk-amount');
    
    if (calculateRiskBtn) {
        calculateRiskBtn.addEventListener('click', function() {
            const deposit = parseFloat(document.getElementById('risk-deposit').value) || 100;
            const riskPercent = parseFloat(document.getElementById('risk-percent').value) || 2;
            
            const riskUsdt = deposit * (riskPercent / 100);
            const simulatedPrice = 50000; // Пример цены актива
            
            // Расчет объема
            const volume = riskUsdt / simulatedPrice;
            
            // Обновление интерфейса
            if (riskVolume) riskVolume.textContent = volume.toFixed(6);
            if (riskAmount) riskAmount.textContent = riskUsdt.toFixed(2) + ' USDT';
            
            // Показать объяснение
            showTeacherMessage(`📊 Расчет позиции: При депозите ${deposit} USDT и риске ${riskPercent}% вы можете рискнуть ${riskUsdt.toFixed(2)} USDT. Это соответствует объему ${volume.toFixed(6)} BTC при цене ${simulatedPrice.toLocaleString()} USDT.`);
        });
    }
    
    // Имитация данных портфеля
    const btcAmount = document.getElementById('btc-amount');
    const ethAmount = document.getElementById('eth-amount');
    const solAmount = document.getElementById('sol-amount');
    const totalValue = document.getElementById('total-value');
    
    // Функция обновления данных портфеля
    function updatePortfolio() {
        if (btcAmount) btcAmount.textContent = '0.002500';
        if (ethAmount) ethAmount.textContent = '0.035000';
        if (solAmount) solAmount.textContent = '0.500000';
        if (totalValue) totalValue.textContent = '157.50 USDT';
    }
    
    // Вызываем обновление портфеля при загрузке
    updatePortfolio();
    
    // Адаптация для мобильных устройств
    function handleMobileView() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('expanded');
        } else {
            sidebar.classList.add('expanded');
        }
    }
    
    // Слушатель изменения размера окна
    window.addEventListener('resize', handleMobileView);
    
    // Инициализация при загрузке
    handleMobileView();
    
    // Добавляем обработчики для кнопок управления данными
    const dataButtons = document.querySelectorAll('.data-content .action-btn');
    dataButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            
            if (buttonText.includes('Экспорт')) {
                showTeacherMessage('💾 Данные успешно экспортированы! Вы можете сохранить файл на свое устройство.');
            } else if (buttonText.includes('Импорт')) {
                showTeacherMessage('💾 Для импорта данных выберите файл с ранее экспортированными данными.');
            } else if (buttonText.includes('Сбросить')) {
                if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
                    showTeacherMessage('🔄 Все данные были сброшены. Начинаем с чистого листа!');
                    updatePortfolio();
                }
            }
        });
    });
    
    // Добавляем функциональность для журнала трейдера
    const journalStats = document.querySelectorAll('.journal-stat .stat-value');
    
    // Имитация данных для журнала
    function updateJournalStats() {
        if (journalStats.length >= 4) {
            journalStats[0].textContent = '12';
            journalStats[1].textContent = '58%';
            journalStats[2].textContent = '24.50';
            journalStats[3].textContent = '15.75';
        }
    }
    
    // Обновляем статистику журнала
    updateJournalStats();
    
    // Добавляем функциональность для достижений
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    // Разблокируем первое достижение
    if (achievementCards.length > 0) {
        achievementCards[0].classList.remove('locked');
    }
    
    // Добавляем обработчики для достижений
    achievementCards.forEach(card => {
        card.addEventListener('click', function() {
            if (this.classList.contains('locked')) {
                showTeacherMessage('🔒 Это достижение еще не разблокировано. Продолжайте учиться и торговать, чтобы открыть его!');
            } else {
                const title = this.querySelector('.achievement-title').textContent;
                showTeacherMessage(`🏆 Достижение "${title}" разблокировано! Так держать!`);
            }
        });
    });
    
    // Добавляем функциональность для истории сделок
    const historyList = document.querySelector('.history-list');
    
    // Имитация данных истории сделок
    function updateHistory() {
        if (historyList) {
            historyList.innerHTML = `
                <div class="history-item">
                    <div class="history-type">Покупка</div>
                    <div class="history-details">0.0025 BTC по $50,000</div>
                    <div class="history-time">Сегодня, 14:30</div>
                </div>
                <div class="history-item">
                    <div class="history-type">Продажа</div>
                    <div class="history-details">0.5 SOL по $95</div>
                    <div class="history-time">Вчера, 11:45</div>
                </div>
                <div class="history-item">
                    <div class="history-type">Покупка</div>
                    <div class="history-details">0.035 ETH по $2,800</div>
                    <div class="history-time">3 дня назад</div>
                </div>
            `;
        }
    }
    
    // Обновляем историю сделок
    updateHistory();
});
