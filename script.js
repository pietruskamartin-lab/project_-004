const questions = window.questions ?? [];

const startView = document.getElementById("start-container");
const quizView = document.getElementById("quiz-container");
const endView = document.getElementById("end-container");
const views = [startView, quizView, endView];

const startButton = document.getElementById("start-button");
const summaryButton = document.getElementById("quiz-aside-button");
const returnToStartButton = document.getElementById("end-aside-button");
const questionTitle = document.getElementById("quiz-header-title");
const answerButtons = document.querySelectorAll(".answer-buttons");
const questionList = document.getElementById("end-main-question-list");
const totalTimeOutput = document.getElementById("end-total-time");
const endHeaderTitle = document.getElementById("end-header-title");

let quizQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStartedAt = 0;

function changeView(viewToShow) {
    views.forEach((view) => {
        view.hidden = view !== viewToShow;
    });
}

function shuffleQuestions(questionList) {
    const shuffledQuestions = [...questionList];

    for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledQuestions[index], shuffledQuestions[randomIndex]] = [
            shuffledQuestions[randomIndex],
            shuffledQuestions[index]
        ];
    }

    return shuffledQuestions;
}

function startQuiz() {
    if (questions.length === 0) {
        questionTitle.textContent = "Brak pytań do wyświetlenia.";
        changeView(quizView);
        return;
    }

    quizQuestions = shuffleQuestions(questions);
    currentQuestionIndex = 0;
    userAnswers = Array(quizQuestions.length).fill(null);
    quizStartedAt = Date.now();
    questionList.replaceChildren();
    totalTimeOutput.textContent = "000";
    endHeaderTitle.textContent = "Podsumowanie quizu programistycznego";

    renderQuestion();
    changeView(quizView);
}

function renderQuestion() {
    const currentQuestion = quizQuestions[currentQuestionIndex];

    questionTitle.textContent = currentQuestion.question;

    answerButtons.forEach((button, answerIndex) => {
        const answerExists = answerIndex < currentQuestion.answers.length;
        button.hidden = !answerExists;

        if (answerExists) {
            button.textContent = currentQuestion.answers[answerIndex];
        }
    });
}

function handleAnswer(answerIndex) {
    if (currentQuestionIndex >= quizQuestions.length) {
        return;
    }

    userAnswers[currentQuestionIndex] = answerIndex;
    currentQuestionIndex += 1;

    if (currentQuestionIndex < quizQuestions.length) {
        renderQuestion();
    } else {
        finishQuiz();
    }
}

function renderSummary() {
    questionList.replaceChildren();

    let correctAnswersCount = 0;

    quizQuestions.forEach((question, index) => {
        const selectedAnswerIndex = userAnswers[index];
        const isCorrect = selectedAnswerIndex === question.correctAnswer;
        const listItem = document.createElement("li");

        if (isCorrect) {
            correctAnswersCount += 1;
        }

        listItem.classList.add(isCorrect ? "is-correct" : "is-incorrect");

        const selectedAnswer = selectedAnswerIndex === null
            ? "Brak odpowiedzi"
            : question.answers[selectedAnswerIndex];
        const result = isCorrect ? "Poprawnie" : "Niepoprawnie";
        const correctAnswerText = isCorrect
            ? ""
            : ` Poprawna odpowiedź: ${question.answers[question.correctAnswer]}.`;

        listItem.textContent = `${question.question} Twoja odpowiedź: ${selectedAnswer}. ${result}.${correctAnswerText}`;
        questionList.append(listItem);
    });

    endHeaderTitle.textContent = `Wynik: ${correctAnswersCount} / ${quizQuestions.length}`;
}

function finishQuiz() {
    const elapsedSeconds = Math.floor((Date.now() - quizStartedAt) / 1000);

    totalTimeOutput.textContent = String(elapsedSeconds).padStart(3, "0");
    renderSummary();
    changeView(endView);
}

answerButtons.forEach((button, answerIndex) => {
    button.addEventListener("click", () => handleAnswer(answerIndex));
});

startButton.addEventListener("click", startQuiz);
summaryButton.addEventListener("click", finishQuiz);
returnToStartButton.addEventListener("click", () => changeView(startView));
