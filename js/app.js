'use strict'

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

let selectedCards = [];
let numberOfMoves = 0;
let numberOfMatches = 0;
let numberOfStars = 3;
let startTime = null;
let timerHandler;
let elapsedTime


// Create a list that holds all of your cards
const cardNames = [
  "diamond",
  "paper-plane-o",
  "anchor",
  "bolt",
  "cube",
  "leaf",
  "bicycle",
  "bomb"
];

const initializeGame = function() {
  selectedCards = [];
  numberOfMoves = 0;
  numberOfMatches = 0;
  numberOfStars = 3;  
  shuffledCards();
  showStars(numberOfMoves);
  displayMoves(numberOfMoves);
  stopTimer();
  clearTimer();
};

// shuffle the cards and render them on the page
const shuffledCards = function() {
  const completeCardNames = [].concat(cardNames).concat(cardNames);
  const shuffledCardNames = shuffle(completeCardNames);
  const deck = document.querySelector(".deck");
  let html = "";

  shuffledCardNames.forEach(cardName => {
    html += `<li class="card" data-card-name="${cardName}">
                <i class="fa fa-${cardName}"></i>
            </li>`;
  });

  deck.innerHTML = html;
};

const isCardActive = function(card) {
  return (
    !card.classList.contains("open") &&
    !card.classList.contains("show") &&
    !card.classList.contains("match")
  );
};

const doCardsMatch = function(cards) {
  if (cards.length === 2) {
    return (
      selectedCards[0].getAttribute("data-card-name") ===
      selectedCards[1].getAttribute("data-card-name")
    );
  } else {
    return false;
  }
};

//attach the event handler to the click event
document.querySelector(".deck").addEventListener("click", event => {
  if (event.target.localName.toLowerCase() === "li" || event.target.localName.toLowerCase() === "i") {
    startTimer();

    let liElement = event.target;

    if (event.target.localName.toLowerCase() === "i") {
        liElement = liElement.parentElement;
    }

    if (isCardActive(liElement)) {
      if (selectedCards.length < 2) {
        liElement.classList.add("open", "show");

        selectedCards.push(liElement);

        if (selectedCards.length === 2) {
          numberOfMoves++;
          checkIfCardsMatch();
          showStars(numberOfMoves);
          displayMoves(numberOfMoves);
          checkIfPlayerHasWon();
        }
      }
    } else {
      console.log(`Don't do anything as card is no longer active`);
    }
  }
});

document.querySelector(".restart").addEventListener("click", () => {
  initializeGame();
});

const showStars = function(numberOfMoves) {

  // determin how many stars to show
  if (numberOfMoves <= 8) {
    numberOfStars = 3;
  } else if (numberOfMoves <= 16) {
    numberOfStars = 2;
  } else {
    numberOfStars = 1;
  }

  const starLiElements = document.querySelectorAll(".stars li");

  //re-initialiaze the stars
  starLiElements.forEach(ele => {
    ele.classList.add("stars-hidden");
    ele.classList.remove("stars-excellent", "stars-good", "stars-average");
  });

// show number of stars (plus color) depending on the number of moves
  for (let counter = 1; counter <= numberOfStars; counter++) {
    const current = starLiElements[counter - 1];
    current.classList.remove("stars-hidden");
    current.classList.add(getStarsColor(numberOfStars));
  }
};

const getStarsColor = function(numberOfStars) {
  let starsColor = "";
  switch (numberOfStars) {
    case 3:
      starsColor = "stars-excellent";
      break;
    case 2:
      starsColor = "stars-good";
      break;
    default:
      starsColor = "stars-average";
  }

  return starsColor;
};

const displayMoves = function(numberOfMoves) {
  const moveElement = document.querySelector(".moves");
  moveElement.textContent =
    numberOfMoves.toString() + (numberOfMoves <= 1 ? " Move" : " Moves");
};

const startTimer = function() {
  if (startTime === null) {
    startTime = new Date();

    // setup the job to refresh the timer
    timerHandler = setInterval(() => {
        elapsedTime = calculateElapsedTime(startTime);  
        const gameTimer = document.querySelector('.game-timer');
        gameTimer.textContent = `${elapsedTime.minute}:${elapsedTime.second}`;
      }, 1000);    
  }

};

// capture elapsed time; but this is limited to minutes and seconds
const calculateElapsedTime = function(startTime) {
    const elapsedTimeInMilliseconds =  new Date() - startTime;
    
    const elapsedTimeInMinutes = Math.floor(elapsedTimeInMilliseconds / 1000 / 60);
    const elapsedTimeInSeconds = Math.floor((elapsedTimeInMilliseconds / 1000) % 60);

    return {
        minute: elapsedTimeInMinutes.toString().padStart(2, '0'),
        second: elapsedTimeInSeconds.toString().padStart(2, '0')
    };
}

const stopTimer = function() {
  if (timerHandler) {
    clearInterval(timerHandler);
  }

  timerHandler = null;
};

const clearTimer = function() {
    const gameTimer = document.querySelector('.game-timer');
    gameTimer.textContent = `00:00`;

    startTime = null;
    elapsedTime = null;
}

const checkIfPlayerHasWon = function() {
    if (numberOfMatches === cardNames.length) {
        stopTimer();
        setTimeout(() => {
            let response = confirm(`You are a winner! You completed the game with ${numberOfStars} star-rating - ${numberOfMoves} moves in ${elapsedTime.minute} min ${elapsedTime.second} sec. \nWould you like to play again?`);
            if (response) {
                initializeGame();
            }
        }, 500);
    }
}

const checkIfCardsMatch = function() {
    if (doCardsMatch(selectedCards)) {
        selectedCards.forEach(ele => {
            ele.classList.remove("open", "show");
            ele.classList.add("match");
        });
        numberOfMatches++;
        selectedCards = [];
    }
    else {
        setTimeout(() => {
            selectedCards.forEach(ele => {
                ele.classList.remove("open", "show");
                selectedCards = [];
            });
        }, 1000);
    }
}


initializeGame();



