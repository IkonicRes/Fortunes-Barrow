class Riddler {
  constructor() {
    this.wrongAnswers = [];
  }
async getRiddles() {
  try {
    // Sending a GET request to the riddles API
    const response = await fetch("https://riddles-api.vercel.app/random");
    // Parsing the response body as JSON
    const data = await response.json();
    // Returning the retrieved riddle data
    return data;
    // Logging any errors that occur during the fetching process
  } catch (err) {
    console.error(err);
  }
}
  // Function to fetch multiple riddles
async getAllRiddles() {
   // Array to store the fetched riddles
  let riddles = [];
  // Looping 100 times to fetch multiple riddles
  for (let i = 0; i < 100; i++) {

  // Fetching a single riddle using the getRiddles() function
    let tRiddle = await this.getRiddles();
  // Adding the fetched riddle to the riddles array

    riddles.push(tRiddle);
  }
  // Returning the array of fetched riddles
  return riddles;
}

// Function to filter riddles with only one-word answers
filterOneWordRiddles(data) {
  const oneWordRiddles = data.filter((riddle) => {
    // Skip riddles without an answer key
    if (!riddle || !riddle.answer) {
      return false;
    }
    // Remove leading/trailing spaces and check if the answer consists of one word
    const trimmedAnswer = riddle.answer.trim();
    return trimmedAnswer.split(" ").length === 1;
  });
  // Returning an array of riddles with one-word answers
  return oneWordRiddles;
}

;
async fetchQuiz(correctAnswer) {

  console.log(correctAnswer);
  try {
    // Fetching related words using two different API endpoints
    const response1 = await fetch(
      `https://api.datamuse.com/words?ml=${correctAnswer}&max=10`
    );
    const response2 = await fetch(
      `https://api.datamuse.com/words?rel_trg=${correctAnswer}&max=10`
    );
    // Checking if the responses are successful
    if (!response1.ok || !response2.ok) {
      throw new Error(
        `HTTP error! status: ${response1.status}, ${response2.status}`
      );
    }
    // Parsing the response bodies as JSON
    const data1 = await response1.json();
    const data2 = await response2.json();

    // Combine results, remove duplicates and the correct answer
    const combinedData = [...data1, ...data2];
    console.log(response1, response2);
    // Removing duplicates by mapping the words to unique values and filtering out the correct answer
    const uniqueData = Array.from(new Set(combinedData.map((a) => a.word)))
      .map((word) => {
        return combinedData.find((a) => a.word === word);
      })
      .filter((a) => a.word !== correctAnswer);
    console.log(combinedData);
    // Checking if enough related words are found
    if (uniqueData.length < 3) {
      console.log("Not enough related words found");
      return;
    }
    // Generating wrong answers by randomly selecting words from uniqueData
    const wrongAnswers = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * uniqueData.length);

      wrongAnswers.push(uniqueData[randomIndex].word.toUpperCase());
      // Ensuring we don't select the same word twice
      uniqueData.splice(randomIndex, 1);
    }
    correctAnswer = correctAnswer.toUpperCase();
    wrongAnswers.splice(
      Math.floor(Math.random() * wrongAnswers.length),
      0,
      correctAnswer
    );
    console.log(wrongAnswers);
    // Returning the array of wrong answers
  return wrongAnswers;
    // Logging any errors that occur during the fetching process
  } catch (err) {
    console.error(err);
  }
}

async start() {
  let randomRiddle;
  let wrongAnswers;
  try {
    const allRiddles = await this.getAllRiddles();
    console.log(allRiddles);
    const filteredRiddles = this.filterOneWordRiddles(allRiddles);
    console.log(filteredRiddles);

    // Generate a random index to access a random riddle
    var randomIndex = Math.floor(Math.random() * filteredRiddles.length);
    // Generate the random riddle
    randomRiddle = filteredRiddles[randomIndex];
    console.log(randomRiddle)
    // Fetch the quiz with the correct answer
    wrongAnswers = await this.fetchQuiz(
      randomRiddle.answer
        // Splitting the answer into an array of characters
        .split("")
        // Keeping only alphabetic characters
        .filter((char) => /^[a-zA-Z]*$/.test(char))
        // Joining the remaining characters back into a single string
        .join("")
    );
  } catch (err) {
    console.error(err);
  }

  return {
    riddle: randomRiddle,
    wrongAnswers: wrongAnswers,
  };
}
}
export {Riddler};