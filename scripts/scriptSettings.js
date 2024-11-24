// Функция для сохранения настроек в JSON-файл
function saveSettings() {
    // Получаем значения из формы
    const thinkingTime = parseInt(document.getElementById('thinkingTime').value, 10);
    const questionDisplayTime = parseInt(document.getElementById('questionDisplayTime').value, 10);
    const playerCount = parseInt(document.getElementById('playerCount').value, 10);

    // Проверка корректности введённых данных
    if (thinkingTime < 5 || isNaN(thinkingTime)) {
        alert('Ошибка: Время на размышление должно быть не меньше 5 секунд.');
        return;
    }
    if (questionDisplayTime < 5 || isNaN(questionDisplayTime)) {
        alert('Ошибка: Время показа вопроса должно быть не меньше 5 секунд.');
        return;
    }
    if (playerCount < 1 || playerCount > 5 || isNaN(playerCount)) {
        alert('Ошибка: Количество игроков должно быть от 1 до 5.');
        return;
    }

    // Если все данные корректны, сохраняем настройки
    const settings = {
        showAnswer: document.getElementById('showAnswer').checked,
        thinkingTime: thinkingTime,
        questionDisplayTime: questionDisplayTime,
        playerCount: playerCount
    };

    // Преобразуем настройки в JSON
    const settingsJson = JSON.stringify(settings, null, 2); // Форматируем JSON для удобного чтения

    // Создаем Blob для сохранения файла
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Создаем скрытую ссылку для скачивания файла
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Настройки сохранены!');
}