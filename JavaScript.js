// This array holds the Id's of images on web page
var image_ids = ["green", "red", "yellow", "blue", "play", "strict"];

var switchOn = false;
var playGame = false;
var strictMode = false;

//holds the sequence of buttons played while simulation
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

// Initialize variables
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

//Add mousedown, mouseup, mouseout, click events on game start to elements in image_ids array
function addEvents() {
    for (var i = 0; i < image_ids.length; i++) {
        var imageElement = document.getElementById(image_ids[i]);
        imageElement.addEventListener("mousedown", mousedownImageChange, false);
        imageElement.addEventListener("mouseup", setInitialImage, false);
        imageElement.addEventListener("mouseout", setInitialImage, false);
        if (image_ids[i] != "play" && image_ids[i] != "strict") {
            //adding playSoundAndGame only to simon games buttons
            imageElement.addEventListener("click", playSoundAndGame, false);
        }
    }
}

// Remove mousedown, mouseup, mouseout, click events on game start to elements in image_ids array
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

//Change image on mouse down
function mousedownImageChange() {
    if (this.id != "play" && this.id != "strict") {
        this.src = "Images/" + this.id + "2.png";
    }
    else {
        this.src = "Images/" + this.id + "_control_down.png";
    }
}

//Change image on mouse up or mpuse out
function setInitialImage() {

    if (this.id != "play" && this.id != "strict") {
        this.src = "Images/" + this.id + "1.png";
    }
    else {
        this.src = "Images/" + this.id + "_control_up.png";
    }
}

// On click of Simon game buttons this event is triggered
function playSoundAndGame(event) {
    var event = event || window.event;
    // get the element which triggered the click event from event object
    var element = event.target.id;
    event.stopPropagation;
    var audio = document.getElementById("audio");
    //Get the appropriate audio file path from sound array based on element id on which click was triggered
    audio.src = sound[element];
    audio.play();
    // if these are not simulated clicks, i.e the user clicks the buttons, then get the button clicked and evaluate the game by calling getUserButton and passing event object
    if (!simulatedClick && playGame) {
        getUserButton(event);
    }
    // If these are simulated clicks, set the simulatedClick to false so that above if statement gets executed when user clicks the buttons to repeat the sequence of buttons simulated
    if (simulatedClick) {
        simulatedClick = false;
    }
}

// user turns on/off the game, add/remove mouse events from elements on webpage and initialize variables accordingly
function turnOn() {
    if (!switchOn) {
        switchOn = true;
        addEvents();
        // adding click event listener to "play" button image so that it starts the game when clicked
        //strict mode is enabled by default in multiplayer mode and cannot be disabled
        document.getElementById("play").addEventListener("click", startGame, false);
        if (players.length == 1) {
            //if single user plays the game, allow the user to enable/disable strict mode
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
    //switch strict mode on each click, it works only in single player mode.
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
        //remove mouse events from "play" element. Game can be stopped by only turning off the game once it is started
        playElement.removeEventListener("mousedown", mousedownImageChange, false);
        playElement.removeEventListener("mouseup", setInitialImage, false);
        playElement.removeEventListener("mouseout", setInitialImage, false);
        //playElement.removeEventListener("click", playGame, false);
        if (playerScore.length == 1) {
            document.getElementById("strict").removeEventListener("click", switchStrictMode, false);
        }


        document.getElementById("play_light").src = "Images/green_light.png";

        document.getElementById("strict").removeEventListener("mousedown", mousedownImageChange, false);
        document.getElementById("strict").removeEventListener("mouseup", setInitialImage, false);
        document.getElementById("strict").removeEventListener("mouseout", setInitialImage, false);
        if (players.length > 1) {
            //strictMode is set to true in multiplayer mode
            strictMode = true;
        }
        for (var i = 0; i < players.length; i++) {
            //initialize each player score to 0
            playerScore.push(initializePlayerScores(i));
        }
        //begin game
        beginNextPlayerGame();
    }
}

// Begin game for next player
// Empty button sequence array playButtons and set its index to 0
// initialize this players round to 1 and beginGame
function beginNextPlayerGame() {
    currentPlayer++;
    displayInfo(players[currentPlayer] + "'s turn to play");
    round = 1;
    playButtonsIndex = 0;
    playButtons = [];
    setTimeout(beginGame, 3000);
}

// initialize players score to 0 and return an object with his score and name
function initializePlayerScores(index) {
    return {
        score: 0,
        playerName: players[index]
    };
}

// Called from playSoundAndGame function when user clicks the buttons to repeat the sequence simulated
// It evaluates the users sequence to simulated sequence to decide if the user moves to next round
function getUserButton(event) {
    var event = event || window.event;
    if (playButtonsIndex >= 0 && playButtonsIndex < playButtons.length) {
        // get the next button in sequence from playButtons
        var nextInSequence = playButtons[playButtonsIndex];
        playButtonsIndex++;
        // if the next in sequence is the same as the user pressed button,
        // let the user move to next round else move to next player in multiplayer mode else repeat the sequence if single player is not playing in strict mode
        if (!(nextInSequence == event.target.id)) {
            // user button click is not the same as the next button in sequence
            if (strictMode) {
                // In strict mode, the player loses, evaluate his score and max score
                playerScore[currentPlayer].score = round;
                if (round == maxScorePlayer.score) {
                    // if this players score is equal to max score, add this player to the maxScorePlayer objects playerNames property
                    maxScorePlayer.score = round;
                    maxScorePlayer.playerNames.push(playerScore[currentPlayer].playerName);
                }
                else if (round > maxScorePlayer.score) {
                    // if this players score is max score, maxScorePlayer's score is this score and players name would be his name
                    maxScorePlayer.score = round;
                    maxScorePlayer.playerNames = [];
                    maxScorePlayer.playerNames.push(playerScore[currentPlayer].playerName);
                }
                //Move to next player, if any and begin game
                if ((currentPlayer + 1) < players.length) {
                    beginNextPlayerGame();
                }
                else {
                    //If all players are done, display high score
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
                // If mot in strict mode, repeat the sequence to the user
                displayInfo("You are lucky!!! You got it wrong but we will repeat it for again you as you are not in strict mode..."); //not in strict mode
                playButtonsIndex = 0;
                setTimeout(triggerButtons, 3000);
                //triggerButtons();
            }
        }
        else if (playButtonsIndex == playButtons.length) {
            // If player gets the current rounds sequence right, move him to next round and beginGame
            playButtonsIndex = 0;
            playButtons = [];
            round++;
            setTimeout(beginGame, 800);
        }
    }
}

//Display information on modal
function displayInfo(displayText) {
    $("#info").text(displayText);
    $("#information").modal("show");
    setTimeout(function hideModal() { $("#information").modal("hide"); }, 2000);
}

//simulate button clicks by firing mousedown, mouseup and click events. 
//This function is called from triggerButtons function
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

function beginGame() {
    var button = ["green", "red", "yellow", "blue"];
    var buttonSequence = [];
    for (var i = 0; i < round; i++) {
        // pick round number of random numbers between 1-4 and add to playButtons array and simulate this sequence
        var randomNum = getRandomNumber(0, 4);
        buttonSequence.push(button[randomNum]);
        playButtons.push(button[randomNum]);
    }
    // simulate button clicks for playButtons elements
    triggerButtons();
}

// simulate button clicks for playButtons elements 
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
