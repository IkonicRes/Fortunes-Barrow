async function getRiddles() {
  try {
    const response = await fetch("https://api.api-ninjas.com/v1/riddles");
    const data = await response.json();
    console.log(data); // Log the data to inspect its structure
    return data[0]; // Assuming the riddles are in the zero index
  } catch (err) {
    console.error(err);
  }
}

async function getAllRiddles() {
  let riddles = [];
  for (let i = 0; i < 100; i++) {
    let tRiddle = await getRiddles();
    riddles.push(tRiddle);
  }
  return riddles;
}

function filterOneWordRiddles(data) {
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

getAllRiddles()
  .then((allRiddles) => {
    console.log(allRiddles);
    const filteredRiddles = filterOneWordRiddles(allRiddles);
    console.log(filteredRiddles);
    //generate random index to access a random riddle
    var riddleIndex = Math.floor(Math.random() * filteredRiddles.length);
    //generates the random riddle
    var randomRiddle = filteredRiddles[riddleIndex];
    console.log(randomRiddle);
  })
  .catch((error) => {
    console.error(error);
  });
