document.getElementById('csvFileInput').addEventListener('change', handleFileSelect, false);
let row = null;

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            parseCSV(contents);
        };
        reader.readAsText(file);
    }
}

function parseCSV(contents) {
    const rows = parseCSVString(contents);
    const table = document.createElement('table');
	table.id = 'csvTable';
    rows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.contentEditable = 'true';
            td.textContent = cell;
            if (rowIndex !== 0) {
                td.addEventListener('mousedown', handleMouseDown);
                td.addEventListener('mouseover', handleMouseOver);
                td.addEventListener('mouseup', handleMouseUp);
                td.addEventListener('blur', saveRow); 
            }
            tr.appendChild(td);
        });
	addInsertRowIcon(tr);
	addDeleteRowIcon(tr);
        table.appendChild(tr);

    });
    document.getElementById('csvEditorContainer').innerHTML = '';
    document.getElementById('csvEditorContainer').appendChild(table);
}

function parseCSVString(csv) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        if (char === '"' && !inQuotes) {
            inQuotes = true;
        } else if (char === '"' && inQuotes) {
            if (i + 1 < csv.length && csv[i + 1] === '"') {
                cell += '"';
                i++;
            } else {
                inQuotes = false;
            }
        } else if (char === ',' && !inQuotes && cell !== '') {
            row.push(cell);
            cell = '';
        } else if (char === '\n' && !inQuotes && cell !== '') {
            row.push(cell);
	    if (row[0].toLowerCase() !== 'term' || row[1].toLowerCase() !== 'definition') {
               rows.push(row);
	    }
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }
    return rows;
}

function saveCSV() {
    const table = document.querySelector('#csvEditorContainer table');
    if (!table) return;

    let csvContent = '';
    for (let row of table.rows) {
        let rowData = [];
        for (let cell of row.cells) {
            let cellContent = cell.textContent.replace(/"/g, '""');
            if (cellContent.includes(',') || cellContent.includes('\n')) {
                cellContent = `"${cellContent}"`;
            }
            rowData.push(cellContent);
        }
        csvContent += rowData.join(',') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    // open a file save as dialog
    let fileName = prompt('Enter file name', 'edited.csv');
    if (fileName !== null) {
    link.download = fileName + '.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    }
}

function addRow() {
    const table = document.querySelector('#csvEditorContainer table');
    if (!table) return;

    const rowCount = table.rows.length;
    const colCount = table.rows[0].cells.length;

    const tr = document.createElement('tr');
    for (let i = 0; i < colCount; i++) {
        const td = document.createElement('td');
        td.contentEditable = 'true';
        td.addEventListener('mousedown', handleMouseDown);
        td.addEventListener('mouseover', handleMouseOver);
        td.addEventListener('mouseup', handleMouseUp);
	// the following is not working
	// the event listener is not being added to the cell
	// the event listener should save the row when the user clicks outside the cell
        td.addEventListener('blur', saveRow); 
        tr.appendChild(td);
    }
    addInsertRowIcon(tr);
    addDeleteRowIcon(tr);
    table.appendChild(tr);
}

// create a function to save the row when the user clicks outside the cell
// the function should save the row that contains the cell that the user clicked outside of
// the following is not working
// rewrite the function so that it saves the row that contains the cell that the user clicked outside of

saveRow = function(event) {
  let cell = event.target;
  row = cell.parentElement;
}

function addColumn() {
    const table = document.querySelector('#csvEditorContainer table');
    if (!table) return;

    for (let row of table.rows) {
        const td = document.createElement('td');
        td.contentEditable = 'true';
        td.addEventListener('mousedown', handleMouseDown);
        td.addEventListener('mouseover', handleMouseOver);
        td.addEventListener('mouseup', handleMouseUp);
        td.addEventListener('blur', saveRow); 
        row.appendChild(td);
    }
}

function removeRow() {
    const table = document.querySelector('#csvEditorContainer table');
    if (!table) return;

    if (table.rows.length > 1) {
        table.deleteRow(-1);
    }
}

function removeColumn() {
    const table = document.querySelector('#csvEditorContainer table');
    if (!table) return;

    const rowCount = table.rows.length;
    if (rowCount > 0) {
        const colCount = table.rows[0].cells.length;
        if (colCount > 1) {
            for (let row of table.rows) {
                row.deleteCell(-1);
            }
        }
    }
}

let isMouseDown = false;
let startCell = null;

function handleMouseDown(event) {
    isMouseDown = true;
    startCell = event.target;
    clearSelection();
    event.target.classList.add('selected');
    event.preventDefault();
}

function handleMouseOver(event) {
    if (isMouseDown) {
        const endCell = event.target;
        clearSelection();
        highlightSelection(startCell, endCell);
    }
}

function handleMouseUp(event) {
    isMouseDown = false;
    startCell = null;
}

function clearSelection() {
    const table = document.querySelector('#csvEditorContainer table');
    for (let row of table.rows) {
        for (let cell of row.cells) {
            cell.classList.remove('selected');
        }
    }
}

function highlightSelection(startCell, endCell) {
    const table = document.querySelector('#csvEditorContainer table');
    const startRow = startCell.parentNode.rowIndex;
    const startCol = startCell.cellIndex;
    const endRow = endCell.parentNode.rowIndex;
    const endCol = endCell.cellIndex;

    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
            table.rows[i].cells[j].classList.add('selected');
        }
    }
}

function copySelectedCells() {
    const table = document.querySelector('#csvEditorContainer table');
    if (!table) return;

    let selectedContent = '';
    for (let row of table.rows) {
        let rowData = [];
        for (let cell of row.cells) {
            if (cell.classList.contains('selected')) {
                rowData.push(cell.textContent);
            }
        }
        if (rowData.length > 0) {
            selectedContent += rowData.join('\t') + '\n';
        }
    }

    navigator.clipboard.writeText(selectedContent).then(() => {
        alert('Selected cells copied to clipboard');
    });
}


function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

// create a function to paste text from the clipboard into the table

function pasteText() {
  let text = navigator.clipboard.readText();
  text.then(function(value) {
    let rows = value.split('\n');
    let table = document.querySelector('#csvEditorContainer table');
    for (let i = 0; i < rows.length; i++) {
      let cells = rows[i].split('\t');
      let tr = table.insertRow(-1);
      for (let j = 0; j < cells.length; j++) {
	let td = tr.insertCell(-1);
        td.contentEditable = 'true';
	td.textContent = cells[j];
                td.addEventListener('mousedown', handleMouseDown);
                td.addEventListener('mouseover', handleMouseOver);
                td.addEventListener('mouseup', handleMouseUp);
                td.addEventListener('blur', saveRow); 
      }
      addInsertRowIcon(tr);
      addDeleteRowIcon(tr);
    }
  });
}

// create a function to read the text from the csv editor and make a tab-delimited string
// the function should return the tab-delimited string
function readText() {
  let table = document.querySelector('#csvEditorContainer table');
  let text = '';
  for (let i = 0; i < table.rows.length; i++) {
    let row = table.rows[i];
    for (let j = 0; j < row.cells.length; j++) {
      let cell = row.cells[j].textContent.toLowerCase();
      if (cell !== 'term' && cell !== 'definition') continue;
         text += row.cells[j].textContent;
         if (j < row.cells.length - 1) {
	   text += '\t';
         }
    }
    if (i < table.rows.length - 1) {
      text += '\n';
    }
  }
  return text;
}

// create a function to create a url parameter from the tab-delimited string
function createUrlParameter() {
  let text = readText();
  let urlParameter = tabDelimitedStringToUrlParameter(text, 'tabDelimitedString');
  return urlParameter;
}

function parseTabDelimited(value) {
    let rows = value.split('\n');
    let table = document.querySelector('#csvEditorContainer table');
    for (let i = 0; i < rows.length; i++) {
      let cells = rows[i].split('\t');
      let tr = table.insertRow(-1);
      for (let j = 0; j < cells.length; j++) {
	let td = tr.insertCell(-1);
        td.contentEditable = 'true';
	td.textContent = cells[j];
                td.addEventListener('mousedown', handleMouseDown);
                td.addEventListener('mouseover', handleMouseOver);
                td.addEventListener('mouseup', handleMouseUp);
                td.addEventListener('blur', saveRow); 
      }
      addInsertRowIcon(tr);
      addDeleteRowIcon(tr);
    }
  };
// create a function to make a url from the url parameter
// the function should return the url
function makeUrl() {
  let urlParameter = createUrlParameter();
  let url = window.location.href.split('?')[0] + '?' + urlParameter;
  return url;
}

// create a function to copy the url to the clipboard
function copyUrl() {
  let url = makeUrl();
  navigator.clipboard.writeText(url).then(function() {
    alert('URL copied to clipboard');
  });
}

// create a function to retrieve the tab delimited data from the url parameter
// and put it in the csv editor
// the function should parse the tab-delimited string from the url parameter

function retrieveCsvData() {
  let tabDelimitedString = getParameterFromUrl('tabDelimitedString');
  return tabDelimitedString;
}


//
// create a function to delete a row from the table 
// the row is the row that contains the active cell
// the following is not working
// the function deletes the first row of the table instead of the row that contains the active cell
// the function should delete the row that contains the active cell
// rewrite the function without using the active cell
function deleteRow(row) {
  let table = document.querySelector('#csvEditorContainer table');
  table.deleteRow(row.rowIndex);
}

// write a function to generate a math expression and put it in the active cell
// the expression should be generated using the generateExpression function in another file

function generateMathExpression(row) {
  // get the cell that is under the column header "Term"
  // and on the row that is passed as an argument
    addRow()
    const table = document.querySelector('#csvEditorContainer table');
	let headerRow = table.rows[0];
	let lastRow = table.rows[table.rows.length - 1];
  
  for (let i = 0; i < headerRow.cells.length; i++) {
    if (headerRow.cells[i].textContent.trim().toLowerCase() === 'term') {
      termColIndex = i;
      break;
    }
  }
  if (termColIndex === -1) {
    alert('Column "Term" not found');
    return;
  }
  // get the cell that is under the column header "Definition"
  // and on the row that is passed as an argument
  
  for (let i = 0; i < headerRow.cells.length; i++) {
    if (headerRow.cells[i].textContent.trim().toLowerCase() === 'definition') {
      definitionColIndex = i;
      break;
    }
  }
  if (termColIndex === -1) {
    alert('Column "Definition" not found');
    return;
  }
  
  let cell = lastRow.cells[termColIndex];
  let expression = generateExpression();
  // strip spaces from the expression
  expression = expression.replace(/\s/g, '');
  cell.textContent = expression;
  let parser = new Parser(expression);
  let definitionCell = lastRow.cells[definitionColIndex];
  let answer = parser.parse();
  definitionCell.textContent = answer;
}

// create an icon on the end of each row to delete the row
// also create an icon on the end of each row to insert a row above the row
// enable the user to tab to the icons and press enter to delete or insert a row
// use a trash can icon for delete and a plus icon for insert

function addDeleteRowIcon(row) {
  let deleteIcon = document.createElement('span');
  deleteIcon.textContent = '❌';
  deleteIcon.style.cursor = 'pointer';
  deleteIcon.addEventListener('click', function() {
    deleteRow(row);
  });
  row.appendChild(deleteIcon);
}

function addInsertRowIcon(row) {
  let insertIcon = document.createElement('span');
  insertIcon.textContent = '➕';
  insertIcon.style.cursor = 'pointer';
  insertIcon.addEventListener('click', function() {
    insertRow(row);
  });
  row.appendChild(insertIcon);
}

function insertRow(row) {
  let table = document.querySelector('#csvEditorContainer table');
  let newRow = table.insertRow(row.rowIndex);
  for (let i = 0; i < row.cells.length; i++) {
    let cell = newRow.insertCell(-1);
    cell.contentEditable = 'true';
    cell.addEventListener('mousedown', handleMouseDown);
    cell.addEventListener('mouseover', handleMouseOver);
    cell.addEventListener('mouseup', handleMouseUp);
    cell.addEventListener('blur', saveRow); 
  }
  addInsertRowIcon(newRow);
  addDeleteRowIcon(newRow);
}

// create a function to sort the table by a list of columns
// the function should take a list of column headers as an argument
// the function should provide a dialog to the user to select the columns to sort by
// the function should sort the table by the selected columns
// the parameters should be a list of objects with a column name and a sort order
// the sort order should be 'asc' or 'desc'
// the function should sort the table with the selected columns in the selected order
// the function should sort the table by the first column in the list first
// then by the second column in the list if the first column is equal
// then by the third column in the list if the first and second columns are equal
// and so on
// this has a bug where it puts the first row at the end of the table

function sortTable(selectedColumns) {
  let table = document.querySelector('#csvEditorContainer table');
  let headerRow = table.rows[0];
  let rows = Array.from(table.rows).slice(1);
  rows.sort(function(a, b) {
    for (let column of selectedColumns) {
      let columnIndex = Array.from(headerRow.cells).findIndex(cell => cell.textContent === column.columnName);
      let aValue = a.cells[columnIndex].textContent;
      let bValue = b.cells[columnIndex].textContent;
      // replace the letters that have accents, umlauts, etc. with the base letter for comparison
      aValue = aValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      bValue = bValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (aValue < bValue) {
	if (column.sortOrder === 'asc') {
	  return -1;
	} else {
	  return 1;
	}
      } else if (aValue > bValue) {
	if (column.sortOrder === 'asc') {
	  return 1;
	} else {
	  return -1;
	}
      }
    }
    return 0;
  });
  
  for (let row of rows) {
    table.appendChild(row);
  }
}

// create a function to add a dialog with a row for each column and a dropdown on each row to select the sort order
// the rows in the dialog should be draggable so that the user can change the order of the sort
// the dialog should be large and in the center of the screen
// there should be arrows to move the rows up and down
// there should be a button to sort the table
// and a button to cancel the sort
// the font size should be large enough to read easily
// the dialog should be styled nicely
function selectColumnsToSortBy() {
  let table = document.querySelector('#csvEditorContainer table');
  let headerRow = table.rows[0];
  let dialog = document.createElement('div');
  dialog.style.position = 'absolute';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.backgroundColor = 'white';
  dialog.style.padding = '20px';
  dialog.style.border = '1px solid black';
  dialog.style.borderRadius = '10px';
  dialog.style.zIndex = '1000';
  dialog.style.fontSize = '20px';
  let tableBody = document.createElement('div');
  dialog.appendChild(tableBody);
  for (let cell of headerRow.cells) {
    let row = document.createElement('div');
    tableBody.appendChild(row);
    let columnName = document.createElement('span');
    columnName.textContent = cell.textContent;
    row.appendChild(columnName);
    let sortOrder = document.createElement('select');
    row.appendChild(sortOrder);
    let ascOption = document.createElement('option');
    ascOption.textContent = 'Ascending';
    sortOrder.appendChild(ascOption);
    let descOption = document.createElement('option');
    descOption.textContent = 'Descending';
    sortOrder.appendChild(descOption);
  }
  let sortButton = document.createElement('button');
  sortButton.textContent = 'Sort';
  dialog.appendChild(sortButton);
  let cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  dialog.appendChild(cancelButton);
  document.body.appendChild(dialog);
}
