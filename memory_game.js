window.addEventListener('DOMContentLoaded', () => {
    defaultGameSettings = {
        columns: 6,
        rows: 5,
        timeLimitSeconds: 60,
    }
    const game = new Game(defaultGameSettings);
    const gameSettingsForm = new GameSettings(game);
});


{/*
    Game TODO:
        - Show victory modal when game is won
            + Detect victory 
        - Show victory modal when game is lost due to timeout
            + Handle timeout event
        - Add form for game settings
            + Let user configure width and hight of game container
            + Let user select theme 
*/}

class Game {
    inGameCurrently = false;
    currentGrid = null;
    settings = null
    gameTimer = null;

    constructor({
        columns,
        rows,
        timeLimitSeconds,
    }) {
        this.settings = {
            timeLimit: timeLimitSeconds,
            columns: columns,
            rows: rows,
        }

        this.events();
    }

    events() {
        const startBtn = document.getElementById('startButton');
        const restartBtn = document.getElementById('restartButton');
        const exitButton = document.getElementById('exitButton');
        const gridContainer = document.getElementById('gridContainer');
        const gameSettings = document.getElementById('gameSettings');
        const timer = document.getElementById('timer'); 

        //TODO: start game logic needs refactoring
        restartBtn.addEventListener('click', () => {
            this.restartGame();
        });

        exitButton.addEventListener('click', () => {
            exitButton.classList.add('hidden');
            gridContainer.classList.add('hidden');
            timer.classList.add('hidden');
            restartBtn.classList.add('hidden');
            startBtn.classList.remove('hidden');
            gameSettings.classList.remove('hidden');
            this.inGameCurrently = false;
            this.exitGame();
        });
    } 

    updateSettings(settings) {
        this.settings = settings;
        this.startGame();
    }

    startGame() {
        const restartBtn = document.getElementById('restartButton');
        const exitButton = document.getElementById('exitButton');
        const gridContainer = document.getElementById('gridContainer');
        const gameSettings = document.getElementById('gameSettings');
        const timer = document.getElementById('timer'); 
        
        gameSettings.classList.add('hidden');
        gridContainer.classList.remove('hidden');
        exitButton.classList.remove('hidden');
        timer.classList.remove('hidden');
        restartBtn.classList.remove('hidden');

        this.inGameCurrently = true;

        const gridConfig = {
            columns: this.settings.columns,
            rows: this.settings.rows,
        }
        this.currentGrid = new Grid(gridConfig);
        this.gameTimer = new Timer(this.settings.timeLimit);
    }

    exitGame() {
        this.currentGrid.clearGrid(true);
        this.gameTimer.removeTimer();
    }

    restartGame() {
        this.currentGrid.renderGrid(true);
        this.gameTimer.resetTimer();
    }
}

class GameSettings {
    rowsNumberSelected = 2;
    columnsNumberSelected = 2;
    timeLimit = 60;

    constructor(game) {
        this.game = game;
        this.events();
    }

    events() {
        const startBtn = document.getElementById('startButton');
        const rowsInput = document.querySelector('input[name="rows"]')
        const columnsInput = document.querySelector('input[name="columns"]')
        
        const timeLimitInput = document.getElementById('timeLimit')
        const timeLimitLabel = document.querySelector('label[for="timeLimit"]')


        rowsInput.addEventListener('input', (e) => {
            this.rowsNumberSelected = e.target.value;
        });

        columnsInput.addEventListener('input', (e) => {
            this.columnsNumberSelected = e.target.value;
        });            

        startBtn.addEventListener('click', () => {
            startBtn.classList.add('hidden');
            this.updateSettings();
        });

        timeLimitInput.addEventListener('input', (e) => {
            timeLimitLabel.innerHTML = `You'll have ${e.target.value} seconds`;
            this.timeLimit = e.target.value;
        })
    }

    updateSettings() {
        this.game.updateSettings({
            timeLimit: this.timeLimit,
            columns: this.rowsNumberSelected,
            rows: this.columnsNumberSelected,
        });
    }



}

// class Form {
//     rowsAvailable
//     columbsAvailable
//     rowsNumberSelected
//     columnsNumberSelected
//     timeLimit

//     constructor()

//     calculateAvailable()
//     updateAvailableRows()
//     updateAvailableColumns()

//     updateSettings()
// }

class Timer {
    timeLimit;
    timeLeft;
    pause = false;

    constructor(timeLimit) {
        this.timeLimit = timeLimit;
        this.timeLeft = timeLimit;
        this.startTimer();
        this.handleAutoPause();
    }

    startTimer() {
        const timer = document.getElementById('timer'); 

        this.timerId = setInterval(() => {
            timer.innerHTML = this.timeLeft;
            if(this.timeLeft > 0) {
                if (!this.pause) {
                    this.timeLeft--;
                }
            } else {
                this.handleTimeout();
            }
        }, 1000);
    }

    handleTimeout() {
        alert('timeout');
        this.removeTimer();
        const timer = document.getElementById('timer'); 
        timer.innerHTML = 0;
    }

    handleAutoPause() {
        const gameZone = document.getElementById('gameContainer');
        gameZone.addEventListener('mouseout', () => this.pause = true);
        gameZone.addEventListener('mouseover', () => this.pause = false);
    }

    pauseTimer() {
        this.pause = true;
    }

    removeTimer() {
        this.timeLeft = this.timeLimit;
        clearInterval(this.timerId);
        const timer = document.getElementById('timer'); 
        timer.innerHTML = '';
    }

    resetTimer() {
        this.timeLeft = this.timeLimit;
        const timer = document.getElementById('timer'); 
        timer.innerHTML = this.timeLimit;
    }
}

class Grid {
    grid = [];
    firstCard = null;
    secondCard = null;
    currentlyComparing = false;

    constructor({columns, rows}) {
        this.columns = columns;
        this.rows = rows;
        this.maxCardValue = (rows*columns)/2;

        this.createGrid(rows*columns);
        this.renderGrid();
        this.events();

    }

    createGrid(size) {
        const uniqueCards = [];

        const createUniqueCard = () => {
            const card = new Card(this.maxCardValue);
            if (!uniqueCards.find((item) => item.value === card.value)) {
                uniqueCards.push(card);
            } else {
                createUniqueCard();
            }
        }

        for(let i = 0; i <size/2; i ++) {
            createUniqueCard();
        }

        const duplicates = []
        uniqueCards.forEach(uniqueCard => {
            duplicates.push(new Card(this.maxCardValue, uniqueCard.value))
        });

        this.grid.push(...uniqueCards, ...duplicates);
        this.grid.sort(() => Math.random() - 0.5);
    }


    //TODO: play some animation when grid is loaded
    renderGrid(reRender) {
        const gridContainer = document.getElementById('gridContainer');

        if (reRender) {
            this.clearGrid();
        }

        let itemIndex = 0;
        for (let r = 0; r < this.rows; r++) {
            const row = document.createElement('div'); 

            for (let c = 0; c < this.columns; c++) {
                const card = this.grid[itemIndex].renderCard();
                row.appendChild(card);
                itemIndex ++;
            }
            gridContainer.appendChild(row);
        }
    }

    clearGrid() {
        const gridContainer = document.getElementById('gridContainer');
        while(gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.lastChild);
        }
        this.grid = [];
        this.createGrid(this.maxCardValue*2);
    }

    events () {
        document.addEventListener('click', ({target}) => {
            if (target.dataset.id && !this.currentlyComparing) {
                const clickedCard = this.grid.find(card => target.dataset.id == card.id);
                if (!this.firstCard) {
                    this.firstCard = clickedCard;
                    this.firstCard.flipCard();
                } else {
                    this.secondCard = clickedCard;
                    this.secondCard.flipCard();
                    this.compareCards();
                }
            }
        });
    }

    compareCards() {
        if (this.firstCard.value === this.secondCard.value) {
            //TODO: play success animation
            this.currentlyComparing = true;
            setTimeout(() => {
                this.resetComparison(true);
                this.currentlyComparing = false;
            }, 700); 
        } else {
            //TODO: play failure animation
            this.currentlyComparing = true;
            setTimeout(() => {
                this.resetComparison(false);
                this.currentlyComparing = false;
            }, 700); 
        }
    }

    resetComparison (success) {
        if (success) {
            this.firstCard = null;
            this.secondCard = null;
        } else {
            this.firstCard.flipCard();
            this.secondCard.flipCard();
            this.firstCard = null;
            this.secondCard = null;
        }
    }

}

class Card {
    constructor(maxValue, value) {
        this.value = value || this.generateValue(maxValue);
        this.id = Math.random() + this.value;
        this.isHidden = true;
    }

    generateValue (maxValue) {
       return Math.floor(Math.random() * maxValue + 1);
    }

    renderCard () {
        const card = document.createElement('div');
        card.dataset.id = this.id;
        card.className = 'cardItem';
        if (this.isHidden) {
            card.classList.add('hiddenCard');
        }
        card.innerHTML = this.value;
        return card;
    }

    flipCard () {
        this.isHidden = !this.isHidden;
        const card = document.querySelector(`[data-id="${this.id}"]`);
        if (this.isHidden) {
            card.classList.add('hiddenCard');
        } else {
            card.classList.remove('hiddenCard');
        }
    }

}

{/*
Bug list: 
  

*/}