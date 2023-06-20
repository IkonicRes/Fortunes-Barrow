class Riddler {
  constructor() {
    this.wrongAnswers = [];
    this.selectedAnswer = ""
    this.bRiddling = false;
    this.sortedRiddle = undefined;
  }

  async getRiddles() {
    try {
      const response = await fetch("https://riddles-api.vercel.app/random");
      const data = await response.json();
      return data; // Assuming the riddles are in the zero index
    } catch (err) {
      console.error(err);
    }
  }

  async getOneWordRiddle() {
    var foundOneWordRiddle = false;
    var riddle;
    while (!foundOneWordRiddle) {
      riddle = await this.getRiddles();
      if (!riddle || !riddle.answer) { continue; }
      if (riddle.answer.trim().split(" ").length === 1) {
        foundOneWordRiddle = true;
      };
    }
    return riddle;
  }

  async fetchQuiz(correctAnswer) {
    try {
      const response1 = await fetch(`https://api.datamuse.com/words?ml=${correctAnswer}&max=10`);
      const response2 = await fetch(`https://api.datamuse.com/words?rel_trg=${correctAnswer}&max=10`);
      if (!response1.ok || !response2.ok) {
        throw new Error(`HTTP error! status: ${response1.status}, ${response2.status}`);
      }
      const data1 = await response1.json();
      const data2 = await response2.json();

      // Combine results, remove duplicates and the correct answer
      const combinedData = data1.concat(data2)
      const uniqueData = combinedData.filter((item, pos) => combinedData.indexOf(item) === pos)
      if (uniqueData.length < 3) {
        console.log("Not enough related words found");
        return await this.fetchQuiz(this.getOneWordRiddle());
      }
      const wrongAnswers = [];

      for (let i = 0; i < 3; i++) {
        // Get the index of the last three elements
        const lastIndex = uniqueData.length - 1 - i;
        wrongAnswers.push(uniqueData[lastIndex].word.toUpperCase());
        // Ensure we don't select the same word twice
        uniqueData.splice(lastIndex, 1);
      }
      
      correctAnswer = correctAnswer.toUpperCase();
      wrongAnswers.splice(
        Math.floor(Math.random() * wrongAnswers.length),
        0,
        correctAnswer
      );
      
      return wrongAnswers;

    } catch (err) {
      console.error(err);
    }
  }

  async start() {
    let riddle;
    let wrongAnswers;
    try {
      riddle = await this.getOneWordRiddle();
      console.log(riddle);

      // Fetch the quiz with the correct answer
      wrongAnswers = await this.fetchQuiz(
        riddle.answer
          .split("")
          .filter((char) => /^[a-zA-Z]*$/.test(char))
          .join("")
      );
    } catch (err) {
      console.error(err);
    }

    return {
      riddle: riddle,
      wrongAnswers: wrongAnswers,
    };
  }
}
export {Riddler};