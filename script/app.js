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
   },
   {
      label: "custom",
      value: 4,
      // da controllare tramite input utente
      rows: 0, 
      columns: 0,
      bombsNum: 0,
      bgColor: "#398AB9"
   },
];

const gridWrapper = document.querySelector(".grid-wrapper");
const grid = document.querySelector(".grid");

const difficultySubmit = document.getElementById("difficulty-submit");
difficultySubmit.addEventListener("click", playGame);


// FUNCTIONS

// Execute game
function playGame() {

   // Reset grid
   resetGrid();

   // Save select input
   const difficultyValue = getDifficultyChoice();

   // Calculate grid dimensions based on difficulty
   const difficulty = generateGridDimensions(difficultyValue);

   // Calculate bombs indexes
   const bombsPositions = generateBombs(difficulty);
   console.log(bombsPositions);

   // Populate grid
   generateGrid(difficulty);

   // PROVA: trovia adiacenti
   const adjacentElementsArray = calcAdjacentsArray(difficulty);
   console.log(adjacentElementsArray);

   // Add numbers of adjacent bombs
   const adjacentBombsArray = addAdjacentBombs(difficulty, bombsPositions, adjacentElementsArray);

   // Add select event on grid
   grid.addEventListener("click", selectGridElement);


   // Applies selected effects on grid elements and eventually triggers win/gameover
   function selectGridElement(event) {
      const element = event.target.closest(".grid-element");
      const elementsArray = document.querySelectorAll(".grid-element");

      if (isBomb(element, bombsPositions)) {
         element.classList.add("exploded");
         grid.removeEventListener("click", selectGridElement);
         revealBombs(elementsArray, bombsPositions);
         console.log("HAI PERSO!");
      } else {

         revealElement(element, adjacentBombsArray, adjacentElementsArray, elementsArray, bombsPositions);

         // const adjacentBombs = adjacentBombsArray[element.dataset.number - 1];
         // element.classList.add("selected");
         // if(adjacentBombs > 0) {
         //    element.append(adjacentBombs);
         // } else {
         //    const elementIndex = parseInt(element.dataset.number) - 1;
         //    const adjacentElementsNumbers = adjacentElementsArray[elementIndex];

         //    for(let i = 0; i < adjacentElements.length; i++) {
         //       const adjacentElementIndex = parseInt(adjacentElementsNumbers[i]) - 1;
         //       const adjacentElement = elementsArray[adjacentElementIndex];

         //       if(!isBomb(adjacentElement, bombsPositions)) {
         //          // Applica la funzione selectGridElement(event) a adjacentElement
         //          // Forse serve creare una funzione flip/reveal
         //       }

         //    }
         // }
         // // Check vittoria
      }
   }


   

}


// Rivela cella - da aggiungere no controllo se già "selected", aggiungere "flip particolare" per celle con numeri
function revealElement(element, adjacentBombsArray, adjacentElementsArray, elementsArray, bombsPositions) {

   if(element.dataset.selected === "true") { // se cella già flippata, esce da funzione
      return;
   }

   const adjacentBombs = adjacentBombsArray[element.dataset.number - 1];
   element.dataset.selected = "true";
   element.classList.add("selected");
   if(adjacentBombs > 0) {
      element.append(adjacentBombs);
   } else {
      const elementIndex = parseInt(element.dataset.number) - 1;
      const adjacentElementsNumbers = adjacentElementsArray[elementIndex];
      console.log(element);
      console.log(adjacentElementsNumbers);

      for(let i = 0; i < adjacentElementsNumbers.length; i++) {
         const adjacentElementIndex = parseInt(adjacentElementsNumbers[i]) - 1;
         const adjacentElement = elementsArray[adjacentElementIndex];
         // console.log(adjacentElementIndex);
         console.log(adjacentElement);
         console.log(bombsPositions);

         if(!isBomb(adjacentElement, bombsPositions)) {
            // Applica la funzione selectGridElement(event) a adjacentElement
            // Forse serve creare una funzione flip/reveal
            revealElement(adjacentElement, adjacentBombsArray, adjacentElementsArray, elementsArray, bombsPositions);
         }

      }
   }
   // Check vittoria
}


// Resetta il contenuto della griglia
function resetGrid() {
   grid.innerHTML = "";
}


// Store selected difficulty
function getDifficultyChoice() {
   const difficultySelect = document.getElementById("difficulty-select");
   // console.log(`difficultySelect.value: ${difficultySelect.value}`);
   return parseInt(difficultySelect.value);
}


// Calculate grid dimensions and info
function generateGridDimensions(difficultyValue) {
   let difficulty = {};
   
   for(let i = 0; i < difficultyParameters.length; i++) { // Migliorabile? Senza for, con accesso diretto all'array con posizione [difficultyValue - 1]
      if (difficultyParameters[i].value === difficultyValue) {
         difficulty = {...difficultyParameters[i]};
      }
   }

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

   return bombsPositions.sort();
}


// Generate random intenger between min & max (included)
function getRandoimIntInclusive(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1) + min);
}


// Generate grid elements
function generateGrid(difficulty) {
   const gridElementNum = difficulty.rows * difficulty.columns;
   const rows = difficulty.rows;
   const columns = difficulty.columns;

   grid.style.maxWidth = `${columns * 30}px`; // da sostituire con variabile che pesca da css
   grid.style.maxHeigth = `${rows * 30}px`; // da sostituire con variabile che pesca da css
   gridWrapper.style.backgroundColor = `${difficulty.bgColor}`;

   for (let i = 0; i < gridElementNum; i++) {
      const element = document.createElement("div");
      element.classList.add("grid-element");
      element.dataset.number = i + 1;

      // Calc grid rowIndex
      let rowIndex = Math.ceil((i + 1) / columns);
      element.dataset.rowIndex = rowIndex;
      
      // Calc grid columnIndex
      let columnIndex = (i + 1) % columns;
      if(columnIndex === 0) {
         columnIndex = columns;
      }
      element.dataset.columnIndex = columnIndex;

      grid.append(element);
   }
}


// Add the number of adjacent bombs in every blank element
function addAdjacentBombs(difficulty, bombsPositions, adjacentElementsArray) {
   const elementsArray = document.querySelectorAll(".grid-element");
   const ajdacentBombsArray = [];
   // console.log(adjacentElementsArray);

   for (let i = 0; i < elementsArray.length; i++) {
      const element = elementsArray[i];
      const adjacentElements = adjacentElementsArray[i];
      // console.log(element);
      // console.log("addAdjacentBombs1: " + adjacentElements);
      const adjacentBombs = calcAdjacentBombs(element, bombsPositions, elementsArray, adjacentElements);
      ajdacentBombsArray.push(adjacentBombs);
   }

   return ajdacentBombsArray;
}


// Calculate how many bombs are adjacent to the element
function calcAdjacentBombs(element, bombsPositions, elementsArray, adjacentElements) {
   // console.log(adjacentElements);

   let adjacentBombs = 0;

   if(isBomb(element, bombsPositions)) {
      adjacentBombs = -1; // non ha senso calcolare il numero di bombe adiacente ad una bomba
   } else {
      for(let i = 0; i < adjacentElements.length; i++) {
         const adjacentIndex = parseInt(adjacentElements[i] - 1);
         const adjacentElement = elementsArray[adjacentIndex];
         // console.log(adjacentElement);
         if(isBomb(adjacentElement, bombsPositions)) {
            adjacentBombs++;
         }
      }
   }

   return adjacentBombs;
}


// Find adjacents cells for a specified element
function calcAdjacentsArray(difficulty) {
   const adjacentElementsArray = [];
   const gridElementNum = difficulty.rows * difficulty.columns;
   const elementsArray = document.querySelectorAll(".grid-element");

   for(let i = 0; i < gridElementNum; i++) {
      const element = elementsArray[i];
      const adjacentElements = findAdjacents(element, difficulty);
      adjacentElementsArray.push(adjacentElements);
   }
   
   return adjacentElementsArray;
}


// Find adjacents cells for a specified element
function findAdjacents(element, difficulty) {
   const rows = difficulty.rows;
   const columns = difficulty.columns;

   const rowIndex = parseInt(element.dataset.rowIndex);
   const columnIndex = parseInt(element.dataset.columnIndex);

   const adjacentElements = [];
   // console.log(element);

   for(let i = Math.max(rowIndex - 1, 1); i <= Math.min(rowIndex + 1, columns); i++) {
      for(let j = Math.max(columnIndex - 1, 1); j <= Math.min(columnIndex + 1, rows); j++) {
         const adjacentElement = document.querySelector(`[data-row-index="${i}"][data-column-index="${j}"]`);
         // console.log(adjacentElement);
         // console.log(!((i === rowIndex) && (j === columnIndex)));
         if(!((i === rowIndex) && (j === columnIndex))) {
            adjacentElements.push(adjacentElement.dataset.number);
         }
      }
   }
   // console.log(adjacentElements);

   return adjacentElements;
}


// Controlla se l'elemento è una bomba o no
function isBomb(element, bombsPositions) {
   const elementIndex = parseInt(element.dataset.number);
   if(bombsPositions.includes(elementIndex)) return true;
   return false;
}


// Rende visibili tutte le bombe
function revealBombs(elementsArray, bombsPositions) {
   for (let i = 0; i < bombsPositions.length; i++) {
      const bombIndex = bombsPositions[i];
      // console.log(bombsPositions[i]);
      const element = elementsArray[bombIndex - 1];
      // console.log(elementsArray[bombIndex]);
      element.classList.add("bomb");
   }
}


// Chiede all'utente un numero in input e controlla che sia corretto.
// function getUserInt(question, min, max) {
//    let num;
//    let checkInput;
//    let errorMessage = "INPUT ERRATO: ";
//    do {
//       checkInput = true;
//       num = parseInt(prompt(question));
//       console.log(num);
//       if (isNaN(num)) {
//          checkInput = false;
//          alert(errorMessage + "non hai inserito un numero.");
//       } else if (num < min) {
//          checkInput = false;
//          alert(errorMessage + `il numero dev'essere maggiore o uguale a ${min}.`);
//       } else if (num > max) {
//          checkInput = false;
//          alert(errorMessage + `il numero dev'essere minore o uguale a ${max}.`);
//       }
//       console.log(checkInput);
//    } while (!checkInput);

//    return num;
// }