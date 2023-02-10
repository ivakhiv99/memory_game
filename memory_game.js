window.addEventListener('DOMContentLoaded', () =>{
    const grid = new Grid();

});


class Grid {
    grid = [];
    firstCard = null;
    secondCard = null;

    constructor() {
        this.createGrid(10);
        this.renderGrid();
        console.log(this.grid);
        this.events();
    }

    //TODO: ignore clicks on cards if 2 cards are comparing at the moment 
    events () {
        document.addEventListener('click', ({target}) => {
            if (target.dataset.id) {
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

    createGrid(size) {
        const uniqueCards = [];

        const createUniqueCard = () => {
            const card = new Card();
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
            duplicates.push(new Card(uniqueCard.value))
        });

        this.grid.push(...uniqueCards, ...duplicates);
        this.grid.sort( () => Math.random() - 0.5);
    }

    renderGrid() {
        const gridContainer = document.getElementById('gridContainer');
        this.grid.forEach(cardItem => {
            const card = cardItem.renderCard();
            gridContainer.appendChild(card);
        });
    }

    compareCards() {
        if (this.firstCard.value === this.secondCard.value) {
            //TODO: play success animation
            setTimeout(() => {
                this.resetComparison(true);
            }, 700); 
        } else {
            //TODO: play failure animation
            setTimeout(() => {
                this.resetComparison(false);
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
    constructor(value) {
        this.value = value || this.generateValue();
        this.id = Math.random() + this.value;
        this.isHidden = true;
    }

    generateValue () {
       return Math.floor(Math.random() * 5);
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
    - errors when clicking on other while game compares two cards
    - once got 3 cards with same values. Ids are unique

*/}