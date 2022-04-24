// Difficulty array
const difficultyParameters = [
   {
      label: "beginner",
      value: 1,
      rows: 9,
      columns: 9,
      bombsNum: 10,
      bgColor: "#91C483"
   },
   {
      label: "intermediate",
      value: 2,
      rows: 16,
      columns: 16,
      bombsNum: 40,
      bgColor: "#FFE162"
   },
   {
      label: "expert",
      value: 3,
      rows: 16,
      columns: 30,
      bombsNum: 99,
      bgColor: "#FF6464"
   }
];


const gridWrapper = document.querySelector(".grid-wrapper");

const difficultySubmit = document.getElementById("difficulty-submit");
difficultySubmit.addEventListener("click", playGame);


// Timer
let isStopwatchRunning = false;

let hours = 0;
let minutes = 0;
let seconds = 0;

const timer = document.querySelector(".timer");
const hoursDOM = document.querySelector(".timer_hours");
const minutesDOM = document.querySelector(".timer_minutes");
const secondsDOM = document.querySelector(".timer_seconds");
const startBtn = document.querySelector(".start-btn");

let Interval;

function startStopwatch() {
   resetStopwatch();
   timer.classList.add("visible");
   isStopwatchRunning = true;
   Interval = setInterval( stopwatch, 1000 );
}

function stopStopwatch() {
   clearInterval( Interval );
}

function resetStopwatch() {
   stopStopwatch();
   timer.classList.remove("visible");
   secondsDOM.innerHTML = "00"
   seconds = 0;
   minutesDOM.innerHTML = "00";
   minutes = 0;
   hoursDOM.innerHTML = "00";
   hours = 0;
   isStopwatchRunning = false;
}

function stopwatch() {
   seconds++;

   if( seconds <= 9 ) {
      secondsDOM.innerHTML = "0" + seconds;
   }
   
   if( seconds > 9 ) {
      secondsDOM.innerHTML = seconds;
   }
   
   if( seconds > 59 ) {
      minutes++;
      minutesDOM.innerHTML = "0" + minutes;
      seconds = 0;
      secondsDOM.innerHTML = "00";
   }

   if( minutes > 9 ) {
      minutesDOM.innerHTML = minutes;
   }

   if( minutes > 59 ) {
      hours++;
      hoursDOM.innerHTML = "0" + hours;
      minutes = 0;
      minutesDOM.innerHTML = "00";
   }

   if( hours > 9 ) {
      hoursDOM.innerHTML = hours;
   }

   if( hours > 23 ) {
      secondsDOM.innerHTML = "00"
      seconds = 0;
      minutesDOM.innerHTML = "00";
      minutes = 0;
      hoursDOM.innerHTML = "00";
      hours = 0;
   }
}



// GAME FUNCTIONS

// Execute game
function playGame() {

   resetStopwatch();

   // Prevent mouse right click 
   window.addEventListener("contextmenu", e => e.preventDefault());

   let grid = document.querySelector(".grid");

   // Reset grid
   grid = resetGrid(grid);

   // Save select input
   const difficultyValue = getDifficultyChoice();

   // Calculate grid dimensions based on difficulty
   const difficulty = generateGridDimensions(difficultyValue);

   // Calculate bombs indexes
   const bombsPositions = generateBombs(difficulty);

   // Populate grid
   generateGrid(grid, difficulty);

   // Calc arrays of adjacents elements for every element
   const adjacentElementsArray = calcAdjacentsArray(difficulty);

   // Add numbers of adjacent bombs
   const adjacentBombsArray = addAdjacentBombs(bombsPositions, adjacentElementsArray);

   // Add select event on grid
   const gridElementNum = difficulty.rows * difficulty.columns;
   grid.addEventListener("click", selectGridElement);

   // Right click
   grid.addEventListener("mouseup", rightClick);

   // Applies selected effects on grid elements and eventually triggers win/gameover
   function selectGridElement(event) {
      const element = event.target.closest(".grid-element");
      const elementsArray = document.querySelectorAll(".grid-element");
      const state = parseInt(element.dataset.state);

      // Start stopwatch
      if( !isStopwatchRunning && !element.classList.contains('flag') && !element.classList.contains('question') ) {
         startStopwatch();
      }

      if(state === 0) {
         if (isBomb(element, bombsPositions)) {
            element.classList.add("exploded");
            checkGameover(elementsArray, bombsPositions)
         } else {
            revealElement(element, adjacentBombsArray, adjacentElementsArray, elementsArray, bombsPositions);
            checkVictory();
         }
      }
   }


   // Check defeat
   function checkGameover(elementsArray, bombsPositions) {
      grid.removeEventListener("click", selectGridElement);
      revealBombs(elementsArray, bombsPositions);
      getGameoverPopup(false);
   }


   // Check victory
   function checkVictory() {
      const selectedElements = document.querySelectorAll(".selected");

      if(selectedElements.length === (gridElementNum - difficulty.bombsNum)) {
         getGameoverPopup(true);
      }
   }


   // Gameover popup appereance
   function getGameoverPopup(victory) {

      stopStopwatch();

      difficultySubmit.removeEventListener("click", playGame);

      let messageString;

      if(victory) {
         messageString = "Victory!";
      } else {
         messageString = "Game over!";
      }
      const main = document.querySelector("main");
      main.classList.add("overlay");

      setTimeout(function() {
         const popup = document.createElement("div");
         popup.classList.add("popup");
         popup.innerHTML += `<h2 class="popup_title">${messageString.toUpperCase()}</h2>
         <button class="popup_play-again">Play again</button>`;
         main.append(popup);

         const playAgainBtn = document.querySelector(".popup_play-again");
         playAgainBtn.addEventListener("click", playGame);

         difficultySubmit.addEventListener("click", playGame);
      }, 1500);
   }


   // Right click function
   function rightClick(event) {
      if (typeof event === 'object') {
         if(event.button == 2) {
            const element = event.target.closest(".grid-element");


            // If elements has not been selected -> apply right click effects
            if( !element.classList.contains('selected') ) {
               const state = parseInt(element.dataset.state);

               switch(state) {
                  case 0:
                     element.classList.add("flag");
                     element.dataset.state++;
                     break;
                  case 1:
                     element.classList.remove("flag");
                     element.classList.add("question");
                     element.dataset.state++;
                     break;
                  case 2:
                     element.classList.remove("question");
                     element.dataset.state = 0;
                     break;    
               }
            }     
         }
      }
   }
}

// Reset grid content
function resetGrid(grid) {

   if (grid != null) {
      grid.remove();
   }

   const main = document.querySelector("main");
   main.classList.remove("overlay");

   const popup = document.querySelector(".popup");
   if(popup != null) {
      popup.remove();
   }

   grid = document.createElement("div");
   grid.classList.add("grid");
   gridWrapper.append(grid);

   return grid;
}


// Store selected difficulty
function getDifficultyChoice() {
   const difficultySelect = document.getElementById("difficulty-select");
   return parseInt(difficultySelect.value);
}


// Calculate grid dimensions and info
function generateGridDimensions(difficultyValue) {
   let difficulty = {};

   difficultyParameters.forEach(el => {
      if (el.value === difficultyValue) {
         difficulty = { ...el };
      }
   });

   return difficulty;
}

// Generate different indexes for bombs
function generateBombs(difficulty) {
   const bombsPositions = [];
   const bombsNum = difficulty.bombsNum;
   const gridElementNum = difficulty.rows * difficulty.columns;

   for (let i = 0; i < bombsNum; i++) {
      let bombIndex;
      do {
         bombIndex = getRandoimIntInclusive(1, gridElementNum);
      } while (bombsPositions.includes(bombIndex));

      bombsPositions.push(bombIndex);
   }

   return bombsPositions;
}


// Generate random intenger between min & max (included)
function getRandoimIntInclusive(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1) + min);
}


// Generate grid elements
function generateGrid(grid, difficulty) {
   const gridElementNum = difficulty.rows * difficulty.columns;
   const rows = difficulty.rows;
   const columns = difficulty.columns;

   grid.style.maxWidth = `${columns * 30}px`; // da sostituire con variabile che pesca da css
   grid.style.maxHeigth = `${rows * 30}px`; // da sostituire con variabile che pesca da css
   const main = document.querySelector("main");
   main.style.backgroundColor = `${difficulty.bgColor}`;

   for (let i = 0; i < gridElementNum; i++) {
      const element = document.createElement("div");
      element.classList.add("grid-element");
      element.dataset.number = i + 1;
      element.dataset.state = 0;

      // Calc grid rowIndex
      const rowIndex = Math.ceil((i + 1) / columns);
      element.dataset.rowIndex = rowIndex;

      // Calc grid columnIndex
      let columnIndex = (i + 1) % columns;
      if (columnIndex === 0) {
         columnIndex = columns;
      }
      element.dataset.columnIndex = columnIndex;

      grid.append(element);
   }
}


// Find adjacents cells for a specified element
function calcAdjacentsArray(difficulty) {

   const adjacentElementsArray = [];
   const elementsArray = document.querySelectorAll(".grid-element");

   elementsArray.forEach(el => {
      const adjacentElements = findAdjacents(el, difficulty);
      adjacentElementsArray.push(adjacentElements);
   });

   return adjacentElementsArray;
}


// Find adjacents cells for a specified element
// ATTENTION: array position does not matches the element number!
function findAdjacents(element, difficulty) {
   const rows = difficulty.rows;
   const columns = difficulty.columns;

   const rowIndex = parseInt(element.dataset.rowIndex);
   const columnIndex = parseInt(element.dataset.columnIndex);

   const adjacentElements = [];

   for (let i = Math.max(rowIndex - 1, 1); i <= Math.min(rowIndex + 1, rows); i++) {
      for (let j = Math.max(columnIndex - 1, 1); j <= Math.min(columnIndex + 1, columns); j++) {
         const adjacentElement = document.querySelector(`[data-row-index="${i}"][data-column-index="${j}"]`);

         if (!((i === rowIndex) && (j === columnIndex))) {
            adjacentElements.push(adjacentElement.dataset.number);
         }
      }
   }

   return adjacentElements;
}


// Add the number of adjacent bombs in every blank element
function addAdjacentBombs(bombsPositions, adjacentElementsArray) {
   const elementsArray = document.querySelectorAll(".grid-element");
   const ajdacentBombsArray = [];

   elementsArray.forEach((el, i) => {
      const adjacentElements = adjacentElementsArray[i];
      const adjacentBombs = calcAdjacentBombs(el, bombsPositions, elementsArray, adjacentElements);
      ajdacentBombsArray.push(adjacentBombs);
   });

   return ajdacentBombsArray;
}


// Calculate how many bombs are adjacent to the element
function calcAdjacentBombs(element, bombsPositions, elementsArray, adjacentElements) {
   let adjacentBombs = 0;

   if (isBomb(element, bombsPositions)) {
      adjacentBombs = -1; // no sense in calculating number of adjacents bombs to a bomb
   } else {
      adjacentElements.forEach((el) => {
         const adjacentIndex = parseInt(el - 1);
         const adjacentElement = elementsArray[adjacentIndex];

         if (isBomb(adjacentElement, bombsPositions)) {
            adjacentBombs++;
         }
      });
   }

   return adjacentBombs;
}


// Check if element is a bomb or not
function isBomb(element, bombsPositions) {
   const elementIndex = parseInt(element.dataset.number);

   if (bombsPositions.includes(elementIndex)) {
      return true;
   } else {
      return false;
   }
}


// Reveal all bombs
function revealBombs(elementsArray, bombsPositions) {
   for (let i = 0; i < bombsPositions.length; i++) {
      const bombIndex = bombsPositions[i];
      const element = elementsArray[bombIndex - 1];
      const state = parseInt(element.dataset.state);
      if(state === 0) {
         element.classList.add("bomb");
      }
   }
}


// Riveals cell
function revealElement(element, adjacentBombsArray, adjacentElementsArray, elementsArray, bombsPositions) {

   if (element.dataset.selected === "true") { // if already selected, exit
      return;
   }

   const elementIndex = element.dataset.number - 1;
   const adjacentBombs = adjacentBombsArray[elementIndex];
   element.dataset.selected = "true";
   element.classList.add("selected");

   // Removes right click icons
   element.classList.remove('flag');
   element.classList.contains('question');

   if (adjacentBombs > 0) {
      element.append(adjacentBombs);
   } else {
      const adjacentElementsNumbers = adjacentElementsArray[elementIndex];

      adjacentElementsNumbers.forEach((el) => {
         const adjacentElementIndex = el - 1;
         const adjacentElement = elementsArray[adjacentElementIndex];

         if (!isBomb(adjacentElement, bombsPositions)) {
            revealElement(adjacentElement, adjacentBombsArray, adjacentElementsArray, elementsArray, bombsPositions);
         }
      });
   }
}