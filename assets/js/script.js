/**
 * Creates a new player. 
 * @class
 * 
 * @property {number} level - starts at one and progresses
 * @property {number} health - keep this above zero
 * @property {string} weapon - ties to an object with a damage rating
 * @property {object} coords - location on the grid
 * @property {number} xp - experience points
 */ 
class Player {
    constructor(level, health, weapon, coords, xp) {
      this.level = level;
      this.health = health;
      this.weapon = weapon;
      this.coords = coords;
      this.xp = xp;
    }
}

/**
 * Creates a new enemy. 
 * @class
 * 
 * @property {Number} health
 * @property {Object} coords
 * @property {Number} damage
 */ 

class Enemy {
    constructor(health, coords, damage) {
      this.health = health;
      this.coords = coords;
      this.damage = damage;
    }
}

class Game {
    constructor() {
      this.map = [];
      this.shadow = [];
      this.isShadowToggled = false;
      this.enemies = [];
      this.canvas = null;
      this.context = null;
    }
  }

(function() {

    // you can add your code here.
 
 })();