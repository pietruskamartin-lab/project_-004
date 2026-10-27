const startButton = document.getElementById("start-button");
const endButton = document.getElementById("end-button");

const startView = document.getElementById("start-container");
const quizView = document.getElementById("quiz-container");
const endView = document.getElementById("end-container");
const views = [startView, quizView, endView];

const questionTitle = document.getElementById("quiz-header-title");
const questionImage = document.getElementById("quiz-question-image");
const quizMainContainer = document.getElementById("quiz-main-container");
const answersContainer = document.getElementById("quiz-answers-container");
const questionList = document.getElementById("end-main-question-list");
const endHeaderScore = document.getElementById("end-header-score");
const totalTimeOutput = document.getElementById("end-total-time");

let remainingQuestions = [];
let userAnswers = [];
let currentQuestion = null;
let quizStartedAt = 0;
let advanceTimer = null;

function showView(selectedView) {
    views.forEach(view => {
        view.hidden = view !== selectedView;
    });
}

function shuffleQuestionAnswers(question) {
    const shuffledAnswers = question.answers.map((answer, index) => ({
        answer,
        isCorrect: index === question.correctAnswer
    }));

    for (let index = shuffledAnswers.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledAnswers[index], shuffledAnswers[randomIndex]] = [
            shuffledAnswers[randomIndex],
            shuffledAnswers[index]
        ];
    }

    return {
        ...question,
        answers: shuffledAnswers.map(item => item.answer),
        correctAnswer: shuffledAnswers.findIndex(item => item.isCorrect)
    };
}

function startQuiz() {
    if (advanceTimer !== null) {
        window.clearTimeout(advanceTimer);
        advanceTimer = null;
    }

    remainingQuestions = (window.questions ?? []).map(shuffleQuestionAnswers);
    userAnswers = [];
    currentQuestion = null;
    quizStartedAt = Date.now();
    questionList.replaceChildren();

    if (remainingQuestions.length === 0) {
        questionTitle.textContent = "Brak pytań w quizie.";
        answersContainer.replaceChildren();
        quizMainContainer.classList.remove("has-image");
        questionImage.hidden = true;
        showView(quizView);
        return;
    }

    showQuestion();
    showView(quizView);
}

function dynamicQuestionSize(questionText) {
    const textLength = questionText.length;

    if (textLength > 300) {
        questionTitle.style.fontSize = "100%";
    } else if (textLength > 240) {
        questionTitle.style.fontSize = "112.5%";
    } else if (textLength > 180) {
        questionTitle.style.fontSize = "125%";
    } else if (textLength > 120) {
        questionTitle.style.fontSize = "150%";
    } else if (textLength > 80) {
        questionTitle.style.fontSize = "175%";
    } else {
        questionTitle.style.fontSize = "";
    }
}

function showQuestion() {
    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    currentQuestion = remainingQuestions.splice(randomIndex, 1)[0];
    const question = currentQuestion;
    questionTitle.textContent = question.question;
    dynamicQuestionSize(question.question);
    answersContainer.replaceChildren();



    const imageSource = question.image || question.img;
    quizMainContainer.classList.toggle("has-image", Boolean(imageSource));
    if (imageSource) {
        questionImage.src = imageSource;
        questionImage.alt = question.imageAlt || "Ilustracja do pytania";
        questionImage.hidden = false;
    } else {
        questionImage.removeAttribute("src");
        questionImage.alt = "";
        questionImage.hidden = true;
    }

    question.answers.forEach((answer, answerIndex) => {
        const answerOption = document.createElement("div");
        answerOption.classList.add("answer-option");

        const answerRadio = document.createElement("input");
        answerRadio.type = "radio";
        answerRadio.name = "answer";
        answerRadio.value = answerIndex;
        answerRadio.setAttribute("aria-label", answer);

        const answerContainer = document.createElement("span");
        answerContainer.classList.add("answer-container");
        answerContainer.textContent = answer;

        answerRadio.addEventListener("change", () => {
            saveAnswer(answerIndex);
        });

        answerOption.append(answerRadio, answerContainer);
        answersContainer.append(answerOption);
    });
}

function saveAnswer(selectedAnswerIndex) {
    const question = currentQuestion;

    userAnswers.push({
        question: question.question,
        answers: question.answers,
        selectedAnswerIndex,
        correctAnswer: question.correctAnswer,
        isCorrect: selectedAnswerIndex === question.correctAnswer
    });

    answersContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.disabled = true;
    });

    advanceTimer = window.setTimeout(() => {
        advanceTimer = null;
        if (userAnswers.length >= 20 || remainingQuestions.length === 0) {
            showSummary();
        } else {
            showQuestion();
        }
    }, 350);
}

function showSummary() {
    questionList.replaceChildren();

    const correctAnswersCount = userAnswers.filter(answer => answer.isCorrect).length;
    endHeaderScore.textContent = `Wynik: ${correctAnswersCount} / ${userAnswers.length}`;

    userAnswers.forEach(answerRecord => {
        const listItem = document.createElement("li");
        const selectedAnswer = answerRecord.answers[answerRecord.selectedAnswerIndex];
        const correctAnswer = answerRecord.answers[answerRecord.correctAnswer];

        listItem.classList.add(answerRecord.isCorrect ? "is-correct" : "is-incorrect");
        listItem.textContent = `${answerRecord.question} Twoja odpowiedź: ${selectedAnswer}. Poprawna odpowiedź: ${correctAnswer}.`;
        questionList.append(listItem);
    });

    const elapsedSeconds = Math.floor((Date.now() - quizStartedAt) / 1000);
    totalTimeOutput.textContent = String(elapsedSeconds).padStart(3, "0");
    showView(endView);
}

startButton.addEventListener("click", startQuiz);
endButton.addEventListener("click", () => {
    showView(startView);
});
