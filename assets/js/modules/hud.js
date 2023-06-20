import { r1d8 } from "./helper.js";

class ProgressBar {
    constructor(posX, posY, width, height, scene, borderX = 0, borderY = 0, color = 0xFF0000, bgColor = 0x111111) {
      this.scene = scene;
      this.pos = { x: posX, y: posY };
      this.size = { width: width, height: height };
      this.border = { x: borderX, y: borderY }
      this.targetProgress = 0;
      this.currentProgress = 0;
      this.color = color;
      this.bg = this.scene.add.graphics();
      this.bgColor = bgColor
      this.progress = this.scene.add.graphics();
      this.progress.setInteractive();
      this.updateProgressBar();
      this.setProgress(100);
      // USE THIS TO ADD CLICKING ON A HEALTH BAR TO TARGET
      // this.scene.input.on('gameobjectdown', (pointer, gameObject) => {
        // })
      }
      
    static valueToPercentage(value, min, max) { return ((value - min) * 100) / (max - min); }

    setDepth(depth) { this.progress.setDepth(depth); this.bg.setDepth(depth - 1) }
    setVisible(bool) { this.progress.setVisible(bool); this.bg.setVisible(bool); }

    updateProgressBar() {
        this.bg.setScrollFactor(0);
        this.bg.fillStyle(this.bgColor, 1);
        this.bg.fillRect(
            this.pos.x - this.border.x,
            this.pos.y - this.border.y,
            this.size.width + this.border.x * 2,
            this.size.height + this.border.y * 2
        );
        this.progress.setScrollFactor(0);
        this.progress.fillStyle(this.color, 0.7);
        this.progress.fillRect(
          this.pos.x, this.pos.y,
          0, this.size.height
        );
    }
  
    setProgress(progress) {
      this.currentProgress = progress;
      this.progress.clear();
      this.progress.setScrollFactor(0);
      this.progress.fillStyle(this.color, 0.7);
      this.progress.fillRect(
        this.pos.x,
        this.pos.y,
        (this.size.width * this.currentProgress) / 100,
        this.size.height
      );
    }
    
  }
  
  class Component {
    constructor(object) {
      this.component = object;
      this.component.setDepth(9999)
    }

    setVisible(bool) {
      this.component.setVisible(bool);
    }

    setProgress(progress){
      this.component.setProgress(progress)
    }

    setDepth(value) {
      this.component.setDepth(value);
    }
  }
  
  class HUD {
    constructor(scene) {
      this.scene = scene;
      this.hudVisible = false; // Assuming the HUD is initially visible
  
      // Create HUD components
      this.progressBars = [];
      this.images = [];
      this.textArea;
      this.buttons = [];
      this.cyclingImageButton;
      this.hudComponents = [];
      this.enemiesInRoom = []
      this.choiceButtons = [];
      this.texts = []
      this.riddleVisible = false;
    }
  
    setEnemiesInRoom() {
        this.enemiesInRoom = this.scene.turnHandler.turns.filter((element) => {
            return (element != "player")
        })
        this.enemiesInRoom.forEach((enemy, index) => {
            let obj = this.scene.objectHandler.getObject(enemy)
            this.scene.enemyHandler.checkEnemyForData(enemy)
            this.progressBars[index].component.setProgress(ProgressBar.valueToPercentage(parseInt(obj.getData("health")), 0, parseInt(obj.getData("maxHealth"))))
            this.images[index].component.setTexture(obj.texture)
        })
    }

    create() {
      let scale = this.scene.scale;
      let hudPosition = { x: 0 + 10, y: (scale.height * 2) / 3 };
      let hudHeight = scale.height / 4;
      let sectionHeight = hudHeight / 5;
      let progressBarDimensions = { width: 200, height: 20 };
      let sectionWidth = scale.width;
  
      this.hud = this.scene.add.graphics();
      this.hud.fillStyle(0x000000, 0.8);
      this.hud.fillRect(
        0,
        (scale.height * 2) / 3,
        scale.width,
        scale.height / 3
      );
      this.hud.setScrollFactor(0);
      this.hud = new Component(this.hud);
  
      let barNames = ["progressBar1", "progressBar2", "progressBar3", "progressBar4", "progressBar5"];
  
      this.progressBars = barNames.map((key, i) => {
        let color = 0xFF0000; // Default red color
        let bgColor = 0xF58216; // Default background color
      
        if (i >= 3) { // If it's the fourth or fifth progress bar
          bgColor = 0x676767; // Set background color to black
        }
        if (i === 4) { // If this is the fifth progress bar
          color = 0xFFD700; // Set fill color to gold
        }
      
        let bar;
        if (i < 4) {
          bar = new ProgressBar(
            hudPosition.x ,
            hudPosition.y + sectionHeight * i + progressBarDimensions.height / 0.5,
            progressBarDimensions.width,
            progressBarDimensions.height,
            this.scene,
            4,
            4,
            color, // Add the color
            bgColor // And the background color
          );
        } else {
          bar = new ProgressBar(
            hudPosition.x,
            hudPosition.y + sectionHeight * i + 30,
            progressBarDimensions.width,
            progressBarDimensions.height / 4,
            this.scene,
            4,
            4,
            color, // Add the color
            bgColor // And the background color
          );
        }
        return new Component(bar);
      });
      
      
    
  
      let imageNames = ["orc", "goblin", "skeleton"];
      this.images = imageNames.map((name, i) => {
        let image = this.scene.add
          .image(
            hudPosition.x + sectionWidth / 6 + 5,
            hudPosition.y + sectionHeight * i + progressBarDimensions.height / 0.4,
            name
          )
          .setDepth(9999)
          .setOrigin(0.5) // Set the origin directly using setOrigin()
          .setScrollFactor(0);
        return new Component(image);
      });
      
  
      this.textArea = this.scene.add
        .text(
            hudPosition.x + sectionWidth / 3,
            hudPosition.y + sectionHeight * 2,
            "This is sample Dialogue text",
            { font: "16px Arial", fill: "#ffffff", wordWrap: { width: 300 } },
            
        )
        .setOrigin(0.5) // Set the origin directly using setOrigin()
        .setScrollFactor(0)
        .setDepth(10000);
      this.textArea = new Component(this.textArea)

      let buttonImages = [
        "action",
        "pass",
        "run",
      ];
      let buttonSpacing = sectionHeight / 3;
      let buttonHeight = buttonSpacing * 2.5;
  
      this.buttons = buttonImages.map((img, i) => {
        let button = this.scene.add
          .image(
            hudPosition.x + sectionWidth * 0.875,
            (hudPosition.y + 40) + buttonSpacing  * (i* 6) + buttonSpacing / 1 ,
            img
          )
          .setInteractive()
          .setDepth(9999)
          .setOrigin(0.5) // Set the origin directly using setOrigin()
          .setDisplaySize(sectionWidth / 6, buttonHeight *2)
          .setScrollFactor(0)
        return new Component(button);
      });
      
    // Define an array of image keys
    this.imageKeys = ["shield", "healing", "bow", "sword"];
    // Initialize an index to keep track of the current image
    this.imageIndex = 0;

    // ...

    // Use the initial image key when creating the cyclingImageButton
    this.cyclingImageButton = this.scene.add
        .image(
          hudPosition.x + sectionWidth / 2 + 250,
          hudPosition.y + sectionHeight * 2 + 50,
            this.imageKeys[this.imageIndex]
        )
        .setDepth(9999)
        .setScrollFactor(0)
        .setScale(0.22, 0.22)
        .setCrop(0, 0, 1024, 1024);

    this.cyclingImageButton.setInteractive(); // Makes the image interactive so it can respond to pointer events

    this.cyclingImageButton.on('pointerdown', () => {
    // Change the image of the cyclingImageButton
    this.cyclingImageButton.setTexture(this.imageKeys[this.imageIndex]);

    // Update the image index, loop back to 0 if we've gone past the end of the array
    this.imageIndex = (this.imageIndex + 1) % this.imageKeys.length;
    })
    this.choiceButtons = [];
    this.answers = ["Answer 1", "Answer 2", "Answer 3", "Answer 4"];
    let choiceButtonSpacing = hudPosition.sectionHeight / 8;
    let choiceButtonHeight = choiceButtonSpacing * 2.5;
    let camera = this.scene.cameras.main
    for(let i = 0; i < 4; i++) {
      let choiceButton = this.scene.add
        .image(
          270 + (250 * i),
          100,
          'choiceButton'
        )
        .setInteractive()
        .setDepth(9999)
        .setOrigin(0.5)
        .setScale(0.8, 0.8)
        .setScrollFactor(0)
        .setVisible(0);
      this.choiceButtons.push(new Component(choiceButton));
    
      let text = this.scene.add.text(
        270 + (250 * i), 100,
         '', { color: '#000', fontSize: '16px' })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setVisible(0);
      this.texts.push(new Component(text));
    
      choiceButton.on('pointerdown', () => {
        this.scene.riddler.selectedAnswer = text.text;
      });
    }
    
    this.showButtons();
    this.buttons[0].component.on("pointerdown", () => {
      if (this.scene.turnHandler.turns[0] == "player" && this.scene.turnHandler.currentTurn == "player") {
        
        let weaponKey;
        let weaponObject;
        let spellKey;
        let spellObject;
        // tWeapon = this.scene.dndApiHandler.WeaponObjects.prototype.find(this.cyclingImageButton.texture.key)
        this.scene.eXperience = (this.scene.eXperience + r1d8() + 7)
        switch (this.cyclingImageButton.texture.key) {
            case "sword":
                console.log("Longsword!")
                weaponKey = "Longsword";  // for example
                weaponObject = this.scene.dndApiHandler.weaponObjects.find(weapon => weapon.name === weaponKey);
                if (weaponObject) {
                    console.log(weaponObject);  // Logs the found object to the console
                } else {
                    console.log("No weapon found with the name " + weaponKey);
                }
                this.scene.playerHandler.attack(weaponKey);
                
                break;
            case "shield":
                console.log("block!")
                weaponKey = "Shield";  // for example
                weaponObject = this.scene.dndApiHandler.weaponObjects.find(weapon => weapon.name === weaponKey);
                if (weaponObject) {
                    console.log(weaponObject);  // Logs the found object to the console
                } else {
                    console.log("No weapon found with the name " + weaponKey);
                }
                this.scene.playerHandler.block(weaponObject); // Pass the weaponObject to the block method
                break
            case "bow":
                console.log("bow shot!")
                weaponKey = "Shortbow";  // for example
                weaponObject = this.scene.dndApiHandler.weaponObjects.find(weapon => weapon.name === weaponKey);
                if (weaponObject) {
                    console.log(weaponObject);  // Logs the found object to the console
                } else {
                    console.log("No weapon found with the name " + weaponKey);
                }
                this.scene.playerHandler.attack(weaponKey);
                break
            case "healing":
                console.log("heal!")
                spellKey = "Heal";  // for example
                spellObject = this.scene.dndApiHandler.spellObjects.find(spell => spell.name === spellKey);
                if (spellObject) {
                    const damageRoll = () => {
                      const [dice, modifier] = spellObject.damage.split("+");
                      const [numDice, diceType] = dice.split("d");
                
                      let damage = 0;
                
                      for (let i = 0; i < numDice; i++) {
                        damage += eval(`r1d${diceType}()`); // Evaluate the corresponding dice function
                      }
                
                      if (modifier) {
                        damage += parseInt(modifier);
                      }
                      return damage
                      // Apply damage to the enemy
                    };
                    this.scene.playerHandler.setHealth(this.scene.playerHandler.health + damageRoll())
                    console.log(spellObject);  // Logs the found object to the console
                } else {
                    console.log("No weapon found with the name " + spellKey);
                }
                break;
        }
        this.scene.turnHandler.consumeTurn()
        
      }
    });
    
        this.buttons[1].component.on("pointerdown", () => { this.scene.turnHandler.currentAction = "pass"; this.scene.turnHandler.consumeTurn(); });
        this.buttons[2].component.on("pointerdown", () => { this.scene.turnHandler.currentAction = "run"; });
        
      this.hudComponents.push(
        this.hud,
        ...this.images,
        ...this.progressBars,
        ...this.buttons,
        this.cyclingImageButton,
        this.textArea
      );
      this.scene.tweens.add({
        targets: this.hudComponents.map((component) => { return component }),
        duration: 0,    
        ease: "Power2",
        onComplete: () => {
          this.hudComponents.forEach((component) => {
            component.setVisible(false);
          });
        },
      });
    }

    hideEnemyHealthBar(enemyIndex) {
      if (enemyIndex >= 0 && enemyIndex < this.progressBars.length) {
          this.progressBars[enemyIndex].hide();
      }
    }
    getTextArea() {
        return this.textArea.component;
    }

    showButtons() {
      if (!this.texts || !this.answers) {
        setTimeout (this.showButtons(), 1000)
        return;  // Not ready yet, so we just exit the function
      }
      if (this.scene.riddler.bRiddling) {
        for(let i = 0; i < this.texts.length; i++) {
          this.texts[i].component.setText(this.scene.riddler.sortedRiddle.wrongAnswers[i])
          this.texts[i].component.visible = true;
          this.choiceButtons[i].component.visible = true;
        }
        this.riddleVisible = true;
      }
    }
    
    hideButtons() {
      for(let i = 0; i < 4; i++) {
        this.texts[i].component.visible = false;
        this.choiceButtons[i].component.visible = false;
      }
      this.scene.riddler.bRiddling = false;
      this.riddleVisible = false;
      
    }

    toggleHud() {
      if (this.hudVisible) {
        this.scene.tweens.add({
          targets: this.hudComponents,
          duration: 500,    
          ease: "Power2",
          onComplete: () => {
            this.hudComponents.forEach((component) => {
              component.setVisible(false);
            });
          },
        });
      } else {
        this.scene.tweens.add({
            targets: this.hudComponents,
            duration: 500,    
            ease: "Power2",
            onComplete: () => {
              this.hudComponents.forEach((component) => {
                component.setVisible(true);
              });
            },
          });
        
      }
      this.hudVisible = !this.hudVisible;
    }
  }
  
  export { HUD, ProgressBar };
  