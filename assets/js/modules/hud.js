
class ProgressBar {
    constructor(posX, posY, width, height, scene, borderX=0, borderY=0, color=0xffffff, bgColor=0x111111) {
        this.scene = scene
        this.pos = {
            x: posX, 
            y: posY
        }
        this.size = {
            width: width,
            height: height
        }
        this.targetProgress = 0;
        this.currentProgress = 0;
        this.color = color
        this.bg = this.scene.add.graphics();
        this.bg.setScrollFactor(0);
        this.bg.fillStyle(bgColor, 1);
        this.bg.fillRect(this.pos.x - borderX, this.pos.y - borderY, this.size.width + (borderX * 2) , this.size.height + (borderY * 2));
        this.progress = this.scene.add.graphics();
        this.progress.setScrollFactor(0);
        this.progress.fillStyle(color, 0.7);
        this.progress.fillRect(this.pos.x, this.pos.y, 0, this.size.height);
        this.setProgress(100);
    }
    
    static valueToPercentage(value, min, max) { return ((value - min) * 100) / (max - min) }

    setProgress(progress) {
        this.currentProgress = progress;
        this.progress.clear();
        this.progress.setScrollFactor(0);
        this.progress.fillStyle(this.color, 0.7);
        this.progress.fillRect(this.pos.x, this.pos.y, this.size.width * (this.currentProgress / 100), this.size.height);
    }
    setVisible(bool) { this.progress.setVisible(bool); this.bg.setVisible(bool); }
}

class Component {
    constructor(object) {
        this.component = object
        this.origin = {}
    }

    setOrigin() {
        this.origin = {x: this.component.x, y: this.component.y}
    }

    setVisible(bool) {
        this.component.setVisible(bool)
    }
    
}

class HUD {
    constructor(scene) {
        this.scene = scene;
        this.hudVisible = true;  // Assuming the HUD is initially visible

        // Create HUD components
        this.progressBars = [];
        this.images = [];
        this.textArea;
        this.buttons = [];
        this.cyclingImageButton;
        this.hudComponents = [];
    }
	
    create() {
        let scale = this.scene.scale;
        let hudPosition = { x: 0, y: (scale.height * 2) / 3 }; 
        let hudHeight = scale.height / 3;
        let sectionHeight = hudHeight / 4;
        let progressBarDimensions = { width: 200, height: 20 };
        let sectionWidth = scale.width;

        this.hud = new Component(this.scene.add.graphics())
        this.hud.component.fillStyle(0x000000, 0.8);
        this.hud.component.fillRect(
            0,
            (scale.height * 2) / 3,
            scale.width,
            scale.height / 3
        );
        this.hud.component.setScrollFactor(0);
        this.hud.setOrigin()

        //if we wrap the elements in that component class itll be able to remember their original location and use that to return to, they were all returning to the same place before//

        let barNames = ["progressBar1", "progressBar2", "progressBar3"];

        this.progressBars = barNames.map((key, i) => {
            let bar = new ProgressBar(
                hudPosition.x, 
                hudPosition.y + sectionHeight * i + progressBarDimensions.height / 0.5,
                progressBarDimensions.width, progressBarDimensions.height,
                this.scene,
                3, 3
            )
            return bar
        })
        

        let imageNames = ["orc", "goblin", "skeleton"];
        this.images = imageNames.map((name, i) => {
            let image = this.scene.add
                .image(
                    hudPosition.x + sectionWidth / 6,
                    hudPosition.y + sectionHeight * i + sectionHeight / 1.2,
                    name
                )
                .setDepth(9999);
            image.setOrigin(0.5);
            image.setScrollFactor(0);
            return image;
        });

        this.textArea = this.scene.add.text(
            hudPosition.x + sectionWidth / 3,
            hudPosition.y + sectionHeight * 2,
            "This is sample Dialogue text",
            { font: "16px Arial", fill: "#ffffff" }
        );
        this.textArea.setOrigin(0.5);
        this.textArea.setScrollFactor(0).setDepth(10000);

        let buttonImages = [
            "actionButtonImage",
            "passButtonImage",
            "runButtonImage",
        ];
        let buttonSpacing = scale.height / 3 / 4;
        let buttonHeight = buttonSpacing * 0.8;

        this.buttons = buttonImages.map((img, i) => {
            let button = this.scene.add
                .image(
                    hudPosition.x + sectionWidth * 0.875,
                    hudPosition.y + buttonSpacing * i + buttonSpacing / 1,
                    img
                )
                .setInteractive()
                .setDepth(9999);
            button.setOrigin(0.5);
            button.setDisplaySize(sectionWidth / 6, buttonHeight);
            button.setScrollFactor(0);
            return button;
        });

        this.buttons[0].on("pointerdown", () => {
            console.log("Action");
        });
        this.buttons[1].on("pointerdown", ()=> { this.scene.playerPassTurn() });
        this.buttons[2].on("pointerdown", () => { this.scene.playerRun() });

        this.cyclingImageButton = this.scene.add
            .image(
                hudPosition.x + sectionWidth / 1.25,
                hudPosition.y + sectionHeight * 2 + sectionHeight / 1.5,
                "orc"
            )
            .setDepth(9999);
        this.cyclingImageButton.setOrigin(0.5);
        this.cyclingImageButton.setScrollFactor(0);
        
		this.hudComponents.push(...this.images, ...this.progressBars, ...this.buttons, this.cyclingImageButton, this.textArea, this.hud); 
        console.log(this.hudComponents)
    }

    toggleHud() {
        console.log(this.hudComponents);
        if (this.hudVisible) {
          this.scene.tweens.add({
            targets: this.hudComponents,
            y: this.scene.scale.height,
            duration: 500,
            ease: "Power2",
            onComplete: () => {
              this.hudComponents.forEach((component) => {
                  component.setVisible(false);
              });
            },
          });
        } else {
          this.hudComponents.forEach((component) => {
            component.setVisible(true);
            if (component.origin) {  // check if origin is defined
                this.scene.tweens.add({
                    targets: component,
                    y: component.origin.y,
                    duration: 500,
                    ease: "Power2",
                });
            }
          });
        }
        this.hudVisible = !this.hudVisible;
    
      }
      

}

export { HUD, ProgressBar }