//Turn Handler for turn combat
class TurnHandler {
	constructor() {
		this.turns = [];
		this.currentTurn = "player";
		this.currentAction = "none";
		this.currentTurnAction = "none";
	}
	
	consumeTurn() {
		let currentTurn = this.turns.shift();
		this.addToTurns(currentTurn);
		console.log(this.turns);
	}

	setCurrentAction(action) { this.currentAction = action }
	addToTurns(name) { this.turns.push(name); }
	addToNextTurn(name) { this.turns.unshift(name); }
}

export { TurnHandler }