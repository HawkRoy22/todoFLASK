// Query the Table
const table = document.getElementById('table')

let draggingEle;
let draggingRowIndex;
let placeholder;
let list;
let isDraggingStarted = false;

// The current position of mouse relative to the dragging element
let x = 0;
let y = 0;

//Swap two nodes
const swap = function(nodeA, nodeB) {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling == nodeB ? nodeA : nodeA.nextSibling;

    // Move 'nodeA' to before the 'nodeB'
    nodeB.parentNode.insertBefore(nodeA, nodeB);

    // Move 'nodeB' to before the siblign of 'nodeA'
    parentA.insertBefore(nodeB, siblingA);
};

const isAbove = function(nodeA, nodeB) {
    // Get the bounding rectangle of nodes
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();

    return (rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2);
}

const cloneTable = function() {
    const rect = table.getBoundingClientRect();
    const width = parseInt(window.getComputedStyle(table).width);

    list = document.createElement('div')
    list.classList.add('clone-list');
    list.style.position = 'absolute';
    list.style.left = '${rect.left}px';
    list.style.top = '${rect.top}px';
    table.parentNode.insertBefore(list, table)

    // Hide the original table
    table.style.visibility = 'hidden';

    table.querySelectorAll('tr').forEach(function(row) {
        // Create a new table from given row
        const item = document.createElement('div');
        item.classList.add('draggable');

        const newTable = document.createElement('table');
        newTable.setAttribute('class', 'clone-table');
        newTable.style.width = '${width}px';

        const newRow = document.createElement('tr')
        const cells = [].slice.call(row.children)
        cells.forEach(function(cell) {
            const newCell = cell.cloneNode(true);
            newCell.style.width = '${parseInt(window.getComputedStyle(cell).width)}px';
            newRow.appendChild(newCell)
        });

        newTable.appendChild(newRow)
        item.appendChild(newTable)
        list.appendChild(item)
    });
};


const mouseDownHandler = function(e) {
    // Get the original row
    const originalRow = e.target.parentNode;
    draggingRowIndex = [].slice.call(table.querySelectorAll('tr'))
    
    // Determine the mouse position
    x = e.clientX;
    y = e.clientY;

    // Attaching the listerners to 'document'
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function(e) {

    if (!isDraggingStarted) {
        isDraggingStarted = true;

        cloneTable()

        draggingEle = [].slice.call(list.children)[draggingRowIndex];
        draggingEle.classList.add('dragging');

        // Let the placeholder take the height of dragging element
        // So the next element won't move up
        placeholder = document.createElement('div');
        placeholder.classList.add('placeholder');
        draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
        placeholder.style.height = '${dragging.offsetHeight}px'
    }

    // Set position for dragging element
    draggingEle.style.position = 'absolute';
    draggingEle.style.top = '${draggingEle.offsetTop + e.clientY - y}px';
    draggingEle.style.left = '${draggingEle.offsetLeft + e.clientX - x}px';

    // Reassign the position of mouse
    x = e.clientX;
    y = e.clientY;

    // The current order
    // prevEle
    // draggingEle
    // placeholder
    // nextEle
    const prevEle = draggingEle.previousElementSibling;
    const nextEle = placeholder.nextElementSibling;

    // The dragging element is above the previous element
    // User moves the dragging element to the top
    // We don't allow to drop the above the header
    // (which doesn't have 'previousElementSibling')
    if (prevEle && prevEle.previousElementSibling && isAbove(draggingEle, preveEle)) {
        swap(placeholder, draggingEle);
        swap(placeholder, preveEle);
        return;
    }

    if (nextEle && isAbove(nextEle, draggingEle)) {
        swap(nextEle, placeholder);
        swap(nextEle, draggingEle);
    };
};

const mouseUpHandler = function() {
    // Remove the placeholder
    placeholder && placeholder.parentNode.removeChild(placeholder)

    draggingEle.classList.remove('dragging');
    draggingEle.style.removeProperty('top')
    draggingEle.style.removeProperty('left')
    draggingEle.style.removeProperty('position')

    // Get the end index
    const endRowIndex = [].slice.call(list.children).indexOf(draggingEle);

    isDraggingStarted = false;

    // Remove the 'list' element
    list.parentNode.removeChild(list);

    // Move the dragged row to 'endRowIndex'
    let rows = [].slice.call(table.querySelectorAll('tr'));
    draggingRowIndex > endRowIndex
        ? rows[endRowIndex].parentNode.insertBefore(rows[draggingRowIndex], rows[endRowIndex])
        : rows[endRowIndex].parentNode.insertBefore(rows[draggingRowIndex], rows[endRowIndex].nextSibling);
    
    // Bring back the table
    table.style.removeProperty('visibility');

    // Remove the handlers of 'mousemove' and 'mouseup'
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};

// Query all rows
table.querySelectorAll('tr').forEach(function(row, index) {
    if (index === 0) {
        return;
    }
    // Get the first cell of row
    const firstCell = row.firstElementChild;
    firstCell.classList.add('draggable');
    // Attach Event Handler
    firstCell.addEventListener('mousedown', mouseDownHandler);
});