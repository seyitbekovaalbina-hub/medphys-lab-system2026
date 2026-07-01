// ===== ДАННЫЕ И ПЕРЕМЕННЫЕ =====
let currentUser = null;
let userDatabase = [];
let labDatabase = [];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Загрузить данные из localStorage
    const savedUsers = localStorage.getItem('medphysUsers');
    if (savedUsers) {
        userDatabase = JSON.parse(savedUsers);
    } else {
        // Демо пользователи
        userDatabase = [
            {
                id: 1,
                name: 'Иван Петров',
                email: 'ivan@example.com',
                password: 'demo',
                role: 'student',
                group: 'ИСТ-2022'
            },
            {
                id: 2,
                name: 'Др. Александр Смирнов',
                email: 'profesor@example.com',
                password: 'demo',
                role: 'teacher',
                group: 'Техническая физика'
            }
        ];
        localStorage.setItem('medphysUsers', JSON.stringify(userDatabase));
    }

    // Загрузить данные лабораторий
    const savedLabs = localStorage.getItem('medphysLabs');
    if (savedLabs) {
        labDatabase = JSON.parse(savedLabs);
    } else {
        labDatabase = [
            {
                id: 1,
                title: 'Дозиметрия рентгеновского излучения',
                status: 'completed',
                grade: 5.0,
                date: '15.01.2026',
                hours: 8
            },
            {
                id: 2,
                title: 'Радиационная безопасность МРТ',
                status: 'in-progress',
                grade: null,
                date: '22.01.2026',
                hours: 6
            },
            {
                id: 3,
                title: 'Измерение активности изотопов',
                status: 'pending',
                grade: null,
                date: '01.02.2026',
                hours: 0
            }
        ];
        localStorage.setItem('medphysLabs', JSON.stringify(labDatabase));
    }
}

function setupEventListeners() {
    // Нажатия на клавиши
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeCalculator();
        }
    });
}

// ===== АВТОРИЗАЦИЯ =====
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.querySelector('.tab-btn:first-child').classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
        document.querySelector('.tab-btn:last-child').classList.add('active');
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    // Валидация
    if (!email || !password || !role) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }

    // Поиск пользователя
    const user = userDatabase.find(u => 
        u.email === email && u.password === password && u.role === role
    );

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAuthScreen(false);
        loadUserData();
        showNotification(`Добро пожаловать, ${user.name}!`, 'success');
    } else {
        showNotification('Неверный email, пароль или роль', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    const group = document.getElementById('registerGroup').value;

    // Валидация
    if (!name || !email || !password || !role || !group) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }

    // Проверка, есть ли уже такой email
    if (userDatabase.find(u => u.email === email)) {
        showNotification('Пользователь с таким email уже существует', 'error');
        return;
    }

    // Создание новго пользователя
    const newUser = {
        id: userDatabase.length + 1,
        name: name,
        email: email,
        password: password,
        role: role,
        group: group
    };

    userDatabase.push(newUser);
    localStorage.setItem('medphysUsers', JSON.stringify(userDatabase));

    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showAuthScreen(false);
    loadUserData();
    showNotification(`Добро пожаловать, ${name}!`, 'success');
}

function handleLogout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showAuthScreen(true);
        document.getElementById('loginForm').classList.add('active');
        showNotification('Вы вышли из системы', 'info');
    }
}

function showAuthScreen(show) {
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');

    if (show) {
        authScreen.style.display = 'flex';
        mainApp.classList.add('app-hidden');
    } else {
        authScreen.style.display = 'none';
        mainApp.classList.remove('app-hidden');
    }
}

function loadUserData() {
    if (!currentUser) return;

    // Обновить приветствие
    const roleText = currentUser.role === 'student' ? 'Студент' : 'Преподаватель';
    document.getElementById('userGreeting').textContent = `Привет, ${currentUser.name}!`;
    document.getElementById('userRole').textContent = roleText;

    // Загрузить данные панели
    updateDashboard();
}

function updateDashboard() {
    const completed = labDatabase.filter(l => l.status === 'completed').length;
    const inProgress = labDatabase.filter(l => l.status === 'in-progress').length;
    const total = labDatabase.length;
    
    const grades = labDatabase
        .filter(l => l.grade !== null)
        .map(l => l.grade);
    const avgGrade = grades.length > 0 
        ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1)
        : 0;

    const totalHours = labDatabase.reduce((sum, l) => sum + l.hours, 0);

    document.getElementById('completedLabs').textContent = completed;
    document.getElementById('inProgressLabs').textContent = inProgress;
    document.getElementById('avgGrade').textContent = avgGrade;
    document.getElementById('totalHours').textContent = totalHours;

    // Обновить журнал
    updateJournal();
    
    // Отобразить графики
    setTimeout(() => {
        renderCharts();
    }, 100);
}

// ===== НАВИГАЦИЯ =====
function showSection(sectionId) {
    // Скрыть все секции
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Обновить активный пункт меню
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Показать нужную секцию
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Найти и активировать соответствующий пункт меню
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (item.textContent.toLowerCase().includes(sectionId)) {
            item.classList.add('active');
        }
    });

    // Адаптивные действия
    if (window.innerWidth <= 768) {
        // На мобильных можно скрыть меню
    }
}

// ===== КАЛЬКУЛЯТОРЫ =====
function openCalculator(type) {
    const modal = document.getElementById('calculatorModal');
    const content = document.getElementById('calculatorContent');

    let html = '';

    switch(type) {
        case 'dose':
            html = `
                <h3>☢️ Калькулятор дозы облучения</h3>
                <div class="calculator-form">
                    <div class="calc-input-group">
                        <label>Мощность дозы (мкЗв/ч)</label>
                        <input type="number" id="dosePower" placeholder="Например: 2.5" step="0.01">
                    </div>
                    <div class="calc-input-group">
                        <label>Время облучения (часы)</label>
                        <input type="number" id="doseTime" placeholder="Например: 1" step="0.1">
                    </div>
                    <button class="calc-btn" onclick="calculateDose()">Рассчитать</button>
                    <div id="doseResult" style="display:none;">
                        <div class="calc-result">
                            <h4>Результат</h4>
                            <p>Поглощённая доза: <span id="doseValue">0</span> мЗв</p>
                            <p style="font-size: 12px; margin-top: 10px;">Формула: D = P × t</p>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'attenuation':
            html = `
                <h3>📉 Закон ослабления излучения</h3>
                <div class="calculator-form">
                    <div class="calc-input-group">
                        <label>Начальная интенсивность (I₀)</label>
                        <input type="number" id="I0" placeholder="Например: 1000" step="1">
                    </div>
                    <div class="calc-input-group">
                        <label>Коэффициент ослабления (μ)</label>
                        <input type="number" id="mu" placeholder="Например: 0.1" step="0.01">
                    </div>
                    <div class="calc-input-group">
                        <label>Толщина материала (см)</label>
                        <input type="number" id="thickness" placeholder="Например: 5" step="0.1">
                    </div>
                    <button class="calc-btn" onclick="calculateAttenuation()">Рассчитать</button>
                    <div id="attenuationResult" style="display:none;">
                        <div class="calc-result">
                            <h4>Результат</h4>
                            <p>Выходная интенсивность: <span id="intensityValue">0</span></p>
                            <p>Ослабление: <span id="attenPercent">0</span>%</p>
                            <p style="font-size: 12px; margin-top: 10px;">Формула: I = I₀ × e⁻μˣ</p>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'photon':
            html = `
                <h3>💡 Энергия фотона</h3>
                <div class="calculator-form">
                    <div class="calc-input-group">
                        <label>Частота (ТГц)</label>
                        <input type="number" id="frequency" placeholder="Например: 5" step="0.1">
                    </div>
                    <button class="calc-btn" onclick="calculatePhotonEnergy()">Рассчитать</button>
                    <div id="photonResult" style="display:none;">
                        <div class="calc-result">
                            <h4>Результат</h4>
                            <p>Энергия фотона: <span id="photonEnergy">0</span> эВ</p>
                            <p style="font-size: 12px; margin-top: 10px;">Формула: E = hf (h = 6.626×10⁻³⁴ Дж·с)</p>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'wavelength':
            html = `
                <h3>〰️ Длина волны</h3>
                <div class="calculator-form">
                    <div class="calc-input-group">
                        <label>Частота (ТГц)</label>
                        <input type="number" id="waveFrequency" placeholder="Например: 300" step="1">
                    </div>
                    <button class="calc-btn" onclick="calculateWavelength()">Рассчитать</button>
                    <div id="wavelengthResult" style="display:none;">
                        <div class="calc-result">
                            <h4>Результат</h4>
                            <p>Длина волны: <span id="wavelengthValue">0</span> нм</p>
                            <p style="font-size: 12px; margin-top: 10px;">Формула: λ = c/f (c = 3×10⁸ м/с)</p>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'frequency':
            html = `
                <h3>📊 Частота излучения</h3>
                <div class="calculator-form">
                    <div class="calc-input-group">
                        <label>Длина волны (нм)</label>
                        <input type="number" id="freqWavelength" placeholder="Например: 500" step="1">
                    </div>
                    <button class="calc-btn" onclick="calculateFrequency()">Рассчитать</button>
                    <div id="frequencyResult" style="display:none;">
                        <div class="calc-result">
                            <h4>Результат</h4>
                            <p>Частота: <span id="frequencyValue">0</span> ТГц</p>
                            <p style="font-size: 12px; margin-top: 10px;">Формула: f = c/λ</p>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'halflife':
            html = `
                <h3>⚛️ Период полураспада</h3>
                <div class="calculator-form">
                    <div class="calc-input-group">
                        <label>Начальное количество (N₀)</label>
                        <input type="number" id="N0" placeholder="Например: 1000" step="1">
                    </div>
                    <div class="calc-input-group">
                        <label>Время (лет)</label>
                        <input type="number" id="hlTime" placeholder="Например: 30" step="0.1">
                    </div>
                    <div class="calc-input-group">
                        <label>Период полураспада (лет)</label>
                        <input type="number" id="halfLifePeriod" placeholder="Например: 30" step="0.1">
                    </div>
                    <button class="calc-btn" onclick="calculateHalfLife()">Рассчитать</button>
                    <div id="hallflifeResult" style="display:none;">
                        <div class="calc-result">
                            <h4>Результат</h4>
                            <p>Оставшееся количество: <span id="remainingAmount">0</span></p>
                            <p>Распалось: <span id="decayedAmount">0</span>%</p>
                            <p style="font-size: 12px; margin-top: 10px;">Формула: N = N₀ × (1/2)^(t/T)</p>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'doserate':
            html = `
                <h3>⚡ Мощность дозы</h3>
                <div class="calculator-form">
                    <div class="calc-input-group">
                        <label>Поглощённая доза (мЗв)</label>
                        <input type="number" id="drDose" placeholder="Например: 5" step="0.1">
                    </div>
                    <div class="calc-input-group">
                        <label>Время (часы)</label>
                        <input type="number" id="drTime" placeholder="Например: 2" step="0.1">
                    </div>
                    <button class="calc-btn" onclick="calculateDoseRate()">Рассчитать</button>
                    <div id="doserateResult" style="display:none;">
                        <div class="calc-result">
                            <h4>Результат</h4>
                            <p>Мощность дозы: <span id="doserateValue">0</span> мЗв/ч</p>
                            <p style="font-size: 12px; margin-top: 10px;">Формула: P = D/t</p>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'activity':
            html = `
                <h3>🔴 Активность источника</h3>
                <div class="calculator-form">
                    <div class="calc-input-group">
                        <label>Количество ядер (N)</label>
                        <input type="number" id="nucleiCount" placeholder="Например: 1e20" step="1e15">
                    </div>
                    <div class="calc-input-group">
                        <label>Период полураспада (лет)</label>
                        <input type="number" id="actHalfLife" placeholder="Например: 30" step="0.1">
                    </div>
                    <button class="calc-btn" onclick="calculateActivity()">Рассчитать</button>
                    <div id="activityResult" style="display:none;">
                        <div class="calc-result">
                            <h4>Результат</h4>
                            <p>Активность: <span id="activityValue">0</span> Бк</p>
                            <p style="font-size: 12px; margin-top: 10px;">Формула: A = λN, λ = ln(2)/T</p>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'cumulative':
            html = `
                <h3>📈 Накопленная доза</h3>
                <div class="calculator-form">
                    <div class="calc-input-group">
                        <label>Мощность дозы (мкЗв/ч)</label>
                        <input type="number" id="cumDosePower" placeholder="Например: 0.5" step="0.01">
                    </div>
                    <div class="calc-input-group">
                        <label>Период (дни)</label>
                        <input type="number" id="cumPeriod" placeholder="Например: 365" step="1">
                    </div>
                    <button class="calc-btn" onclick="calculateCumulativeDose()">Рассчитать</button>
                    <div id="cumulativeResult" style="display:none;">
                        <div class="calc-result">
                            <h4>Результат</h4>
                            <p>Накопленная доза: <span id="cumulativeDose">0</span> мЗв</p>
                            <p style="font-size: 12px; margin-top: 10px;">Формула: D_accum = P × t × 24</p>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'shielding':
            html = `
                <h3>🛡️ Коэффициент защиты</h3>
                <div class="calculator-form">
                    <div class="calc-input-group">
                        <label>Интенсивность без защиты (I₀)</label>
                        <input type="number" id="shieldingI0" placeholder="Например: 1000" step="1">
                    </div>
                    <div class="calc-input-group">
                        <label>Интенсивность с защитой (I)</label>
                        <input type="number" id="shieldingI" placeholder="Например: 10" step="1">
                    </div>
                    <button class="calc-btn" onclick="calculateShielding()">Рассчитать</button>
                    <div id="shieldingResult" style="display:none;">
                        <div class="calc-result">
                            <h4>Результат</h4>
                            <p>Коэффициент защиты: <span id="shieldingValue">0</span></p>
                            <p>Эффективность защиты: <span id="shieldingPercent">0</span>%</p>
                            <p style="font-size: 12px; margin-top: 10px;">Формула: K = I₀/I</p>
                        </div>
                    </div>
                </div>
            `;
            break;
    }

    content.innerHTML = html;
    modal.style.display = 'flex';
}

function closeCalculator() {
    document.getElementById('calculatorModal').style.display = 'none';
}

// Функции расчётов калькуляторов
function calculateDose() {
    const power = parseFloat(document.getElementById('dosePower').value);
    const time = parseFloat(document.getElementById('doseTime').value);

    if (!power || !time) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    const dose = power * time;
    document.getElementById('doseValue').textContent = dose.toFixed(2);
    document.getElementById('doseResult').style.display = 'block';
}

function calculateAttenuation() {
    const I0 = parseFloat(document.getElementById('I0').value);
    const mu = parseFloat(document.getElementById('mu').value);
    const thickness = parseFloat(document.getElementById('thickness').value);

    if (!I0 || mu === null || !thickness) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    const I = I0 * Math.exp(-mu * thickness);
    const attenuation = ((I0 - I) / I0 * 100);

    document.getElementById('intensityValue').textContent = I.toFixed(2);
    document.getElementById('attenPercent').textContent = attenuation.toFixed(1);
    document.getElementById('attenuationResult').style.display = 'block';
}

function calculatePhotonEnergy() {
    const frequency = parseFloat(document.getElementById('frequency').value) * 1e12;
    const h = 6.626e-34;
    const eV_to_J = 1.602e-19;

    if (!frequency) {
        showNotification('Заполните частоту', 'error');
        return;
    }

    const energyJ = h * frequency;
    const energyeV = energyJ / eV_to_J;

    document.getElementById('photonEnergy').textContent = energyeV.toFixed(2);
    document.getElementById('photonResult').style.display = 'block';
}

function calculateWavelength() {
    const frequency = parseFloat(document.getElementById('waveFrequency').value) * 1e9;
    const c = 3e8;

    if (!frequency) {
        showNotification('Заполните частоту', 'error');
        return;
    }

    const wavelength = c / frequency;
    const wavelengthNm = wavelength * 1e9;

    document.getElementById('wavelengthValue').textContent = wavelengthNm.toFixed(2);
    document.getElementById('wavelengthResult').style.display = 'block';
}

function calculateFrequency() {
    const wavelength = parseFloat(document.getElementById('freqWavelength').value) * 1e-9;
    const c = 3e8;

    if (!wavelength) {
        showNotification('Заполните длину волны', 'error');
        return;
    }

    const frequency = c / wavelength;
    const frequencyTHz = frequency / 1e12;

    document.getElementById('frequencyValue').textContent = frequencyTHz.toFixed(2);
    document.getElementById('frequencyResult').style.display = 'block';
}

function calculateHalfLife() {
    const N0 = parseFloat(document.getElementById('N0').value);
    const time = parseFloat(document.getElementById('hlTime').value);
    const halfLife = parseFloat(document.getElementById('halfLifePeriod').value);

    if (!N0 || !time || !halfLife) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    const N = N0 * Math.pow(0.5, time / halfLife);
    const decayed = ((N0 - N) / N0 * 100);

    document.getElementById('remainingAmount').textContent = N.toFixed(0);
    document.getElementById('decayedAmount').textContent = decayed.toFixed(1);
    document.getElementById('hallflifeResult').style.display = 'block';
}

function calculateDoseRate() {
    const dose = parseFloat(document.getElementById('drDose').value);
    const time = parseFloat(document.getElementById('drTime').value);

    if (!dose || !time) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    const doseRate = dose / time;

    document.getElementById('doserateValue').textContent = doseRate.toFixed(2);
    document.getElementById('doserateResult').style.display = 'block';
}

function calculateActivity() {
    const N = parseFloat(document.getElementById('nucleiCount').value);
    const T_years = parseFloat(document.getElementById('actHalfLife').value);

    if (!N || !T_years) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    const T_seconds = T_years * 365.25 * 24 * 3600;
    const lambda = Math.LN2 / T_seconds;
    const A = lambda * N;

    document.getElementById('activityValue').textContent = A.toFixed(2);
    document.getElementById('activityResult').style.display = 'block';
}

function calculateCumulativeDose() {
    const power = parseFloat(document.getElementById('cumDosePower').value);
    const days = parseFloat(document.getElementById('cumPeriod').value);

    if (!power || !days) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    const dose = power * days * 24 / 1000;

    document.getElementById('cumulativeDose').textContent = dose.toFixed(2);
    document.getElementById('cumulativeResult').style.display = 'block';
}

function calculateShielding() {
    const I0 = parseFloat(document.getElementById('shieldingI0').value);
    const I = parseFloat(document.getElementById('shieldingI').value);

    if (!I0 || !I) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    const K = I0 / I;
    const efficiency = ((I0 - I) / I0 * 100);

    document.getElementById('shieldingValue').textContent = K.toFixed(2);
    document.getElementById('shieldingPercent').textContent = efficiency.toFixed(1);
    document.getElementById('shieldingResult').style.display = 'block';
}

// ===== ВИРТУАЛЬНЫЕ ЛАБОРАТОРИЙ =====
function startLab(labId) {
    alert(`🔬 Открытие лабораторной работы: ${labId}\n\nПолнофункциональная версия будет содержать интерактивные симуляции и виртуальный лабораторный стол.`);
}

// ===== ЖУРНАЛ =====
function updateJournal() {
    const journalBody = document.getElementById('journalTable');
    if (!journalBody) return;

    journalBody.innerHTML = '';
    
    labDatabase.forEach((lab, index) => {
        const row = document.createElement('tr');
        let statusHTML = '';
        
        if (lab.status === 'completed') {
            statusHTML = '<span class="status completed">✅ Завершена</span>';
        } else if (lab.status === 'in-progress') {
            statusHTML = '<span class="status in-progress">⏳ В процессе</span>';
        } else {
            statusHTML = '<span class="status pending">⏱️ Не начата</span>';
        }

        const gradeCell = lab.grade ? lab.grade.toFixed(1) : '—';
        const actionBtn = lab.status === 'pending' 
            ? `<button class="action-btn" onclick="startLab('lab${index + 1}')">🚀 Начать</button>`
            : `<button class="action-btn" onclick="viewReport(${index + 1})">📄 Отчёт</button>`;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${lab.title}</td>
            <td>${lab.date}</td>
            <td>${statusHTML}</td>
            <td>${gradeCell}</td>
            <td>${actionBtn}</td>
        `;
        
        journalBody.appendChild(row);
    });
}

function viewReport(labId) {
    alert(`📄 Отчёт по лабораторной работе №${labId}\n\nПолный отчёт с результатами, графиками и выводами будет доступен здесь.`);
}

// ===== ГРАФИКИ =====
function renderCharts() {
    // Проверить, загружена ли библиотека Chart.js
    if (typeof Chart === 'undefined') {
        console.log('Chart.js не загружена. Используется демонстрационная версия.');
        return;
    }

    // График оценок
    const gradesCtx = document.getElementById('gradesChart');
    if (gradesCtx) {
        new Chart(gradesCtx, {
            type: 'bar',
            data: {
                labels: labDatabase.map(l => l.title.substring(0, 20)),
                datasets: [{
                    label: 'Оценка',
                    data: labDatabase.map(l => l.grade || 0),
                    backgroundColor: '#0066cc',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { max: 5 }
                }
            }
        });
    }

    // График времени
    const timeCtx = document.getElementById('timeChart');
    if (timeCtx) {
        new Chart(timeCtx, {
            type: 'doughnut',
            data: {
                labels: labDatabase.map(l => l.title.substring(0, 15)),
                datasets: [{
                    data: labDatabase.map(l => l.hours),
                    backgroundColor: ['#0066cc', '#28a745', '#ffc107']
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // График прогресса
    const progressCtx = document.getElementById('progressChart');
    if (progressCtx) {
        const completed = labDatabase.filter(l => l.status === 'completed').length;
        new Chart(progressCtx, {
            type: 'line',
            data: {
                labels: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4'],
                datasets: [{
                    label: 'Завершено работ',
                    data: [0, 1, 1, completed],
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    }

    // График по темам
    const topicsCtx = document.getElementById('topicsChart');
    if (topicsCtx) {
        new Chart(topicsCtx, {
            type: 'radar',
            data: {
                labels: ['Дозиметрия', 'Защита', 'Оборудование', 'Расчёты', 'Анализ'],
                datasets: [{
                    label: 'Успешность (%)',
                    data: [90, 85, 88, 92, 87],
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.2)',
                    pointBackgroundColor: '#0066cc'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        max: 100
                    }
                }
            }
        });
    }
}

// ===== ПОМОЩНИК =====
function askAssistant() {
    const input = document.getElementById('userQuestion');
    const question = input.value.trim();

    if (!question) return;

    // Добавить вопрос в чат
    const chat = document.getElementById('assistantChat');
    const userMsg = document.createElement('div');
    userMsg.className = 'message user-message';
    userMsg.innerHTML = `<p>${escapeHtml(question)}</p>`;
    chat.appendChild(userMsg);

    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    // Получить ответ (демонстрация)
    setTimeout(() => {
        const answer = getAssistantAnswer(question);
        const assistantMsg = document.createElement('div');
        assistantMsg.className = 'message assistant-message';
        assistantMsg.innerHTML = `<p>${answer}</p>`;
        chat.appendChild(assistantMsg);
        chat.scrollTop = chat.scrollHeight;
    }, 500);
}

function askPreset(preset) {
    let question = '';
    
    switch(preset) {
        case 'what-is-dose':
            question = 'Что такое поглощённая доза излучения?';
            break;
        case 'half-life-formula':
            question = 'Какова формула периода полураспада?';
            break;
        case 'radiation-safety':
            question = 'Основные правила радиационной безопасности';
            break;
    }

    document.getElementById('userQuestion').value = question;
    askAssistant();
}

function getAssistantAnswer(question) {
    const q = question.toLowerCase();

    if (q.includes('доза') || q.includes('облучение')) {
        return '☢️ <strong>Поглощённая доза (D)</strong> — это количество энергии ионизирующего излучения, поглощённое единицей массы вещества. Измеряется в Греях (Гр) или радах. 1 Гр = 1 Дж/кг = 100 рад.<br>Эквивалентная доза (H) учитывает биологический эффект: H = D × Q, где Q — коэффициент качества.';
    } else if (q.includes('полураспад')) {
        return '⚛️ <strong>Период полураспада (T)</strong> — время, за которое активность радиоактивного источника уменьшается в 2 раза.<br>Формула: N(t) = N₀ × (1/2)^(t/T)<br>Активность: A(t) = A₀ × e^(-λt), где λ = ln(2)/T';
    } else if (q.includes('безопасность')) {
        return '🛡️ <strong>Основные принципы радиационной безопасности:</strong><br>1. <strong>Обоснование</strong> — использование только при пользе<br>2. <strong>Оптимизация</strong> — как можно ниже разумно достижимо (ALARA)<br>3. <strong>Защита</strong> — ограничение дозы<br>• Минимизировать время облучения<br>• Максимизировать расстояние<br>• Использовать экранирующие материалы';
    } else if (q.includes('энергия') || q.includes('фотон')) {
        return '💡 <strong>Энергия фотона</strong><br>E = hf = hc/λ<br>где:<br>• h = 6.626×10⁻³⁴ Дж·с (постоянная Планка)<br>• f — частота<br>• c = 3×10⁸ м/с (скорость света)<br>• λ — длина волны';
    } else if (q.includes('мрт') || q.includes('магнит')) {
        return '🧲 <strong>МРТ (Магнитно-резонансная томография)</strong><br>• Использует магнитное поле 1.5-3.0 Т<br>• Безопасна (не ионизирующее излучение)<br>• SAR &lt; 2 Вт/кг<br>• Противопоказания: металлические имплантаты, кардиостимуляторы<br>• Время обследования: 30-60 минут';
    } else {
        return '🤖 Я помощник по медицинской физике. Могу помочь с:<br>• Расчётами дозировок<br>• Формулами и физическими константами<br>• Правилами радиационной безопасности<br>• Характеристиками медицинского оборудования<br><br>Пожалуйста, уточните ваш вопрос!';
    }
}

// ===== УТИЛИТЫ =====
function showNotification(message, type = 'info') {
    // Простое уведомление через alert (в полной версии будет красивое уведомление)
    console.log(`[${type.toUpperCase()}] ${message}`);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Загрузить пользователя при загрузке страницы
window.addEventListener('load', function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showAuthScreen(false);
        loadUserData();
    } else {
        showAuthScreen(true);
    }
});
