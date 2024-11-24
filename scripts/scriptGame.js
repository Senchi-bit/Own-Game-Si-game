let settings = {};
let pack = {};
let players = [];
let isEditing = false;
let selectedTopicIndex = null;
let selectedQuestionIndex = null;
let selectedPlayerIndex = null;
let allQuestionsAnswered = false;

// Таймеры
let questionTimerActive = false;
let thinkingTimeActive = false;
let questionTimerInterval = null;
let thinkingTimerInterval = null;

// Загрузка JSON файлов
async function loadFiles() {
    try {
        const settingsResponse = await fetch('/settings.json');
        settings = await settingsResponse.json();

        const packResponse = await fetch('/pack.json');
        pack = await packResponse.json();

        initializeGame();
    } catch (error) {
        console.error('Ошибка при загрузке файлов:', error);
    }
}

// Инициализация игры
function initializeGame() {
    initializePlayers();
    renderTopics();
    renderPlayers();
}

// Инициализация игроков
function initializePlayers() {
    const playerCount = settings.playerCount || 1;

    for (let i = 0; i < playerCount; i++) {
        players.push({ name: `Игрок ${i + 1}`, score: 0 });
    }
}

// Отображение игроков
function renderPlayers() {
    const playerPanel = document.getElementById('player-panel');
    playerPanel.innerHTML = '';

    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';

        const playerNameInput = document.createElement('input');
        playerNameInput.value = player.name;
        playerNameInput.disabled = !isEditing;
        playerNameInput.onchange = () => {
            player.name = playerNameInput.value;
        };

        const playerScoreInput = document.createElement('input');
        playerScoreInput.value = player.score;
        playerScoreInput.type = 'number';
        playerScoreInput.disabled = !isEditing;
        playerScoreInput.onchange = () => {
            player.score = parseInt(playerScoreInput.value, 10);
        };
        playerScoreInput.className = 'player-score';

        playerDiv.appendChild(playerNameInput);
        playerDiv.appendChild(playerScoreInput);

        playerPanel.appendChild(playerDiv);
    });
}

// Отображение тем и вопросов
function renderTopics() {
    const topicContainer = document.getElementById('topic-container');
    topicContainer.innerHTML = '';

    pack.topics.forEach((topic, topicIndex) => {
        const topicDiv = document.createElement('div');
        topicDiv.className = 'topic';

        const topicTitle = document.createElement('div');
        topicTitle.className = 'topic-title';
        topicTitle.textContent = topic.title;
        topicDiv.appendChild(topicTitle);

        topic.questions.forEach((question, questionIndex) => {
            if (!question.answered) {
                const questionButton = document.createElement('button');
                questionButton.className = 'question-button';
                questionButton.textContent = question.value;
                questionButton.onclick = () => showQuestionModal(topicIndex, questionIndex);
                topicDiv.appendChild(questionButton);
            }
        });

        topicContainer.appendChild(topicDiv);
    });

    // Проверяем, все ли вопросы отвечены
    allQuestionsAnswered = pack.topics.every(topic => 
        topic.questions.every(question => question.answered)
    );

    if (allQuestionsAnswered) {
        showWinnerModal();
    }
}

// Показ модального окна для вопроса
function showQuestionModal(topicIndex, questionIndex) {
    // Очищаем старые таймеры
    clearInterval(questionTimerInterval);
    clearInterval(thinkingTimerInterval);

    selectedTopicIndex = topicIndex;
    selectedQuestionIndex = questionIndex;

    const currentQuestion = pack.topics[topicIndex].questions[questionIndex];

    document.getElementById('questionText').textContent = currentQuestion.text;
    document.getElementById('correctAnswerText').textContent = currentQuestion.answer || '';
    document.getElementById('correctAnswer').style.display = 'none';
    document.getElementById('answerButton').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('questionModal').style.display = 'block';
    document.getElementById('answerResult').style.display = 'none';
    document.getElementById('thinkingTimer').style.display = 'none';
    if (settings.showAnswer) {
        document.getElementById('correctAnswer').style.display = 'none';
    }

    startQuestionTimer(); // Запуск таймера на показ вопроса
}

// Запуск таймера для показа вопроса
function startQuestionTimer() {
    const questionTime = settings.questionDisplayTime || 30;
    let timeLeft = questionTime;
    
    document.getElementById('displayTimer').style.display = 'block';
    document.getElementById('displayTimerValue').textContent = timeLeft;
    

    questionTimerActive = true;

    questionTimerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('displayTimerValue').textContent = timeLeft;

        if (timeLeft <= 0 || !questionTimerActive) {
            clearInterval(questionTimerInterval);
            document.getElementById('displayTimer').style.display = 'none';
            document.getElementById('correctAnswer').style.display = settings.showAnswer ? 'block' : 'none';
            showPlayerSelection();
        }
    }, 1000);
}

// Запуск таймера на размышление
function startThinkingTimer() {
    const thinkingTime = settings.thinkingTime || 10;
    let timeLeft = thinkingTime;
    document.getElementById('thinkingTimer').style.display = 'block';
    document.getElementById('thinkingTimerValue').textContent = timeLeft;

    thinkingTimeActive = true;

    thinkingTimerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('thinkingTimerValue').textContent = timeLeft;

        if (timeLeft <= 0 || !thinkingTimeActive) {
            clearInterval(thinkingTimerInterval);
            document.getElementById('thinkingTimer').style.display = 'none';
            // Вычесть очки у выбранного игрока и закрыть окно ответа
            handleAnswer(false); // В случае если таймер на размышление истек
        }
    }, 1000);
}

// Досрочный вызов на выбор игрока
document.getElementById('answerButton').onclick = function () {
    questionTimerActive = false; // Останавливаем таймер на показ вопроса
    clearInterval(questionTimerInterval);
    document.getElementById('displayTimer').style.display = 'none';
    document.getElementById('thinkingTimer').style.display = 'none'; // Скрываем таймер размышления, если кнопка была нажата
    document.getElementById('answerResult').style.display = 'none'; // Показать окно ответа
    showPlayerSelection();
};

// Показ выбора игрока для ответа
function showPlayerSelection() {
    const playerSelect = document.getElementById('playerSelect');
    playerSelect.innerHTML = '';

    players.forEach((player, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = player.name;
        playerSelect.appendChild(option);
    });

    document.getElementById('playerSelectContainer').style.display = 'block';
    document.getElementById('answerButton').style.display = 'none';

    if (settings.showAnswer) {
        document.getElementById('correctAnswer').style.display = 'block';
    }
}

// Подтверждение выбора игрока
document.getElementById('confirmPlayer').onclick = function () {
    selectedPlayerIndex = document.getElementById('playerSelect').value;
    document.getElementById('playerSelectContainer').style.display = 'none';
    document.getElementById('answerResult').style.display = 'block';
    startThinkingTimer();
    // Если настройка "showAnswer" включена, сразу показать результат
    if (settings.showAnswer) {
        document.getElementById('correctAnswer').style.display = 'block';
    }
};

// Обработка правильного или неправильного ответа
function handleAnswer(isCorrect) {
    const currentQuestion = pack.topics[selectedTopicIndex].questions[selectedQuestionIndex];
    const player = players[selectedPlayerIndex];

    if (isCorrect) {
        switch(currentQuestion.type){
            case "bet":
                player.score += currentQuestion.value * 2;
                break
            case "normal":
                player.score += currentQuestion.value;
                break
            case "no-answer":
                player.score += currentQuestion.value;
                break
        }
    } else {
        switch(currentQuestion.type){
            case "bet":
                player.score -= currentQuestion.value * 2;
                break
            case "normal":
                player.score -= currentQuestion.value;
                break
            case "no-answer":
                player.score -= currentQuestion.value;
                break
        }
    }

    // Помечаем вопрос как отвеченный
    currentQuestion.answered = true;

    // Скрытие модального окна и обновление информации
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('questionModal').style.display = 'none';
    renderPlayers();
    renderTopics(); // Перерисовка тем и вопросов
}

// Показ модального окна победителя
function showWinnerModal() {
    const winner = players.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    document.getElementById('winnerText').textContent = `Победитель: ${winner.name}`;
    document.getElementById('winnerModal').style.display = 'block';
}

// Закрытие модального окна победителя
function closeWinnerModal() {
    document.getElementById('winnerModal').style.display = 'none';
}

// Обработка редактирования
document.getElementById('editButton').onclick = function () {
    isEditing = !isEditing;
    renderPlayers();
};

// Загрузка файлов при загрузке страницы
window.onload = loadFiles;
