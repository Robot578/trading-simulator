// Add this teacher functionality to your existing TradingApp class

class TradingTeacher {
    constructor(app) {
        this.app = app;
        this.lessons = [
            {
                id: 'basics',
                title: 'Основы трейдинга',
                completed: false,
                content: `
                    <h4>Основы трейдинга</h4>
                    <p>Трейдинг - это покупка и продажа активов с целью получения прибыли. Основные понятия:</p>
                    <ul>
                        <li><strong>Long (покупка)</strong> - вы покупаете актив, ожидая роста его цены</li>
                        <li><strong>Short (продажа)</strong> - вы продаете актив, ожидая падения его цены</li>
                        <li><strong>Волатильность</strong> - степень изменения цены актива</li>
                        <li><strong>Ликвидность</strong> - возможность быстро купить или продать актив</li>
                    </ul>
                    <div class="teacher-tip">
                        <strong>Совет:</strong> Начинайте с небольших сумм и никогда не рискуйте больше, чем можете позволить себе потерять.
                    </div>
                `
            },
            {
                id: 'chart-reading',
                title: 'Чтение графиков',
                completed: false,
                content: `
                    <h4>Как читать свечные графики</h4>
                    <p>Японские свечи - самый популярный тип графиков в трейдинге. Каждая свеча показывает:</p>
                    <ul>
                        <li><strong>Тело свечи</strong> - разница между ценой открытия и закрытия</li>
                        <li><strong>Зеленое тело</strong> - цена закрытия выше цены открытия (рост)</li>
                        <li><strong>Красное тело</strong> - цена закрытия ниже цены открытия (падение)</li>
                        <li><strong>Тени (фитили)</strong> - максимальная и минимальная цена за период</li>
                    </ul>
                    <div class="teacher-quiz">
                        <p>Если свеча зеленая, это означает что:</p>
                        <div class="quiz-options">
                            <div class="quiz-option" data-correct="true">Цена закрытия выше цены открытия</div>
                            <div class="quiz-option" data-correct="false">Цена закрытия ниже цены открытия</div>
                            <div class="quiz-option" data-correct="false">Цена не изменилась</div>
                        </div>
                    </div>
                `
            },
            {
                id: 'indicators',
                title: 'Технические индикаторы',
                completed: false,
                content: `
                    <h4>Технические индикаторы</h4>
                    <p>Индикаторы помогают анализировать рынок и находить точки для входа в сделку.</p>
                    
                    <p><strong>SMA (Простая скользящая средняя)</strong> - показывает среднюю цену за определенный период. 
                    Помогает определить тренд и потенциальные уровни поддержки/сопротивления.</p>
                    
                    <p><strong>EMA (Экспоненциальная скользящая средняя)</strong> - похожа на SMA, но больше веса придает 
                    последним ценам, поэтому быстрее реагирует на изменения.</p>
                    
                    <div class="teacher-tip">
                        <strong>Совет:</strong> Используйте несколько индикаторов для подтверждения сигналов, 
                        но не перегружайте график - это может привести к путанице.
                    </div>
                `
            },
            {
                id: 'risk-management',
                title: 'Управление рисками',
                completed: false,
                content: `
                    <h4>Управление рисками</h4>
                    <p>Это самый важный аспект трейдинга! Правила управления рисками:</p>
                    <ol>
                        <li>Рискуйте не более 1-2% от депозита на одну сделку</li>
                        <li>Всегда устанавливайте стоп-лосс (ордер на ограничение убытков)</li>
                        <li>Соотношение прибыли к убыткам должно быть не менее 1:2</li>
                        <li>Диверсифицируйте портфель</li>
                    </ol>
                    <div class="teacher-quiz">
                        <p>Какой максимальный процент депозита рекомендуется рисковать в одной сделке?</p>
                        <div class="quiz-options">
                            <div class="quiz-option" data-correct="false">10%</div>
                            <div class="quiz-option" data-correct="true">1-2%</div>
                            <div class="quiz-option" data-correct="false">5%</div>
                        </div>
                    </div>
                `
            },
            {
                id: 'psychology',
                title: 'Психология трейдинга',
                completed: false,
                content: `
                    <h4>Психология трейдинга</h4>
                    <p>Эмоции - главный враг трейдера. Основные психологические ловушки:</p>
                    <ul>
                        <li><strong>Жадность</strong> - удерживание позиции слишком долго в надежде на большую прибыль</li>
                        <li><strong>Страх</strong> - преждевременное закрытие прибыльной позиции</li>
                        <li><strong>Месть</strong> - попытка сразу отыграться после убыточной сделки</li>
                        <li><strong>Надежда</strong> - удерживание убыточной позиции в надежде на разворот</li>
                    </ul>
                    <div class="teacher-tip">
                        <strong>Совет:</strong> Создайте торговый план и строго следуйте ему. 
                        Торгуйте на основе анализа, а не эмоций.
                    </div>
                `
            }
        ];

        this.concepts = {
            sma: "SMA (Simple Moving Average) - простая скользящая средняя. Показывает среднюю цену актива за определенный период. Используется для определения тренда и потенциальных уровней поддержки/сопротивления.",
            ema: "EMA (Exponential Moving Average) - экспоненциальная скользящая средняя. Похожа на SMA, но больше веса придает последним ценам, поэтому быстрее реагирует на изменения цены.",
            long: "LONG (лонг) - позиция на покупку актива в ожидании роста его цены. Вы зарабатываете, когда цена актива увеличивается.",
            short: "SHORT (шорт) - позиция на продажу актива в ожидании падения его цены. Вы зарабатываете, когда цена актива уменьшается."
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderLessons();
        this.showContextHint('welcome');
    }

    setupEventListeners() {
        document.getElementById('teacher-btn').addEventListener('click', () => {
            document.getElementById('teacher-panel').classList.toggle('active');
        });

        document.getElementById('close-teacher').addEventListener('click', () => {
            document.getElementById('teacher-panel').classList.remove('active');
        });

        document.getElementById('hint-close').addEventListener('click', () => {
            document.getElementById('teacher-hint').style.display = 'none';
        });

        // Info buttons for concepts
        document.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const concept = e.target.dataset.concept;
                this.showConceptExplanation(concept, e.target);
            });
        });
    }

    renderLessons() {
        const lessonsContainer = document.getElementById('lessons-list');
        lessonsContainer.innerHTML = '';
        
        this.lessons.forEach(lesson => {
            const lessonElement = document.createElement('div');
            lessonElement.className = `lesson-item ${lesson.completed ? 'completed' : ''}`;
            lessonElement.dataset.id = lesson.id;
            lessonElement.innerHTML = lesson.title;
            lessonElement.addEventListener('click', () => this.showLesson(lesson.id));
            lessonsContainer.appendChild(lessonElement);
        });
    }

    showLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        
        const lessonContainer = document.getElementById('current-lesson');
        lessonContainer.innerHTML = `<div class="lesson-content">${lesson.content}</div>`;
        
        // Add event listeners for quiz options
        lessonContainer.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const isCorrect = e.target.dataset.correct === 'true';
                e.target.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                if (isCorrect) {
                    lesson.completed = true;
                    this.renderLessons();
                    setTimeout(() => {
                        this.showContextHint('lesson_completed');
                    }, 1000);
                }
            });
        });
        
        // Update active lesson
        document.querySelectorAll('.lesson-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.lesson-item[data-id="${lessonId}"]`).classList.add('active');
    }

    showContextHint(context) {
        const hintElement = document.getElementById('teacher-hint');
        const hintText = document.getElementById('hint-text');
        
        const hints = {
            welcome: "Добро пожаловать! Нажмите на кнопку 'Учитель' для начала обучения.",
            first_trade: "Отлично! Вы совершили первую сделку. Изучите урок 'Управление рисками'.",
            lesson_completed: "Поздравляем! Вы завершили урок. Переходите к следующему!",
            big_loss: "Кажется, вы понесли большие убытки. Изучите урок 'Управление рисками'.",
            big_profit: "Отличная прибыль! Не забывайте о правилах управления рисками."
        };
        
        hintText.textContent = hints[context] || "Воспользуйтесь учебными материалами для улучшения навыков!";
        hintElement.style.display = 'flex';
        
        setTimeout(() => {
            hintElement.style.display = 'none';
        }, 5000);
    }

    showConceptExplanation(concept, targetElement) {
        // Remove any existing explanation
        const existingExplanation = document.querySelector('.concept-explanation');
        if (existingExplanation) {
            existingExplanation.remove();
        }
        
        const explanation = document.createElement('div');
        explanation.className = 'concept-explanation';
        explanation.innerHTML = `<p>${this.concepts[concept]}</p>`;
        
        document.body.appendChild(explanation);
        
        // Position near the button
        const rect = targetElement.getBoundingClientRect();
        explanation.style.top = `${rect.bottom + window.scrollY}px`;
        explanation.style.left = `${rect.left + window.scrollX}px`;
        explanation.classList.add('visible');
        
        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeExplanation(e) {
                if (!explanation.contains(e.target) && e.target !== targetElement) {
                    explanation.remove();
                    document.removeEventListener('click', closeExplanation);
                }
            });
        }, 100);
    }

    trackUserAction(action, data) {
        switch(action) {
            case 'trade':
                if (data.amount > this.app.state.balance * 0.1) {
                    this.showContextHint('big_loss');
                }
                break;
            case 'profit':
                if (data.profit > this.app.state.balance * 0.2) {
                    this.showContextHint('big_profit');
                }
                break;
            case 'loss':
                if (data.loss > this.app.state.balance * 0.15) {
                    this.showContextHint('big_loss');
                }
                break;
        }
    }
}

// Modify the TradingApp class to integrate the teacher
class TradingApp {
    constructor() {
        // ... existing code ...
        
        this.teacher = new TradingTeacher(this);
        
        // ... rest of existing code ...
    }

    // Modify executeTrade method to track user actions
    executeTrade(action, asset, isMaxTrade = false) {
        // ... existing code ...
        
        // Track the trade for educational purposes
        this.teacher.trackUserAction('trade', {
            amount: amount,
            asset: asset,
            type: action
        });
        
        // ... rest of existing code ...
    }

    // ... rest of existing code ...
}
