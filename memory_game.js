window.addEventListener('DOMContentLoaded', () => {
    config = {
        gridSize: 20
    }
    const game = new Game();
    

});


{/*
    Game TODO:
        - Show victory modal when game is won
            + Detect victory 
        - Show victory modal when game is lost due to timeout
            + Show time left 
            + Update timer
            + Pause timer when mouse is outside of game container
        - Add form for game settings
            + Let user configure time limit 
            + Let user configure width and hight of game container
            + Let user configure number of rows and columns 
            + Let user select theme 

*/}

class Game {
    inGameCurrently = false;
    timeLimit = 60;
    timeLeft = this.timeLimit;
    currentGrid = null;

    constructor() {
        this.events();
    }

    events () {
        const startBtn = document.getElementById('startButton');
        startBtn.addEventListener('click', () => {
            if (this.inGameCurrently) {
                this.restartGame();

            } else {
                const gridContainer = document.getElementById('gridContainer');
                gridContainer.classList.remove('disabled');
                this.startGame();
                this.inGameCurrently = true;
                startBtn.innerHTML = 'restart';
            }
        });
    } 

    startGame () {
        this.currentGrid = new Grid(config);
    }

    restartGame () {
        this.currentGrid.renderGrid(true)
    }
}

class Grid {
    grid = [];
    firstCard = null;
    secondCard = null;
    currentlyComparing = false;

    constructor({gridSize}) {
        this.maxValue = gridSize/2;
        this.createGrid(gridSize);
        this.renderGrid();
        this.events();

    }

    createGrid(size) {
        const uniqueCards = [];

        const createUniqueCard = () => {
            const card = new Card(this.maxValue);
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
            duplicates.push(new Card(this.maxValue, uniqueCard.value))
        });

        this.grid.push(...uniqueCards, ...duplicates);
        this.grid.sort(() => Math.random() - 0.5);
    }


    //TODO: play some animation when grid is loaded
    renderGrid(reDraw) {
        const gridContainer = document.getElementById('gridContainer');

        if(reDraw) {
            while(gridContainer.firstChild) {
                gridContainer.removeChild(gridContainer.lastChild);
            }
            this.grid = [];
            this.createGrid(this.maxValue*2);
        }
        this.grid.forEach(cardItem => {
            const card = cardItem.renderCard();
            gridContainer.appendChild(card);
        });
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
            card.classList.add('hidden');
        }
        card.innerHTML = this.value;
        return card;
    }

    flipCard () {
        this.isHidden = !this.isHidden;
        const card = document.querySelector(`[data-id="${this.id}"]`);
        if (this.isHidden) {
            card.classList.add('hidden');
        } else {
            card.classList.remove('hidden');
        }
    }

}

{/*
Bug list: 
  

*/}