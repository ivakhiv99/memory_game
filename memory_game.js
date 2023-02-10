window.addEventListener('DOMContentLoaded', () =>{
    const grid = new Grid();

});


class Grid {
    grid = [];
    activeCard = null;
    secondCard = null;

    constructor() {
        this.createGrid(10);
        this.renderGrid();
        console.log(this.grid);
        this.events();
    }

    events () {
        document.addEventListener('click', ({target}) => {
            const cardIndex = this.grid.indexOf(card => target.dataset.id == card.id);
            console.log(this.grid[cardIndex], target.dataset.id)
            this.activeCard = this.grid[cardIndex];
            this.activeCard.flipCard();
        });
    }

    createGrid(size) {
        //generate half array of unique cards
        const uniqueCards = [];

        const createUniqueCard = () => {
            const card = new Card();
            if(!uniqueCards.find((item) => item.value === card.value)) {
                uniqueCards.push(card);
            } else {
                createUniqueCard();
            }
        }

        for(let i = 0; i <size/2; i ++) {
            createUniqueCard();
        }

        //generate other half with the same values based of half array
        const duplicates = []
        uniqueCards.forEach(uniqueCard => {
            duplicates.push(new Card(uniqueCard.value))
        });

        //combine and shuffle arrays
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

    }
}


class Card {
    constructor(value) {
        this.value = value || this.generateValue();
        this.id = Math.random() + this.value;
        this.isHidden = true;
    }

    showValue () {
        console.log(this.value);
    }

    generateValue () {
       return Math.floor(Math.random() * 5);
    }

    renderCard () {
        const card = document.createElement('div');
        card.dataset.id = this.id;
        card.className = 'cardItem';
        if(this.isHidden) {
            card.classList.add('hidden');
        }
        card.innerHTML = this.value;

        console.log({card}, this.id)
        return card;
    }

    flipCard () {
        this.isHidden = !this.isHidden;
        if(this.isHidden) {
            card.classList.add('hidden');
        } else {
            card.classList.remove('hidden');
        }
    }

}