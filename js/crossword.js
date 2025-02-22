// create a function to find the common letters in a pair of words
// this function should take in two parameters, word1 and word2
// and return a list of match objects 
// each match object should have the following properties:
// - letter: the common letter
// - index1: the index of the letter in word1
// - index2: the index of the letter in word2
let associations = {};
let wordNumber = {};
let remainingWords = [];
let terms = [];
let positions= [];
let priorDirection;
let priorElement;
let grid = [];
let termColIndex;
let defColIndex;
let definitions = [];
let crosswordGrid = [];
let clicked;
let numbers2 = [];

function findCommonLetters(word1, word2,direction) {
  let matches = [];
  for (let i = 0; i < word1.length; i++) {
    for (let j = 0; j < word2.length; j++) {
      if (word1[i] === word2[j]) {
	matches.push({
	  joinLetter: word1[i],
	  index1: i,
	  index2: j,
	  direction: (direction === 'horizontal') ? 'vertical' : 'horizontal'
	});
      }
    }
  }
  return matches;
}


// write a function to initialize the grid for the crossword puzzle
// This function should set the cells of the grid to spaces
// The grid should be a 2D array with the specified number of rows and columns
// The function should return the initialized grid

function initializeGrid(rows, columns) {
  let grid = [];
  for (let row = 0; row < rows; row++) {
    grid.push([]);
    for (let column = 0; column < columns; column++) {
      grid[row].push({value:'~',direction:null});
    }
  }
  return grid;
}

// write a function to add a word to the grid for the crossword puzzle
// this function should take in the grid, and the matches for the word  with remaining words
// and update the grid with the word
// the function should recursively call itself to add the intersecting words
// the matches should be found using the findCommonLetters function
// the function should return the updated grid if 80% of the words are placed
// the function should find the position of the word in the grid using the findWordPosition function
// and add the word to the grid in the correct position
// if grid is empty then place the word in the center of the grid
// if the word intersects with another word, the intersecting letters should be the same
// if the word is horizontal the added word should be vertical and vice versa

function addWord(grid, word, position, pmatch) {
	grid = addWordAtPosition(grid, word, position, pmatch);
	//console.log(grid2);
	// loop through remaining words
	// for each word in the remaining words find the common letters with the current word
	// and try to add the word at the position of the common letter
	// if the word does not fit at the position of the common letter
	// try to add the word at the position of the next common letter
	// if the word fits at the position of the common letter
	// add the word to the grid and call the addWord function recursively with the next word
	// if the word does not fit at any of the common letters
	
	for (let remainingWord of remainingWords) {
		let matches = findCommonLetters(word, remainingWord, position.direction);
		for (let match of matches) {
			let row, column;
			if (match.direction === 'vertical') {
				row = position.row - match.index2;
				column = position.column + match.index1;
			} else {
				row = position.row + match.index1;
				column = position.column - match.index2;
			}
			let nextPosition = { row:row, column:column, direction: match.direction };
			if (checkFit(grid, remainingWord, nextPosition, match) 
				&& !findWordPosition(remainingWord)
				&& !checkAdjacency(grid, remainingWord, nextPosition, match) 
				&& !checkEnds(grid, remainingWord, nextPosition)){
			        remainingWords = remainingWords.filter(word => word !== remainingWord);
	                        grid = addWord(grid, remainingWord, nextPosition, match);
			}
		}
	}
	return grid;
}

// write a function to check if grid is empty
// this function should take in the grid
// and return true if the grid is empty and false otherwise
// the grid is empty if all the cells are spaces
// the function should use a nested loop to check each cell in the grid

function isEmpty(grid) {
  for (let row of grid) {
    for (let cell of row) {
      if (cell !== '~') {
	return false;
      }
    }
  }
  return true;
}




// write a function to add a word to the grid at a specific position
// this function should take in the grid, the word, and the position
// and update the grid with the word at the specified position


function addWordAtPosition(grid, word, position, match) {
  positions[word] = position;
  let column = position.column;
  let row = position.row;
  let direction = position.direction;
  for (let i=0; i < word.length; i++) {
    if (direction === 'horizontal' && grid[row]) {
      if (grid[row][column + i].direction === null) {
        grid[row][column + i].value = word[i];
        grid[row][column + i].direction = "horizontal";
      } else grid[row][column + i].direction = "both";
    } else if (direction === 'vertical'){
      if (grid[row + i] && grid[row + i][column].direction === null) {
         grid[row + i][column].value = word[i];
         grid[row + i][column].direction = "vertical";
      } else if (grid[row + i] && grid[row + i][column]){
	grid[row + i][column].direction = "both";
      }
    }
  }
  return grid;
}

// write a function to check if a word fits at a specific position in the grid
// this function should take in the grid, the word, and the position
// and return true if the word fits at the position
// and false otherwise
// the word fits if the word does not go out of bounds of the grid
// and the cells of the grid at the position of the word are spaces
// or the cells of the grid at the position of the word are the same as the letter of the word at that position

function checkFit(grid, word, position, match) {
//	console.log("checkFit");
//	console.log(grid);
  let row = position.row;
  let column = position.column;
  let direction = match.direction;
	    if (row<0||column<0) return false;
	//console.log(direction);
  for (let i = 0; i < word.length; i++) {
    if (direction === 'horizontal') {
      if (!grid[row] || !grid[row][column+i] || ((column + i > grid[0].length) || (grid[row][column + i].value !== '~' && grid[row][column + i].value !== word[i]))){
	  //console.log(word[i] + ":" + grid[row][column+i]);
	      //console.log("false");
	return false;
      }
    } else {
      if (!grid[row + i] || !grid[row + i][column] || ((row + i > grid.length) || (grid[row + i][column].value !== '~' && grid[row + i][column].value !== word[i]))) {
	      //console.log("false");
	return false;
      }
    }
  }
  return true;
}


// write a function to check adjacency of words
// this function should take in the grid, the word, and the position
// and return true if the word is adjacent to another letter in the grid
// and false otherwise
// the word is adjacent if the word is placed next to another letter in the grid
// if the word is horizontal, the function should check the cells above and below the word
// if the word is vertical, the function should check the cells to the left and right of the word
// it is ok for a word to intersect with another word if the intersecting letters are the same

function checkAdjacency(grid, word, position, match) {
	// adjust the script below to check for a space in the cells around the word
	// if there is a space in the cells around the word, return true
	// if there is a letter in the cells around the word, return false
	// if there is a letter in the cells around the word that is not the same as the letter of the word at that position, return false

  let column = position.column;
  let row = position.row;
  let direction = match.direction;
	//console.log(match.direction);
  for (let i = 0; i < word.length; i++) {
    if (direction === 'horizontal') {
      if (grid[row - 1] && grid[row - 1][column + i] && grid[row - 1][column + i].value !== '~' && grid[row][column + i].value !== word[i]) {
	      //console.log("1");
	return true;
      }
      if (grid[row + 1] && grid[row + 1][column + i] && grid[row + 1][column + i].value !== '~' && grid[row][column + i].value !== word[i]) {
	      //console.log("2");
	return true;
      }
    } else {
      if (grid[row + i][column - 1] && grid[row + i][column - 1].value !== '~' && grid[row + i][column].value !== word[i]) {
	      //console.log("3");
	return true;
      }
      if (grid[row + i][column + 1] && grid[row + i][column + 1].value !== '~' && grid[row + i][column].value !== word[i]) {
	      //console.log("4");
	return true;
      }
    }
  }
  return false;
}


// write a function to determine if there is a letter in the grid at the beginning or the end of a word.
// this function should take in the grid, the word, and the position
// and return true if there is a letter in the grid at the beginning or the end of the word
// and false otherwise

function checkEnds(grid, word, position) {
  let column = position.column;
  let row = position.row;
  let direction = position.direction;
  if (direction === 'horizontal') {
    if (column < 0
	|| row < 0
	|| column + word.length > grid[0].length
	|| !grid[row]
	|| !grid[row][column - 1]
	|| !grid[row][column + word.length]
	|| grid[row][column - 1].value !== '~'
	|| grid[row ][column].value !== '~'
	|| grid[row ][column + word.length].value !== '~') 
	
     {
      return true;
    }
  } else { 
    if ( column < 0
	    || row < 0
	    || !(row+word.length<= grid.length)
	    || !grid[row-1] 
	    || !grid[row-1][column]
	    || !grid[row+word.length] 
	    || grid[row - 1][column].value !== '~' 
	    || grid[row + word.length][column].value !== '~') {
      return true;
    }
  }
  return false;
}
  



// write a function to find the column and row coordinates of the first letter of a word in the grid
// and the direction of the word
// this function should take in the grid and the word
// and return an object with the following properties:
// - column: the column coordinate of the first letter
// - row: the row coordinate of the first letter
// - direction: the direction of the word
// the direction should be 'horizontal' or 'vertical'
//

function findWordPosition(word) {
	return positions[word];
}


// write a function to generate a crossword puzzle
// this function should take in a list of words
// and return a 2D array representing the crossword puzzle
// the crossword puzzle should be a grid of letters
// with the words placed horizontally and vertically
// the words should intersect at common letters
// if a word is shorter than the grid, the grid should be expanded with spaces
// the function should use the addWord function to add the words to the grid

function makeCrossword(terms) {

  remainingWords = [];
  grid = initializeGrid(25, 25);
  let word = terms[Math.floor(Math.random() * terms.length)];
  //find longest word in terms
/*  for (let term of terms) {
    if (term.length > word.length) {
      word = term;
    }
  }
*/	
  //add the longest word to the grid
  // remove the longest word from the terms
  remainingWords = terms.filter(remainingword => remainingword !== word);
    
  let column = Math.floor(grid[0].length / 2) -Math.floor( word.length / 2);
  let row = Math.floor(grid.length / 2);
    position = { row:row, column:column, direction: 'horizontal' };
    positions[word] = position;
    grid = addWord(grid, word, position);
  return grid;
}

// write a function to display a crossword puzzle
// this function should take in a 2D array representing the crossword puzzle
// and display it in an HTML table
// the function should use the makeCrossword function to generate the puzzle
// and the findCommonLetters function to find intersections
// the function should display the words in the puzzle in the correct order


function displayCrossword(grid) {
  let table = document.createElement('table');
    table.classList.add('crossword-grid');
  for (let row of grid) {
    let tr = document.createElement('tr');
    for (let cell of row) {
      let td = document.createElement('td');
      td.classList.add('crossword-cell');
      td.textContent = cell;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  document.body.appendChild(table);
}

// write a function to find the word that contains a specific position in the grid
// if there is no word at the position, the function should return undefined
// if there are multiple words at the position, the function should return both words
// the function should take in the grid and the column and row coordinates of the position

function findWordAtPosition(grid, row, column, direction) {
  // the function needs to find the word that contains the position
  // and so should loop through the length of the word
  // and check if the position is within the range of the word
  // if the position is within the range of the word, return the word
  // if the position is not within the range of the word, return undefined
  // if the position is within the range of 2 words, return both words
  for (let word of terms) {
    let position = findWordPosition(word);
    if (position) {
      if (position.direction === direction) {
        if (row === position.row && column >= position.column && column < position.column + word.length) {
       	  return word;
        }
      }
    }
  }
  return undefined;
}

// write a function to associate every cell in the grid with a word
// if the cell is part of a word, the function should associate the cell with the word
// if the cell is part of two words, the function should associate the cell with both words
// the association should also include the direction of the word
//
function associateWords(grid) {
  for (let word of terms) {
    try {
	    let hdef;
	    let vdef;
       let position = findWordPosition(word);
       let column = position.column;
       let row = position.row;
       let direction = position.direction;
       for (let i = 0; i < word.length; i++) {
         if (direction === 'horizontal') {
		 if (associations[row +'.' + (column+i)]) { 
		    let elem = associations[row +'.' + (column+i)];
		    vdef = elem.verticalDefinition;
		 }
		 associations[row +'.' + (column+i)]= ({ horizontalDefinition: definitions[terms.indexOf(word)], verticalDefinition:vdef, direction: hdef&&vdef ? "both" : "horizontal"});
         } else if (direction === 'vertical'){
		 if (associations[(row+i) +'.' + column]) { 
		    let elem = associations[(row+i) +'.' + column]; 
		    hdef = elem.horizontalDefinition;
		 }
		 associations[(row+i) +'.' + column]= ({ horizontalDefinition: hdef, verticalDefinition: definitions[terms.indexOf(word)], direction: hdef&&vdef ? "both" : "vertical"});
         }
       }
    }
    catch(e) {
    }
	  // log the associations object to the console
  }
	  console.log(associations);
}

// write a function to get the direction from a cell in the grid
// this function should take in the column and row coordinates of the cell
// and the grid and return the direction of the word that contains the cell
// the function should return 'horizontal' if the word is horizontal
// the function should return 'vertical' if the word is vertical
// the function should return priorDirection if the word is part of a word that is both horizontal and vertical
//
function getDirection(grid, row, column) {
  let direction;
  if (priorDirection && !clicked ) {
     direction = priorDirection;
  } else {
	  if (grid[row][column].direction === 'both') {
	    direction = 'horizontal';
	  } else {
            direction = grid[row][column].direction;
          }
	  clicked = false;
  }
   // console.log(direction);
  return direction;
}


// write a function to display the definition of the word when the cell has the focus
// the listener should display the definition of the word in a div with the id 'definition'
// the listener should display the horizontal definition if the word is horizontal
// the listener should display the vertical definition if the word is vertical

function displayDefinition() {
	// get the active element
	// get the row and column of the element with the focus
	
	let activeElement = document.activeElement;
	let row = parseInt(activeElement.id.split('.')[0]);
	let column = parseInt(activeElement.id.split('.')[1]);

  let direction = getDirection(crosswordGrid, row, column);
  let word = findWordAtPosition(crosswordGrid, row, column, direction);
//	console.log(word);
  let definition;
  try {
    if (direction === 'horizontal') {
      definition = associations[row + '.' + column].horizontalDefinition;
    } else if (direction === 'vertical'){
      definition = associations[row + '.' + column].verticalDefinition;
    }
  } catch(e) {
  }
  let definitionDiv = document.getElementById('definition');
   definitionDiv.style.fontWeight = 'bold';
   definitionDiv.style.fontSize = '40px';
   definitionDiv.textContent = '';
  if (definition) definitionDiv.textContent = (direction==='horizontal' ? 'Down: ' : 'Across: ') + definition;
}

// write a function to set a variable to a direction

function next (nextInput, direction) {
	  if (nextInput){
		  let row = parseInt(nextInput.id.split('.')[0]);
		  let column = parseInt(nextInput.id.split('.')[1]);
	    nextInput.focus();
	    displayDefinition();
	    selectAll(nextInput);
		 // console.log(nextInput.id);
	  }
}

function selectAll(target) {
	target.setSelectionRange(0, target.value.length);
}

// write a function to make an editable crossword puzzle
// this function should take in a 2D array representing the crossword puzzle
// and a list of words and definitions and the positions of the words
// a position object should have the following properties:
// - column: the column coordinate of the first letter
// - row: the row coordinate of the first letter
// - direction: the direction of the word
// the function should create an HTML table with input fields for each cell
// the function should display the words and definitions in the correct order
// the function should number the words and definitions
// the function should place the numbers in the 'grid at the position of the words
// the function should add a button to check the answers
// the function should add a button to reveal the answers
// the function should add a button to reset the puzzle
// the function should display numbers for the words in the grid
// each word should have a number at the beginning of the word
// the number should be placed in the grid at the top left corner of the word

let numbers = [];

function makeEditableCrossword(grid) {
	let pre = document.createElement('pre');
    let table = document.createElement('table');
	for (let column = 0; column < grid[0].length; column++) {
        let tr = document.createElement('tr');
	
    for (let row = 0; row < grid.length; row++) {
          let cell = grid[row][column];
          let td = document.createElement('td');
	    // add a style to make the td cell square
	    td.style.width = '20px'
	    td.style.height = '20px'
	    // force the width and height of the td cell without regard to the content

          let input = document.createElement('input');
      input.classList.add('crossword-cell');
      // make the input field accept only one character
      input.maxLength = 1;
      // add an id to the input field
      // the id should be the column and row coordinates of the cell
      input.id = row + '.' + column;

      // add a listener to the input field to display the definition of the word

  input.addEventListener('focus', function(event) {
  if (event.target.tagName === 'INPUT') {
	  try {
		if (priorDirection !== null) {
                   direction = priorDirection;
		}
		else {
		   column = parseInt(event.target.id.split('.')[1]);
		   row = parseInt(event.target.id.split('.')[0]);
		   direction = getDirection(crosswordGrid, row, column);
		}
	     document.activeElement.selectionStart = 0;
	     document.activeElement.selectionEnd = document.activeElement.value.length;
	  } catch(e) {
	  }
  }
	  displayDefinition();
});
      // add a listener to the input field
      // to move the focus to the next input field when a character is entered
      // the focus should move to the next input field in the same row if the 
      // word is horizontal. If the word is vertical, the focus should move to the
      // next input field in the same column
      // the listener should use the input field's id to determine the next input field
      // the listener should check if the next input field is disabled
      // if the next input field is disabled, the focus should move to the closest vertical
      // or horizontal input field that is not disabled
      // if the input is a backspace, the focus should move to the previous input field 
      // in the same row if the word is horizontal. If the word is vertical, the focus should
      // move to the previous input field in the same column 
      input.addEventListener('keydown', function(event) {
	  // if the key is a tab or enter key, move the focus to the next word in the grid
	  // if shift is pressed, move the focus to the previous word in the grid
	  
	  if (event.key === 'Tab' || event.key === 'Enter') {
		  
		  //find the next word in the grid and set the direction to the direction of the word
		  //if the direction of the word is both, set the direction to horizontal
            // if shift is pressed, move the focus to the previous word in the grid
	    let nextInput;
		  console.log(event.shiftKey);
	    if (event.shiftKey) {
	       nextInput = getNextWordElement(grid,'previous');
	    } else {
	       nextInput = getNextWordElement(grid,'next');
	    }
		  next(nextInput, direction);
		  priorDirection = null;
		  //get active element
		  let activeElement = document.activeElement;
		  //get the row and column of the active element
		  let row = parseInt(activeElement.id.split('.')[0]);
		  let column = parseInt(activeElement.id.split('.')[1]);
		  priorDirection = getDirection(grid, row, column);
		  event.preventDefault();
		  return;
	  }
	  if (event.key === 'Backspace') {
	  let priorInput;
	  let direction = grid[row][column].direction;
	  if (priorDirection !== undefined) {
	    direction = priorDirection;
	  }
		input.value = '';
	  document.getElementById(row + '.' + column).innerText = ' ';
	  if (direction === 'horizontal') {
	    priorInput = document.getElementById(row + '.' + (column - 1));
	  } else {
	    priorInput = document.getElementById((row - 1) + '.' + column);
	  }
	  next(priorInput, direction);
	  // do not allow the backspace to delete character in the previous cell
	  event.preventDefault();
	}
	    // if the key is an arrow key, move the focus to the next input field  
	    // the following is not working
	      // if the key is an arrow key, move the focus to the next input field
	else if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
	  let nextInput;
	  let direction;
	  if (event.key === 'ArrowLeft') {
	    nextInput = document.getElementById((row - 1) + '.' + column);
		  priorDirection = direction = 'vertical';
	  }
	  else if (event.key === 'ArrowRight') {
	    nextInput = document.getElementById((row + 1) + '.' + column);
		  priorDirection = direction = 'vertical';
	  }
	  else if (event.key === 'ArrowUp') {
	    nextInput = document.getElementById(row + '.' + (column - 1));
		  priorDirection = direction = 'horizontal';
	  }
	  else if (event.key === 'ArrowDown') {
	    nextInput = document.getElementById(row + '.' + (column + 1));
		  priorDirection = direction = 'horizontal';
	  }
	
	  next(nextInput, direction);
	  displayDefinition();
	}
      });
      input.addEventListener('input', function(event) {
	direction = getDirection(crosswordGrid, row, column);
	  if (input.value.length > 0) {
		//console.log(cell + " " + row + " " + column);

	  let d;
	  let nextInput;

	  if ( direction === 'horizontal') {
	    priorDirection = d = 'horizontal';
	    nextInput = document.getElementById(row + '.' + (column + 1));
	  } else if (direction === 'vertical'){
	    priorDirection = d = 'vertical';
	    nextInput = document.getElementById((row + 1) + '.' + column);
	  } 
	  else if (direction === 'both') {
	    if (priorDirection === 'horizontal') {
	      d = 'horizontal';
	      nextInput = document.getElementById(row + '.' + (column + 1));
	    } else if (priorDirection === 'vertical') {
	      priorDirection = d = 'vertical';
	      nextInput = document.getElementById((row + 1) + '.' + column);
	    }
	  }
	  next(nextInput, d);
	}
      });
      // add an event listener to set the clicked variable to true
      // when the input field gets the mousedown event
      input.addEventListener('mousedown', function(event) {
	clicked = true;
	priorDirection = null;
	priorDirection = getDirection(crosswordGrid, row, column);
	displayDefinition();
//	console.log('clicked');
      });

      
      if (cell.value === '~') {
         input.classList.add('crossword-cell-empty');
      } else {
      }
      //disable the input field if the cell is empty
         input.disabled = cell.value === '~';
	 input.value = '';
	    // add the number of the word to the cell
	    // the number should be placed in the top left corner of the word
	    // the number should be placed in the cell if the cell is the first letter of the word
            // the number should be placed in the same cell as the first letter of the word
	    // the cell should be a table made up of 2 rows and 2 columns
	    // the number should be placed in the top left cell of the table
	    // the cell should be place in the outer cell of the table
	   let number = numbers[row + "." + column];
	   let innerTable = document.createElement('table');
	   let innerTr1 = document.createElement('tr');
	   let tlTd = document.createElement('td');
           let topTd = document.createElement('td');
           let trTd = document.createElement('td');
           let blTd= document.createElement('td');
           let botTd = document.createElement('td');
           let brTd = document.createElement('td');
               brTd.innerText = 'xx'
           // add a style to make td cell shrink to fit the content
           // add a style to tlTd to make the number bold
	   tlTd.style.fontWeight = 'bold';
	   // add a style to tlTd to make the cell smaller
	   tlTd.style.fontSize = 'smallest';
	   let innerTr2 = document.createElement('tr');
           let lTd = document.createElement('td');
           
	   let cTd = document.createElement('td');
	   let rTd = document.createElement('td');
           cTd.style.align = 'center';
	   cTd.style.fontSize = 'largest';
	   tlTd.innerText = number===undefined ? 'xx' :  number>9? number : ' ' +number;
           tlTd.style.align = 'left';
	   if (tlTd.textContent === 'xx') {
		   //make the cell with the number invisible if the cell is empty
		   //add a style to tlTd to make the cell with the number invisible
		   //add a style to tlTd to make the cell with the number hidden
		   //add a style to tlTd to make the cell with the number not visible
		   //make the column invisible
		   if (cell.value !== '~') {
			   tlTd.style.visibility = 'hidden';
			   
		   }
		   tlTd.backgroundColor = 'black';
		   tlTd.color = 'black';

	   }
		if (cell.value === '~') {
		   tlTd.style.color = 'black';
		   topTd.style.color = 'black';
		   trTd.style.color = 'black';
		   lTd.style.color = 'black';
		   cTd.style.color = 'black';
		   rTd.style.color = 'black';
		   blTd.style.color = 'black';
		   botTd.style.color = 'black';
		   brTd.style.color = 'black';
		   tlTd.classList.add('crossword-cell-empty');
		   topTd.classList.add('crossword-cell-empty');
		   trTd.classList.add('crossword-cell-empty');
		   lTd.classList.add('crossword-cell-empty');
		   cTd.classList.add('crossword-cell-empty');
		   rTd.classList.add('crossword-cell-empty');
		   blTd.classList.add('crossword-cell-empty');
		   botTd.classList.add('crossword-cell-empty');
		   brTd.classList.add('crossword-cell-empty');
		}
	   cTd.appendChild(input);
	   let innerTr3 = document.createElement('tr');
	   innerTr1.appendChild(tlTd);
           innerTr1.appendChild(topTd);
           innerTr1.appendChild(trTd);
           innerTr2.appendChild(lTd);
	   innerTr2.appendChild(cTd);
           innerTr2.appendChild(rTd);
           innerTr3.appendChild(blTd);
           innerTr3.appendChild(botTd);
           innerTr3.appendChild(brTd);
           // add a style to innerTd1 to make the cell width of the cell with the number smaller
           // add a style to cTd to make the cell width of the cell with the input field larger
	   
	   innerTable.appendChild(innerTr1);
	   innerTable.appendChild(innerTr2);
	   td.appendChild(innerTable);
	   
	   // add a style to make the td cell solid black with no border and no padding
	   td.style.border = '1px solid black';
	   td.style.padding = '0px';
           tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  // display table in the crosswordContainer div
  let crosswordContainer = document.getElementById('crosswordContainer');
  // clear the crosswordContainer div before adding the table
  crosswordContainer.innerHTML = '';
  pre.appendChild(table);
  crosswordContainer.appendChild(pre);
}

// write a function to check the answers of the crossword puzzle
// this function should take in a 2D array representing the crossword puzzle
// and a list of words and definitions and the positions of the words
// a position object should have the following properties:
// - column: the column coordinate of the first letter
// - row: the row coordinate of the first letter
// - direction: the direction of the word
// the function should check the answers in the grid with the words
// and return true if the answers are correct and false otherwise

function checkAnswers(grid) {
  let answers = [];
  for (let row of grid) {
    for (let cell of row) {
      answers.push(cell.value.toLowerCase());
    }
  }
  for (let column = 0; column < answers.length; column++) {
    if (answers[column].toLowerCase() !== words[column].toLowerCase()) {
      return false;
    }
  }
  return true;
}


// write a function to reset the crossword puzzle
// this function should take the positions of the words
// and reset the html table to the original state

function clearCrossword(grid, positions) {
  for (let word in positions) {
	  //console.log(word);
    let position = positions[word];
    let column = position.column;
    let row = position.row;
    let direction = position.direction;
	  //console.log(position);
    for (let i = 0; i < word.length; i++) {
      if (direction === 'vertical') {
	setLetter(row + i, column, ' ');
	setColor(row + i, column, 'white');
      } else {
        setLetter(row, column + i, ' ');
        setColor(row, column + i, 'white');
      }
    }
  }
}


// write a function to display the definitions of the words
// this function should take in a list of words and definitions
// and display the definitions in an HTML list
// the function should display the definitions in the correct order
// the correct order is the order that the words are encountered in the grid
// starting from the top left corner of the grid
// and moving left to right and top to bottom
// the function should number the definitions
// the function should separate the horizontal and vertical definitions
// the function should display the horizontal definitions first
// and the vertical definitions second
// the function should display the definitions in a div with the id 'definitions'
// the function should display the definitions in a div with the id 'horizontal-definitions'
// the function should display the definitions in a div with the id 'vertical-definitions'


// add an event listener to the document to set priorDirection to null when and element is clicked
// if the element gets focus by way of mouse set priorDirection to undefined
// if the element gets focus by way of keyboard leave priorDirection as is

// create a function to determine the letter that should be at a position in the grid
// this function should take in the grid, the column and row coordinates of the position
function getLetter(grid, row, column) {
  if (grid[row] && grid[row][column]) {
    return grid[row][column].value;
  }
}

// create a function to get the letter from the input field at a position in the html table
// this function should take in the row and column coordinates of the position
// and return the value of the input field at the position
function getAnswerLetter(row, column) {
  let input = document.getElementById(row + '.' + column);
  if (input) {
    return input.value;
  } else {
    return '';
  }
}

//create function to set the letter at a position in the html table
//this function should take in the column and row coordinates of the position and the letter
//and set the value of the input field at the position to the letter
function setLetter(row, column, letter) {
  let input = document.getElementById(row + '.' + column);
  input.value = letter;
}

// create a function to set the color of the input field at a position in the html table
// this function should take in the column and row coordinates of the position and the color
// and set the color of the input field at the position to the color

function setColor(row, column, color) {
  let input = document.getElementById(row + '.' + column);
  // add a style to the parent's parent of the input field to set the background color of the cell
  input.style.backgroundColor = color;
  input.parentElement.parentElement.parentElement.style.backgroundColor = color;
}


// create a function to check if the letters in the words are correct.
// this function should take in the grid and the positions of the words
// and return true if the letters in the words are correct and false otherwise
// the function should use the getLetter function to get the letter at a position in the grid
// the function should loop through the words and check if the letters in the words are correct
function checkCrossword(grid, positions) {
  let retval = true;
  for (let word in positions) {
	  //console.log(word);
    let position = positions[word];
    let row = position.row;
    let column = position.column;
    let direction = position.direction;
    let letters = [];
    for (let i = 0; i < word.length; i++) {
      if (direction === 'vertical') {
	    //console.log(word[i] + " " + getAnswerLetter( column + i, column));
        letters.push(getAnswerLetter(row + i, column));
	      if (getAnswerLetter(row + i, column).toLowerCase() !== word[i].toLowerCase()) {
		      setColor(row + i, column, 'red');
	      } else {
		      setColor(row + i, column, 'lightgreen');
	      }
      } else {
	    //console.log(word[i] + " " + getAnswerLetter(row, row + i));
	letters.push(getAnswerLetter(row, column + i));
	if (getAnswerLetter(row, column + i).toLowerCase() !== word[i].toLowerCase()) {
		setColor(row, column + i, 'red');
	}
	else {
		setColor(row, column + i, 'lightgreen');
	}
      }
    }
	  //console.log(letters.join(''));
    let checkWord = letters.join('');
    if (checkWord !== word) {
      retval = false;
    }
  }
  return retval;
}


// create a function to display the solution of the crossword puzzle
// this function should take in the grid and the positions of the words
// and display the solution of the crossword puzzle
function revealCrossword(grid, positions) {
  for (let word in positions) {
	  //console.log(word);
    let position = positions[word];
    let column = position.column;
    let row = position.row;
    let direction = position.direction;
    for (let i = 0; i < word.length; i++) {
      if (direction === 'vertical') {
	setLetter(row + i, column, word[i]);
      } else {
        setLetter(row, column + i, word[i]);
      }
    }
  }
}

function getNextWordElement(grid, nextOrPrevious) {
  let nextInput;
  let number = numbers2[document.activeElement.id];
  let nextNumber;
  if (nextOrPrevious === 'next') {
     nextNumber = number + 1;
  } else {
     nextNumber = number - 1;
  }
  for (let word in terms) {
    if (wordNumber[terms[word]] === nextNumber) {
      let position = findWordPosition(terms[word]);
      let column = position.column;
      let row = position.row;
      priorDirection = position.direction;
      let direction=getDirection(grid, row, column);
      direction = position.direction;
      if (direction === 'horizontal') {
	nextInput = document.getElementById(row + '.' + column);
      } else if (direction === 'vertical') {
	nextInput = document.getElementById(row + '.' + column);
      }
    }
  }
	return nextInput;
}

function displayDefinitions(terms, definitions, grid, words) {
  let horizontalDefinitions = document.createElement('div');
  horizontalDefinitions.id = 'horizontal-definitions';
  let verticalDefinitions = document.createElement('div');
  verticalDefinitions.id = 'vertical-definitions';
  let definitionsDiv = document.createElement('div');
  definitionsDiv.id = 'definitions';
  // create a label for the horizontal definitions
  let horizontalLabel = document.createElement('h2');
  horizontalLabel.textContent = 'Across';
  horizontalDefinitions.appendChild(horizontalLabel);
  // create a label for the vertical definitions
  let verticalLabel = document.createElement('h2');
  verticalLabel.textContent = 'Down';
  verticalDefinitions.appendChild(verticalLabel);
  let horizontalList = document.createElement('ul');
  let verticalList = document.createElement('ul');
  let column = -1;
  let number = 0;
      for (let column = 0; column < grid[0].length; column++) {
	for (let row = 0; row < grid.length; row++) {
	let cell = grid[row][column];
	
      for (let word of terms) {
	 let position = findWordPosition(word);
	 if (position 
	     && position.column === column 
	     && position.row === row) {
		 if (grid[row][column].number === undefined) {
			 number++;
		         grid[row][column].number = number;
			 wordNumber[word] = number;
	                 numbers[row + "." + column] = number;
		 }
		 position.number = number;
	      if (position.direction === 'vertical') {
		let li = document.createElement('p');
		li.textContent = number + '. ' + definitions[terms.indexOf(word)];
		horizontalList.appendChild(li);
	      } else {
		cell.direction = 'horizontal';
	        let li = document.createElement('p');
		li.textContent = number + '. ' + definitions[terms.indexOf(word)];
		verticalList.appendChild(li);
	      }
	 }
	 numbers2[row + "." + column] = number;
      }
    }
  }
  verticalDefinitions.appendChild(verticalList);
  horizontalDefinitions.appendChild(horizontalList);
  definitionsDiv.appendChild(horizontalDefinitions);
  definitionsDiv.appendChild(verticalDefinitions);
  let cluesContainer = document.getElementById('cluesContainer');
  cluesContainer.innerHTML = '';
  cluesContainer.appendChild(definitionsDiv);
  // add a style to make definitionsDiv hover before the element with the focus
  return grid;
}

function generateCrossword() {
    const table = document.getElementById('csvTable');
    if (!table) return;
    numbers=[];
    remainingWords = [];
    positions= [];
    grid = [];

    const headerRow = table.rows[0];

    termColIndex = -1;
    defColIndex = -1;

    // Identify the columns for terms and definitions
    for (let i = 0; i < headerRow.cells.length; i++) {
        if (headerRow.cells[i].textContent.trim().toLowerCase() === 'term') {
            termColIndex = i;
        }
        if (headerRow.cells[i].textContent.trim().toLowerCase() === 'definition') {
            defColIndex = i;
        }
    }

    if (termColIndex === -1 || defColIndex === -1) {
        alert('Please ensure there are "Term" and "Definition" columns in the table.');
        return;
    }

    terms = [];
    definitions = [];
    for (let i = 1; i < table.rows.length; i++) {
	 try{	
           const term = table.rows[i].cells[termColIndex].textContent.trim();
           const definition = table.rows[i].cells[defColIndex].textContent.trim();
           if (term && definition && !(term==='Term' && definition==='Definition')) {
	      terms.push(term);
              definitions.push(definition);
           }
	 } catch(e) {
	 }
    }

    crossword = makeCrossword(terms);
    crossword = displayDefinitions(terms, definitions, crossword);
    makeEditableCrossword(crossword);
    associateWords(crossword);
    crosswordGrid = crossword;
}
