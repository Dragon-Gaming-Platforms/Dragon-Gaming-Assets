
// VARIABLES & FUNCTIONS

const currentScore = document.getElementById('final-score');
const wordsFound = document.getElementById('words-found');
const playAgainBtn = document.getElementById('play-again-btn');
const mostRecentScore = localStorage.getItem('mostRecentScore');
const answerArray = JSON.parse(localStorage.getItem('words'));
const totalWordsIdentified = localStorage.getItem('wordCount');
const acceptedAnswers = document.getElementById('accepted-answers');
const saveScoreBtn = document.getElementById("saveScoreBtn");
const username = document.getElementById("username");

currentScore.innerText = mostRecentScore;
wordsFound.innerText = `You found ${totalWordsIdentified} words in total`;


acceptedAnswers.innerHTML = answerArray.map(word => {
    return `<li class="answer-rundown">${word}</li>`
}).join("");

username.addEventListener('keyup', () => {
    saveScoreBtn.disabled = !username.value;
});


saveScoreBtn.addEventListener("click", (e) => {
    e.preventDefault();
    alert("The online scoreboard is not available in this hosted build - your best score is kept locally.");
});


function playAgain () {
    playAgainBtn.addEventListener("click", e => { 
        window.location.assign('game.html');
    });
}


playAgain();