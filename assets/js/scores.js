// Give a quick check to see if there are any scores in localStorage to report and save the result
scoresExist = (localStorage.getItem('scores') !== null)
//Save the score-list as well for later manipulation, and set the pre-ordered score array to empty
var scoreOl = $("#score-list");
var scoresPreOrdered = [];


// This is a function that adds a listener to the "Play" button, restarting the quiz if the user wants to try again
function addResetButtonListener() {
    $("#reset").on("click", function() {
        //It just sets the window's url to the home url
        $(location).attr("href", "./index.html");
    });
}

//This is our funciton to set the DefaultHighScore
function setDefaultHighScore() {
    //It adds a center aligned list item with class of list-group-item
    var $listItem = $("<li>").addClass();
    //and creates two spans, one for name, one for score. Then it sets both of them to the defaults of "Highest score" and 0 respectively
    var $scoreName = $("<span>").text("Highest Score ");
    var $scoreValue = $("<span>").text("0");
    //We create a div with flex-row, justify-content: space-between to keep them at opposite ends of the row
    var $scoreSection = $("<div>").addClass("score");
    //And append the created spans to the div
    $scoreSection.append($scoreName, $scoreValue);
    //Append the div to the list item 
    $listItem.append($scoreSection);
    //And append the list item to the saved #score-list element
    $(scoreOl).append($listItem);
}

//This function adds a listener to the "Clear" button, clearing the scores from local storage, removing all list items, and resetting the default high score with the aforementioned function.
function addClearButtonListener() {
    $("#clear").on("click", function() {
        localStorage.clear();
        $("li").remove(".list-group-item")
        setDefaultHighScore()
    });
}

//This function runs my all-time favorite algorithm in reverse, bubblesort! For more on how the algorithm works, check here ===> https://www.geeksforgeeks.org/bubble-sort
function bubbleSort(inputArr) {
    let len = inputArr.length;
    for (var index0 = 0; index0 < len; index0++) {
        for (var index1 = index0 + 1; index1 < len; index1++) {
            if (inputArr[index0][1] < inputArr[index1][1]) {
                var temp = inputArr[index0];
                inputArr[index0] = inputArr[index1];
                inputArr[index1] = temp;
            }
        }
    }
    return inputArr;
}

//This function populates our sorted high scores from the localstorage
function populateScores(scoresPostOrdered){
    //It loops over each ordered array, which should contain an index 0 of the user's name and an index 1 of the user's score
    for(index = 0; index < scoresPostOrdered.length; index++){
        //creates a list item with classes of center align and list-group item
        var $listItem = $("<li>").addClass();
        //and creates two spans, one for name, one for score. Then it sets both of them to the current element's content of name and score respectively
        var $scoreName = $("<span>").text(scoresPreOrdered[index][0]);
        var $scoreValue = $("<span>").text(scoresPreOrdered[index][1]);
        //We create a div with flex-row, justify-content: space-between to keep them at opposite ends of the row
        var $scoreSection = $("<div>").addClass("score");
        //And append the created spans to the div
        $scoreSection.append($scoreName, $scoreValue);
        //Append the div to the list item 
        $listItem.append($scoreSection);
        //And append the list item to the saved #score-list element
        $(scoreOl).append($listItem);
    }
}

//When the page loads, check if the scores exist
if (scoresExist){
    //And if so, grab and parse existing scores and save them to var scores
    var scores = JSON.parse(localStorage.getItem("scores"))
    //And loop over them all...
    for (var index = 0; index < scores.length; index++) {
        //Splitting each score by the inserted "%" divider and pushing the temporarily saved score to the pre-ordered array of scores.
        var tScore = scores[index].split("%");
        scoresPreOrdered.push(tScore);
    }
}
//Otherwise run the function to set the default High score
else{
    setDefaultHighScore()
}
//Then reverse bubble sort the score arrays so that they are ordered by score highest to lowest
scoresPostOrdered = bubbleSort(scoresPreOrdered)
//Run the populateSCores function with the newly ordered scores
populateScores(scoresPostOrdered)
//And add both button listeners.
addClearButtonListener()
addResetButtonListener()