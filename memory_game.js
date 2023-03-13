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
        - Add form for game settings
            + Let user configure width and hight of game container
            + Add different game mods: 
                * classic - (what's currently implemented)
                * speedruner - remove animation delays, replace timer with a stopwatch
                * infinite - use 10x10 grid, when 5 pais are matched replace them with newly generated items; give +10s to timer; count score
            + Add better game setting with preview and nice grid width & height selectors
*/}


{/* 
    Bug list: 
        - since tomato theme is loaded as default screen flicks to tobato for a split second before changing to user selected theme

*/}


const hideDOMelements = (elements) => {
    elements.forEach(element => {
        if(element instanceof HTMLElement) {
            element.classList.add('hidden');
        } else throw new Error('hideDOMelements function should accept only HTMLElements ');
    });
}

const showDOMelements = (elements) => {
    elements.forEach(element => {
        if(element instanceof HTMLElement) {
            element.classList.remove('hidden');
        } else throw new Error('showDOMelements function should accept only HTMLElements ');
    });
}


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
        this.getHTMLObjects();
        this.events();
    }

    getHTMLObjects() {
        const startBtn = document.getElementById('startButton');
        const restartBtn = document.getElementById('restartButton');
        const exitButton = document.getElementById('exitButton');
        const gridContainer = document.getElementById('gridContainer');
        const gameSettings = document.getElementById('gameSettings');
        const timer = document.getElementById('timer'); 
        const endGameModal = document.getElementById('endGameModal');
        const playAgainButton = document.getElementById('playAgainButton');
        const exitToMenuButton = document.getElementById('exitToMenuButton');
        const modalTitle = document.querySelector("#endGameModal>h2");
        const modalText = document.querySelector("#endGameModal>p");

        this.htmlObjects = {
            startBtn,
            restartBtn,
            exitButton,
            gridContainer,
            gameSettings,
            timer,
            endGameModal,
            playAgainButton,
            exitToMenuButton,
            modalTitle,
            modalText,
        }
    }

    events() {
        const {
            startBtn,
            restartBtn,
            exitButton,
            gridContainer,
            gameSettings,
            timer,
            playAgainButton,
            exitToMenuButton    
        } = this.htmlObjects;

        restartBtn.addEventListener('click', () => {
            this.restartGame();
        });

        exitButton.addEventListener('click', () => {
            hideDOMelements([exitButton, gridContainer, timer, restartBtn]);
            showDOMelements([startBtn, gameSettings]);
            this.inGameCurrently = false;
            this.exitGame();
        });
        
        document.addEventListener('timeout', () => {
            this.showGameOver(false);
        });

        document.addEventListener('victory', () => {
            this.gameTimer.stopTimer();
            this.showGameOver(true);
        });

        playAgainButton.addEventListener('click', () => {
            hideDOMelements([endGameModal]);
            this.restartGame();
            this.gameTimer.startTimer();
            restartBtn.disabled = false;
            exitButton.disabled = false;
        });

        exitToMenuButton.addEventListener('click', () => {
            hideDOMelements([endGameModal, exitButton, gridContainer, timer, restartBtn]);
            showDOMelements([startBtn, gameSettings]);
            this.inGameCurrently = false;
            this.exitGame();
            restartBtn.disabled = false;
            exitButton.disabled = false;
        });
    } 

    updateSettings(settings) {
        this.settings = settings;
        this.startGame();
    }

    startGame() {
        const {
            restartBtn,
            exitButton,
            gridContainer,
            gameSettings,
            timer,
        } = this.htmlObjects;

        hideDOMelements([gameSettings]);
        showDOMelements([gridContainer, exitButton, timer, restartBtn]);

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

    showGameOver(victory) {
        const {
            endGameModal,
            playAgainButton,
            exitButton,
            restartBtn,
            modalTitle,
            modalText,
        } = this.htmlObjects;

        restartBtn.disabled = true;
        exitButton.disabled = true;

        if (victory) {
            modalTitle.innerHTML = 'You won!';
            modalText.innerHTML = 'You can play again or exit and change game settings';
            playAgainButton.innerHTML = 'play again';
        } else {
            modalTitle.innerHTML = 'Game Over';
            modalText.innerHTML = 'You can try again or exit and change game settings';
            playAgainButton.innerHTML = 'try again';
        }


        showDOMelements([endGameModal]);
    }
}

class GameSettings {
    rowsNumberSelected = 4;
    columnsNumberSelected = 4;
    timeLimit = 60;

    constructor(game) {
        this.game = game;
        this.getHTMLObjects();
        const { startBtn, themeLink, rowsInput, columnsInput } = this.htmlObjects;
        rowsInput.value = this.rowsNumberSelected;
        columnsInput.value = this.columnsNumberSelected;
        startBtn.disabled = false;
        
        
        const previewGrid = new PreviewGrid({
            columns: this.columnsNumberSelected,
            rows: this.rowsNumberSelected,
        });

        const savedTheme = localStorage.getItem('theme');
        switch(savedTheme) {
            case 'light': {
                themeLink.href = 'themes/light.css';
                break;
            }
            case 'dark': {
                themeLink.href = 'themes/dark.css';
                break;
            }

            case 'tomato': {
                themeLink.href = 'themes/tomato.css';
                break;
            }
            
            default: break; 
        }

        this.events();
    }

    getHTMLObjects() {
        const startBtn = document.getElementById('startButton');
        const rowsInput = document.querySelector('input[name="rows"]');
        const columnsInput = document.querySelector('input[name="columns"]');
        const timeLimitInput = document.getElementById('timeLimit');
        const timeLimitLabel = document.querySelector('label[for="timeLimit"]');

        const themeLink = document.getElementById('themeLink');
        const lightBtn = document.querySelector('#gameSettings>.buttons>[data-theme="light"]');
        const darkBtn = document.querySelector('#gameSettings>.buttons>[data-theme="dark"]');
        const tomatoBtn = document.querySelector('#gameSettings>.buttons>[data-theme="tomato"]');


        this.htmlObjects = {
            darkBtn,
            tomatoBtn,
            themeLink,
            lightBtn,
            startBtn,
            rowsInput,
            columnsInput,
            timeLimitInput,
            timeLimitLabel,
        }
    }

    events() {
        const {
            themeLink,
            darkBtn,
            tomatoBtn,
            lightBtn,
            startBtn,
            rowsInput,
            columnsInput,
            timeLimitInput,
            timeLimitLabel,
        } = this.htmlObjects;

        lightBtn.addEventListener('click', () => {
            themeLink.href = 'themes/light.css';
            this.saveTheme('light');
        });

        darkBtn.addEventListener('click', () => {
            themeLink.href = 'themes/dark.css';
            this.saveTheme('dark');
        });

        tomatoBtn.addEventListener('click', () => {
            themeLink.href = 'themes/tomato.css';
            this.saveTheme('tomato');
        });


        rowsInput.addEventListener('input', (e) => {
            this.rowsNumberSelected = e.target.value;
            this.validate();
        });

        columnsInput.addEventListener('input', (e) => {
            this.columnsNumberSelected = e.target.value;
            this.validate();
        });            

        startBtn.addEventListener('click', () => {
            hideDOMelements([startBtn]);
            this.updateSettings();
        });

        timeLimitInput.addEventListener('input', (e) => {
            timeLimitLabel.innerHTML = `You'll have ${e.target.value} seconds`;
            this.timeLimit = e.target.value;
        })
    }

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    validate() {
        const { startBtn } = this.htmlObjects;
        const isEven = (this.columnsNumberSelected * this.rowsNumberSelected)%2 == 0; 
        const correctNumberOfRows = this.rowsNumberSelected > 0 && this.rowsNumberSelected <= 10;
        const correctNumberOfColumns = this.columnsNumberSelected > 0 && this.columnsNumberSelected <= 10;

        if (!correctNumberOfRows || !correctNumberOfColumns|| !isEven) {
            startBtn.disabled = true;
        } else {
            startBtn.disabled = false;
        }
    }

    updateSettings() {
        this.game.updateSettings({
            timeLimit: this.timeLimit,
            columns: this.columnsNumberSelected,
            rows: this.rowsNumberSelected,
        });
    }
}


class Timer {
    timeLimit;
    timeLeft;
    pause = false;

    constructor(timeLimit) {
        this.timeLimit = timeLimit;
        this.timeLeft = timeLimit;
        this.getHTMLObjects();
        this.startTimer();
        this.handleAutoPause();
    }

    getHTMLObjects() {
        const timer = document.getElementById('timer'); 
        const gameZone = document.getElementById('gameContainer');


        this.htmlObjects = {
            timer,
            gameZone
        }
    }

    startTimer() {
        const { timer } = this.htmlObjects;
        timer.innerHTML = this.timeLeft;
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
        const { timer } = this.htmlObjects;

        document.dispatchEvent(new Event('timeout'));
        this.removeTimer();
        timer.innerHTML = 0;
    }

    handleAutoPause() {
        const { gameZone } = this.htmlObjects;
        gameZone.addEventListener('mouseout', () => this.pause = true);
        gameZone.addEventListener('mouseover', () => this.pause = false);
    }

    stopTimer() {
        clearInterval(this.timerId);
        this.pause = true;
    }

    removeTimer() {
        this.timeLeft = this.timeLimit;
        clearInterval(this.timerId);
        this.pause = true;
    }

    resetTimer() {
        const { timer } = this.htmlObjects;
        this.timeLeft = this.timeLimit;
        timer.innerHTML = this.timeLeft;
        this.pause = false;
    }
}

class Grid {
    grid = [];
    firstCard = null;
    secondCard = null;
    currentlyComparing = false;
    cardPairsLeft = this.grid.length/2;

    constructor({columns, rows}) {
        this.columns = columns;
        this.rows = rows;
        this.maxCardValue = (rows*columns)/2;
        this.getHTMLObjects();
        this.createGrid(rows*columns);
        this.renderGrid();
        this.events();
    }


    getHTMLObjects() {
        const gridContainer = document.getElementById('gridContainer');

        this.htmlObjects = {
            gridContainer
        }
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
        this.cardPairsLeft = this.grid.length/2;
    }


    //TODO: play some animation when grid is loaded
    renderGrid(reRender) {
        const { gridContainer } = this.htmlObjects;

        // Do I need reRender?
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
        const { gridContainer } = this.htmlObjects;

        while(gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.lastChild);
        }
        this.grid = [];
        this.createGrid(this.maxCardValue*2);
    }

    events () {
        document.addEventListener('click', ({target}) => {
            if (target.dataset.id && !this.currentlyComparing && target.classList.contains('hiddenCard')) {
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
            this.animateMatch();
            this.currentlyComparing = true;
            setTimeout(() => {
                this.resetComparison(true);
                this.currentlyComparing = false;
            }, 700); 
        } else {
            this.animateMismatch();
            this.currentlyComparing = true;
            setTimeout(() => {
                this.resetComparison(false);
                this.currentlyComparing = false;
            }, 1050); 
        }
    }

    animateMismatch() {
        const rollLeft = {
            value: 10,
            duration: 350,
            easing: 'spring(1, 80, 10, 0)',
        };
        const rollRight = {
            value: -10,
            duration: 350,
            easing: 'spring(1, 80, 10, 0)',
        };
        const rollBack = {
            value: 0,
            duration: 350,
            easing: 'spring(1, 80, 10, 0)',
        };

        anime({
            targets: document.querySelector(`[data-id="${this.firstCard.id}"]`),
            borderRadius: ['0%', '20%', '0%'],
            // backgroundColor: ['#008080', '#FF6347', '#000000'],
            duration: 1050,
            rotate: [rollLeft, rollRight, rollBack ],
        });
        anime({
            targets: document.querySelector(`[data-id="${this.secondCard.id}"]`),
            borderRadius: ['0%', '20%', '0%'],
            // backgroundColor: ['#008080', '#FF6347', '#000000'],
            duration: 1050,
            rotate: [rollRight, rollLeft , rollBack ],
        });
    }

    animateMatch() {
        anime({
            targets: [
                document.querySelector(`[data-id="${this.firstCard.id}"]`),
                document.querySelector(`[data-id="${this.secondCard.id}"]`),
            ],
            scale: [1.2, 1],
            borderRadius: ['20%', '0%'],
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 1050,
        })
    }

    resetComparison (success) {
        if (success) {
            this.firstCard = null;
            this.secondCard = null;
            this.cardPairsLeft = this.cardPairsLeft - 1;
        } else {
            this.firstCard.flipCard();
            this.secondCard.flipCard();
            this.firstCard = null;
            this.secondCard = null;
        }
        if(this.cardPairsLeft === 0) {
            document.dispatchEvent(new Event('victory'))
        }
    }

}

// should inherit or extend Grid class
class PreviewGrid {
    constructor({columns, rows}) {
        this.columns = columns;
        this.rows = rows;
        this.getHTMLObjects();
        this.renderGrid();
        this.events();
    }

    getHTMLObjects() {
        const gridPreview = document.getElementById('gridPreview');
        const rowsInput = document.querySelector('input[name="rows"]');
        const columnsInput = document.querySelector('input[name="columns"]');

        this.htmlObjects = {
            gridPreview,
            rowsInput,
            columnsInput,
        };
    }

    events() {
        const { rowsInput,  columnsInput } = this.htmlObjects;

        rowsInput.addEventListener('input', (e) => {
            this.rows = e.target.value;
            this.clearGrid();
            this.renderGrid();
        });

        columnsInput.addEventListener('input', (e) => {
            this.columns = e.target.value;
            this.clearGrid();
            this.renderGrid();
        }); 
    }

    clearGrid() {
        const { gridPreview } = this.htmlObjects;

        while(gridPreview.firstChild) {
            gridPreview.removeChild(gridPreview.lastChild);
        }
    };

    renderGrid() {
        const { gridPreview } = this.htmlObjects;

        const cardsCount = this.columns * this.rows;
        const cards = [];
        for (let i = 0 ; i < cardsCount; i ++) {
            cards.push(new PreviewCard());
        };

        let itemIndex = 0;
        for (let r = 0; r < this.rows; r++) {
            const row = document.createElement('div'); 

            for (let c = 0; c < this.columns; c++) {
                const card = cards[itemIndex].renderCard();
                row.appendChild(card);
                itemIndex ++;
            }
            gridPreview.appendChild(row);
        }
    }
}

// should inherit or extend Card class
class PreviewCard {
    constructor() {

    }

    renderCard () {
        const card = document.createElement('div');
        card.dataset.id = this.id;
        card.className = 'previewCardItem';
        card.classList.add('hiddenCard');
        return card;
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
        return card;
    }

    flipCard () {
        this.isHidden = !this.isHidden;
        const card = document.querySelector(`[data-id="${this.id}"]`);
        if (this.isHidden) {
            card.classList.add('hiddenCard');
            card.innerHTML = '';
        } else {
            card.classList.remove('hiddenCard');
            card.innerHTML = this.value;
        }
    }

}

// better class GameSettings {
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