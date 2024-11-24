let topicCount = 0;
const maxTopics = 6;

// Функция для добавления новой темы
function addTopic() {
    if (topicCount >= maxTopics) {
        alert('Максимум можно добавить 6 тем.');
        return;
    }

    const questionCount = parseInt(document.getElementById('questionCount').value, 10);

    const topicContainer = document.createElement('div');
    topicContainer.className = 'topic-section';
    topicContainer.dataset.topicIndex = topicCount;

    // Создаем поле для названия темы
    topicContainer.innerHTML = `
        <div class="topic-header">
            <label for="topicTitle${topicCount}">Название темы:</label>
            <input type="text" id="topicTitle${topicCount}" placeholder="Введите название темы" style="width: 55%;">
            <button class="delete-button" onclick="deleteTopic(${topicCount})">Удалить</button>
        </div>
    `;

    // Добавляем вопросы для текущей темы
    for (let i = 0; i < questionCount; i++) {
        const questionSection = document.createElement('div');
        questionSection.className = 'question-section';

        questionSection.innerHTML = `
            <label for="question${topicCount}_${i}">Вопрос ${i + 1}:</label>
            <input type="text" id="question${topicCount}_${i}" placeholder="Введите текст вопроса">
            
            <label for="questionType${topicCount}_${i}">Тип вопроса:</label>
            <select id="questionType${topicCount}_${i}" class="question-type-select" onchange="toggleAnswerField(${topicCount}, ${i})" style="margin-bottom: 15px;">
                <option value="normal">Обычный</option>
                <option value="bet">Со ставкой</option>
                <option value="risk-free">Без риска</option>
                <option value="no-answer">Без ответа</option>
            </select>
            
            <label for="questionValue${topicCount}_${i}">Стоимость вопроса:</label>
            <input type="number" id="questionValue${topicCount}_${i}" min="0" value="100">
            
            <label for="answer${topicCount}_${i}">Ответ:</label>
            <input type="text" id="answer${topicCount}_${i}" placeholder="Введите ответ">
        `;

        topicContainer.appendChild(questionSection);
    }

    document.getElementById('topicsContainer').appendChild(topicContainer);
    topicCount++;
}

// Функция для удаления темы
function deleteTopic(index) {
    const topicToRemove = document.querySelector(`[data-topic-index="${index}"]`);
    if (topicToRemove) {
        topicToRemove.remove();
        topicCount--;
    }
}

// Функция для скрытия поля ответа, если выбран тип "без ответа"
function toggleAnswerField(topicIndex, questionIndex) {
    const questionType = document.getElementById(`questionType${topicIndex}_${questionIndex}`).value;
    const answerField = document.getElementById(`answer${topicIndex}_${questionIndex}`);

    if (questionType === 'no-answer') {
        answerField.disabled = true;
        answerField.value = ''; // Очистить поле, если оно неактивно
    } else {
        answerField.disabled = false;
    }
}

// Функция для сохранения пака в JSON-файл
function savePack() {
    const pack = {
        topics: []
    };

    const topics = document.querySelectorAll('.topic-section');
    for (let tIndex = 0; tIndex < topics.length; tIndex++) {
        const topicElement = topics[tIndex];
        const topicTitle = document.getElementById(`topicTitle${tIndex}`).value.trim();
        
        // Проверяем, заполнено ли название темы
        if (!topicTitle) {
            alert('Пожалуйста, заполните все названия тем.');
            return; // Прерываем функцию, если есть ошибка
        }

        const questions = [];
        const questionSections = topicElement.querySelectorAll('.question-section');

        for (let index = 0; index < questionSections.length; index++) {
            const section = questionSections[index];
            const questionText = document.getElementById(`question${tIndex}_${index}`).value.trim();
            const questionType = document.getElementById(`questionType${tIndex}_${index}`).value;
            const questionValue = parseInt(document.getElementById(`questionValue${tIndex}_${index}`).value, 10);
            const answerText = document.getElementById(`answer${tIndex}_${index}`).value.trim();

            // Проверяем, заполнен ли текст вопроса
            if (!questionText) {
                alert('Пожалуйста, заполните все поля вопросов.');
                return; // Прерываем функцию, если есть ошибка
            }

            // Если тип вопроса не "без ответа", проверяем наличие ответа
            if (questionType !== 'no-answer' && !answerText) {
                alert('Пожалуйста, заполните все ответы или выберите тип "без ответа".');
                return; // Прерываем функцию, если есть ошибка
            }

            // Проверяем, что стоимость вопроса положительная
            if (isNaN(questionValue) || questionValue < 0) {
                alert('Пожалуйста, укажите корректную стоимость вопроса (неотрицательное число).');
                return; // Прерываем функцию, если есть ошибка
            }

            questions.push({
                text: questionText,
                type: questionType,
                value: questionValue,
                answer: questionType === 'no-answer' ? null : answerText
            });
        }

        pack.topics.push({
            title: topicTitle,
            questions: questions
        });
    }

    // Если все проверки пройдены, сохраняем JSON
    const packJson = JSON.stringify(pack);

    // Создаем Blob для сохранения файла
    const blob = new Blob([packJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Создаем скрытую ссылку для скачивания файла
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pack.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Пак сохранен!');
}