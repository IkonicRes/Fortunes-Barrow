function printData(weaponCurrentData) {
    console.log(weaponCurrentData)
    // console.log(monsterCurrentData.hit_points)
    var weaponObject = {
        name: weaponCurrentData.name,
        dice: weaponCurrentData.damage.damage_dice
    }
    console.log(weaponObject)
  }


function getData(targetApi, name){
    fetch('https://www.dnd5eapi.co/api/' + targetApi + '/' + name )
    .then(response => response.json())
  
    .then(spellData => printData(spellData)) 
    
    .catch(error => console.error('Error:', error));
}

getData("spells", "fire-bolt")

function fetchWeaponData(){
    Promise.all([fetch('https://www.dnd5eapi.co/api/equipment/shortbow').then (response => response.json()), fetch('https://www.dnd5eapi.co/api/equipment/longsword').then (response => response.json()),fetch('https://www.dnd5eapi.co/api/equipment/shield').then (response => response.json())])
    .then(data => console.log(data))
    
}
fetchWeaponData()

