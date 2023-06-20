// Give a quick check to see if there are any scores in localStorage to report and save the result
var scoresExist = (localStorage.getItem('scores') !== null)
// Save the score-list as well for later manipulation, and set the pre-ordered score array to empty
var scoreOl = $("#score-list");
var scoresPreOrdered = [];

// This is a function that adds a listener to the "Play" button, restarting the quiz if the user wants to try again
function addResetButtonListener() {
    $("#reset").on("click", function() {
        // It just sets the window's url to the home url
        $(location).attr("href", "./index.html");
    });
}

// This is our function to set the Default High Score
function setDefaultHighScore() {
    // It adds a center-aligned list item with class of list-group-item
    var $listItem = $("<li>").addClass();
    // and creates two spans, one for name, one for score. Then it sets both of them to the defaults of "Highest score" and 0 respectively
    var $scoreName = $("<h2>").text("Highest Score");
    var $scoreValue = $("<h2>").text("0");
    // We create a div with flex-row, justify-content: space-between to keep them at opposite ends of the row
    var $scoreSection = $("<div>").addClass("score");
    // And append the created spans to the div
    $scoreSection.append($scoreName, $scoreValue);
    // Append the div to the list item 
    $listItem.append($scoreSection);
    // And append the list item to the saved #score-list element
    $(scoreOl).append($listItem);
}

// This function adds a listener to the "Clear" button, clearing the scores from local storage, removing all list items, and resetting the default high score with the aforementioned function.
function addClearButtonListener() {
    $("#clear").on("click", function() {
        localStorage.clear();
        // Clear the list element
        $(scoreOl).empty();

        setDefaultHighScore();
    });
}

// This function runs my all-time favorite algorithm in reverse, bubblesort! 
function bubbleSort(inputArr) {
    let len = inputArr.length;
    for (let index0 = 0; index0 < len; index0++) {
        for (let index1 = index0 + 1; index1 < len; index1++) {
            if (inputArr[index0][1] < inputArr[index1][1]) {
                let temp = inputArr[index0];
                inputArr[index0] = inputArr[index1];
                inputArr[index1] = temp;
            }
        }
    }
    return inputArr;
}

// This function populates our sorted high scores from the local storage
function populateScores(scoresPostOrdered){
    // It loops over each ordered array, which should contain an index 0 of the user's name and an index 1 of the user's score
    for(let index = 0; index < scoresPostOrdered.length; index++){
        // creates a list item with classes of center align and list-group item
        var $listItem = $("<li>").addClass();
        // and creates two spans, one for name, one for score. Then it sets both of them to the current element's content of name and score respectively
        var $scoreName = $("<h2>").text(scoresPostOrdered[index][0]);
        var $scoreValue = $("<h2>").text(scoresPostOrdered[index][1]);
        // We create a div with flex-row, justify-content: space-between to keep them at opposite ends of the row
        var $scoreSection = $("<div>").addClass("score");
        // And append the created spans to the div
        $scoreSection.append($scoreName, $scoreValue);
        // Append the div to the list item 
        $listItem.append($scoreSection);
        // And append the list item to the saved #score-list element
        $(scoreOl).append($listItem);
    }
}

// When the page loads, check if the scores exist
if (scoresExist){
    let scores = JSON.parse(localStorage.getItem('scores'));
    // And loop over them all...
    for (var index = 0; index < scores.length; index++) {
        // Splitting each score by the inserted "%" divider
        var tScore = scores[index].split("%");
        // Convert the score part to a number
        tScore[1] = parseInt(tScore[1], 10);
        // push the temporarily saved score to the pre-ordered array of scores.
        scoresPreOrdered.push(tScore);
    }
    // Then reverse bubble sort the score arrays so that they are ordered by score highest to lowest
    var scoresPostOrdered = bubbleSort(scoresPreOrdered);
    // Run the populateScores function with the newly ordered scores
    populateScores(scoresPostOrdered);
}
// Otherwise run the function to set the default High score
else{
    setDefaultHighScore()
}

// And add both button listeners.
addClearButtonListener()
addResetButtonListener()