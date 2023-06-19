class Riddler {
  constructor() {
    this.wrongAnswers = [];
  }
async getRiddles() {
  try {
    const response = await fetch("https://riddles-api.vercel.app/random");
    const data = await response.json();
    // console.log(data); // Log the data to inspect its structure
    return data; // Assuming the riddles are in the zero index
  } catch (err) {
    console.error(err);
  }
}

async getAllRiddles() {
  let riddles = [];
  for (let i = 0; i < 100; i++) {
    let tRiddle = await this.getRiddles();
    riddles.push(tRiddle);
  }
  return riddles;
}


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

  return oneWordRiddles;
}

;

async fetchQuiz(correctAnswer) {
  console.log(correctAnswer);
  try {
    const response1 = await fetch(
      `https://api.datamuse.com/words?ml=${correctAnswer}&max=10`
    );
    const response2 = await fetch(
      `https://api.datamuse.com/words?rel_trg=${correctAnswer}&max=10`
    );
    if (!response1.ok || !response2.ok) {
      throw new Error(
        `HTTP error! status: ${response1.status}, ${response2.status}`
      );
    }
    const data1 = await response1.json();
    const data2 = await response2.json();

    // Combine results, remove duplicates and the correct answer
    const combinedData = [...data1, ...data2];
    console.log(response1, response2);
    const uniqueData = Array.from(new Set(combinedData.map((a) => a.word)))
      .map((word) => {
        return combinedData.find((a) => a.word === word);
      })
      .filter((a) => a.word !== correctAnswer);
    console.log(combinedData);
    if (uniqueData.length < 3) {
      console.log("Not enough related words found");
      return;
    }

    const wrongAnswers = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * uniqueData.length);

      wrongAnswers.push(uniqueData[randomIndex].word.toUpperCase());
      // Ensure we don't select the same word twice
      uniqueData.splice(randomIndex, 1);
    }
    correctAnswer = correctAnswer.toUpperCase();
    wrongAnswers.splice(
      Math.floor(Math.random() * wrongAnswers.length),
      0,
      correctAnswer
    );
    console.log(wrongAnswers);

  return wrongAnswers;

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
    console.log(randomRiddle);

    // Fetch the quiz with the correct answer
    wrongAnswers = await this.fetchQuiz(
      randomRiddle.answer
        .split("")
        .filter((char) => /^[a-zA-Z]*$/.test(char))
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