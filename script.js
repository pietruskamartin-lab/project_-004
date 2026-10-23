const questions = window.questions ?? [];

const startView = document.getElementById("start-container");
const quizView = document.getElementById("quiz-container");
const endView = document.getElementById("end-container");
const views = [startView, quizView, endView];

const startButton = document.getElementById("start-button");
const summaryButton = document.getElementById("quiz-aside-button");
const returnToStartButton = document.getElementById("end-aside-button");
const questionTitle = document.getElementById("quiz-header-title");
const answersContainer = document.getElementById("quiz-main-container");
const questionList = document.getElementById("end-main-question-list");
const totalTimeOutput = document.getElementById("end-total-time");
const endHeaderScore = document.getElementById("end-header-score");

let quizQuestions = [];
let userAnswers = [];
let quizStartedAt = 0;
let currentQuestionIndex = 0;
let currentQuestion = null;
let currentAnswerSaved = false;
let advanceTimer = null;

function changeView(viewToShow) {
    views.forEach((view) => {
        view.hidden = view !== viewToShow;
    });
}

function startQuiz() {
    quizQuestions = [...questions];

    // Miesza pytania, aby w każdej rozgrywce pojawiały się w innej kolejności.
    for (let index = quizQuestions.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [quizQuestions[index], quizQuestions[randomIndex]] = [quizQuestions[randomIndex], quizQuestions[index]];
    }

    userAnswers = [];
    currentQuestionIndex = 0;
    quizStartedAt = Date.now();
    summaryButton.disabled = true;

    if (quizQuestions.length === 0) {
        questionTitle.textContent = "Brak pytań w quizie.";
        answersContainer.replaceChildren();
        return;
    }

    loadQuestion();
}

function loadQuestion() {
    currentQuestion = quizQuestions[currentQuestionIndex];
    currentAnswerSaved = false;

    questionTitle.textContent = currentQuestion.question;
    answersContainer.replaceChildren();

    currentQuestion.answers.forEach((answer, answerIndex) => {
        const answerOption = document.createElement("div");
        answerOption.className = "answer-option";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "answer";
        radio.value = answerIndex;
        radio.addEventListener("change", () => saveAnswer(answerIndex));

        const answerText = document.createElement("span");
        answerText.className = "answer-container";
        answerText.textContent = answer;

        answerOption.append(radio, answerText);
        answersContainer.append(answerOption);
    });
}

function saveAnswer(selectedAnswerIndex) {
    if (currentAnswerSaved) return;

    currentAnswerSaved = true;
    summaryButton.disabled = false;
    userAnswers.push({
        question: currentQuestion.question,
        answers: currentQuestion.answers,
        selectedAnswerIndex,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: selectedAnswerIndex === currentQuestion.correctAnswer
    });

    if (currentQuestionIndex < quizQuestions.length - 1) {
        advanceTimer = window.setTimeout(() => {
            advanceTimer = null;
            currentQuestionIndex++;
            loadQuestion();
        }, 350);
    } else {
        advanceTimer = window.setTimeout(showSummary, 350);
    }
}

function showSummary() {
    if (advanceTimer !== null) {
        window.clearTimeout(advanceTimer);
        advanceTimer = null;
    }

    questionList.replaceChildren();

    const correctAnswersCount = userAnswers.filter((answerRecord) => answerRecord.isCorrect).length;
    endHeaderScore.textContent = `Wynik: ${correctAnswersCount} / ${quizQuestions.length}`;

    userAnswers.forEach((answerRecord) => {
        const listItem = document.createElement("li");
        const chosenAnswer = answerRecord.answers[answerRecord.selectedAnswerIndex];
        const correctAnswer = answerRecord.answers[answerRecord.correctAnswer];

        listItem.classList.add(answerRecord.isCorrect ? "is-correct" : "is-incorrect");
        listItem.textContent = `${answerRecord.question} Twoja odpowiedź: ${chosenAnswer}. Poprawna odpowiedź: ${correctAnswer}.`;
        questionList.append(listItem);
    });

    const elapsedSeconds = quizStartedAt
        ? Math.floor((Date.now() - quizStartedAt) / 1000)
        : 0;
    totalTimeOutput.textContent = String(elapsedSeconds).padStart(3, "0");

    changeView(endView);
}

startButton.addEventListener("click", () => {
    startQuiz();
    changeView(quizView);
});

summaryButton.addEventListener("click", showSummary);

returnToStartButton.addEventListener("click", () => {
    changeView(startView);
});
