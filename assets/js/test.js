function printData(spellCurrentData) {
    console.log(spellCurrentData)
    // console.log(monsterCurrentData.hit_points)
    var spellObject = {
        name: spellCurrentData.name,
        desc: spellCurrentData.desc,
        damage: spellCurrentData.damage,
        range: spellCurrentData.range,
        duration: spellCurrentData.duration,
    }
    console.log(spellObject)
  }
  
  fetch('https://www.dnd5eapi.co/api/spells')
    .then(response => response.json())
    .then(data => {
      // Get a random index from the array of monsters
      const randomIndex = Math.floor(Math.random() * data.results.length);
      // monsterCurrentData = fetch('https://www.dnd5eapi.co' + data.results[randomIndex].url)
      console.log(randomIndex, data.results)
      // Fetch data for the randomly selected monster
      fetch('https://www.dnd5eapi.co' + data.results[randomIndex].url)
    
       .then(response => response.json())
       .then(spellData => printData(spellData)) 
  })
  //   .then(monsterData => console.log(monsterData))
.catch(error => console.error('Error:', error));