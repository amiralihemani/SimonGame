
var image_ids = ["green", "red", "yellow", "blue", "play", "strict"];

var switchOn = false;
var playGame = false;
var strictMode = false;
var playButtons = [];
var playButtonsIndex = -1;
var loseGame = false;
var begin;
var round;
var currentPlayer = -1;
var simulatedClick = false;
var maxScorePlayer = { score: 0, playerNames: [] };
var players = localStorage.getItem("Names").split(',');
var playerScore = [];

var sound = {
    green: "Sound/Blow1_1.wav",
    red: "Sound/Blow2_1.wav",
    yellow: "Sound/Blow3_1.wav",
    blue: "Sound/Blow4_1.wav"
}


function initializeVariables() {
    switchOn = false;
    playGame = false;
    strictMode = false;
    playButtons = [];
    playButtonsIndex = -1;
    loseGame = false;
    currentPlayer = -1;
    simulatedClick = false;
    maxScorePlayer = { score: 0, playerNames: [] };
}


function addEvents() {
    for (var i = 0; i < image_ids.length; i++) {
        var imageElement = document.getElementById(image_ids[i]);
        imageElement.addEventListener("mousedown", mousedownImageChange, false);
        imageElement.addEventListener("mouseup", setInitialImage, false);
        imageElement.addEventListener("mouseout", setInitialImage, false);
        if (image_ids[i] != "play" && image_ids[i] != "strict") {
            imageElement.addEventListener("click", playSoundAndGame, false);
        }
    }
}

function removeEvents() {
    for (var i = 0; i < image_ids.length; i++) {
        var imageElement = document.getElementById(image_ids[i]);
        imageElement.removeEventListener("mousedown", mousedownImageChange, false);
        imageElement.removeEventListener("mouseup", setInitialImage, false);
        imageElement.removeEventListener("mouseout", setInitialImage, false);
        if (image_ids[i] != "play" && image_ids[i] != "strict") {
            imageElement.removeEventListener("click", playSoundAndGame, false);
        }
    }
}

function mousedownImageChange() {
    if (this.id != "play" && this.id != "strict") {
        this.src = "Images/" + this.id + "2.png";
    }
    else {
        this.src = "Images/" + this.id + "_control_down.png";
    }
}

function setInitialImage() {

    if (this.id != "play" && this.id != "strict") {
        this.src = "Images/" + this.id + "1.png";
    }
    else {
        this.src = "Images/" + this.id + "_control_up.png";
    }
}

function playSoundAndGame(event) {
    var event = event || window.event;
    var element = event.target.id;
    event.stopPropagation;
    var audio = document.getElementById("audio");
    audio.src = sound[element];
    audio.play();
    if (!simulatedClick && playGame) {
        getUserButton(event);
    }
    if (simulatedClick) {
        simulatedClick = false;
    }
}

function turnOn() {
    if (!switchOn) {
        switchOn = true;
        addEvents();
        document.getElementById("play").addEventListener("click", startGame, false);
        if (players.length == 1) {
            document.getElementById("strict").addEventListener("click", switchStrictMode, false);
        }

        //onclick = "playGame()"
        document.getElementById("switch_on").src = "Images/stop.png";

    }
    else if (switchOn) {
        switchOn = false;
        playButtons = [];
        removeEvents();

        document.getElementById("switch_on").src = "Images/play.png";
        if (playGame) {
            document.getElementById("play_light").src = "Images/red_light.png";
            playGame = false;
        }
        if (strictMode) {
            document.getElementById("strict_light").src = "Images/red_light.png";
            strictMode = false;
        }
        initializeVariables();
    }
}

function switchStrictMode() {
    strictMode = !strictMode;
    if (strictMode) {
        document.getElementById("strict_light").src = "Images/green_light.png";
    }
    else {
        document.getElementById("strict_light").src = "Images/red_light.png";
    }
}

function startGame() {
    var playElement = document.getElementById("play");

    if (switchOn) {
        playGame = true;
        playElement.removeEventListener("mousedown", mousedownImageChange, false);
        playElement.removeEventListener("mouseup", setInitialImage, false);
        playElement.removeEventListener("mouseout", setInitialImage, false);
        playElement.removeEventListener("click", playGame, false);
        if (playerScore.length == 1) {
            document.getElementById("strict").removeEventListener("click", switchStrictMode, false);
        }


        document.getElementById("play_light").src = "Images/green_light.png";

        document.getElementById("strict").removeEventListener("mousedown", mousedownImageChange, false);
        document.getElementById("strict").removeEventListener("mouseup", setInitialImage, false);
        document.getElementById("strict").removeEventListener("mouseout", setInitialImage, false);
        if (players.length > 1) {
            strictMode = true;
        }
        for (var i = 0; i < players.length; i++) {
            playerScore.push(initializePlayerScores(i));
        }
        beginNextPlayerGame();
    }
}

function beginNextPlayerGame() {
    currentPlayer++;
    displayInfo(players[currentPlayer] + "'s turn to play");
    round = 1;
    playButtonsIndex = 0;
    playButtons = [];
    setTimeout(beginGame, 3000);
}

function initializePlayerScores(index) {
    return {
        score: 0,
        playerName: players[index]
    };
}

function getUserButton(event) {
    var event = event || window.event;
    if (playButtonsIndex >= 0 && playButtonsIndex < playButtons.length) {
        var nextInSequence = playButtons[playButtonsIndex];
        playButtonsIndex++;
        if (!(nextInSequence == event.target.id)) {
            if (strictMode) {
                playerScore[currentPlayer].score = round;
                if (round == maxScorePlayer.score) {
                    maxScorePlayer.score = round;
                    maxScorePlayer.playerNames.push(playerScore[currentPlayer].playerName);
                }
                else if (round > maxScorePlayer.score) {
                    maxScorePlayer.score = round;
                    maxScorePlayer.playerNames = [];
                    maxScorePlayer.playerNames.push(playerScore[currentPlayer].playerName);
                }
                if ((currentPlayer + 1) < players.length) {
                    beginNextPlayerGame();
                }
                else {
                    var text = "";

                    displayInfo("High score is " + maxScorePlayer.score);
                    if (players.length == 1) {
                        return;
                    }
                    setTimeout(displayInfo, 3800, "player(s) getting this are...");
                    if (maxScorePlayer.playerNames.length == 1) {
                        text = maxScorePlayer.playerNames[i];
                    }
                    else {
                        for (var i = 0; i < maxScorePlayer.playerNames.length; i++) {
                            if (i == 0) {
                                text = maxScorePlayer.playerNames[i] + ", ";
                            }
                            else if (i != maxScorePlayer.playerNames.length - 1) {
                                text += maxScorePlayer.playerNames[i] + ", ";
                            }
                            else if (i == maxScorePlayer.playerNames.length - 1) {
                                text += maxScorePlayer.playerNames[i];
                                break;
                            }

                        }
                    }
                    setTimeout(displayInfo, 4800, text);
                }
            }
            else {
                displayInfo("You are lucky!!! You got it wrong but we will repeat it for again you as you are not in strict mode..."); //not in strict mode
                playButtonsIndex = 0;
                setTimeout(triggerButtons, 3000);
                //triggerButtons();
            }
        }
        else if (playButtonsIndex == playButtons.length) {
            playButtonsIndex = 0;
            playButtons = [];
            round++;
            setTimeout(beginGame, 800);
        }
    }
}

function displayInfo(displayText) {
    $("#info").text(displayText);
    $("#information").modal("show");
    setTimeout(function hideModal() { $("#information").modal("hide"); }, 2000);
}

function triggetMouseClicks(element) {
    var myEvent1 = document.createEvent("MouseEvents");
    myEvent1.initEvent('mousedown', false, true);

    document.getElementById(element).dispatchEvent(myEvent1);

    var myEvent2 = document.createEvent("MouseEvents");
    myEvent2.initEvent('mouseup', false, true);

    setTimeout(function () { document.getElementById(element).dispatchEvent(myEvent2); }, 100);

    var myEvent3 = document.createEvent("MouseEvents");
    myEvent3.initEvent('click', false, true);
    setTimeout(function () { simulatedClick = true; document.getElementById(element).dispatchEvent(myEvent3); }, 100);
}

//function initializeGame() {
//    var round = 1;

//return function beginGame() {
function beginGame() {
    var button = ["green", "red", "yellow", "blue"];
    var buttonSequence = [];
    for (var i = 0; i < round; i++) {
        var randomNum = getRandomNumber(0, 4);
        buttonSequence.push(button[randomNum]);
        playButtons.push(button[randomNum]);
    }
    triggerButtons();
}

function triggerButtons() {
    for (var i = 0; i < playButtons.length; i++) {

        (function (x) {
            setTimeout(triggetMouseClicks, (x * 500), playButtons[x]);
        })(i);

    }
}
//}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
