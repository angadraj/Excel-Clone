import {changeHeader, updateCellData} from './properties.js';
import {updateStreams, evalFormula} from './formula.js';


export function addEvent(type, sel, callback) {
    jQuery(document).on(type, sel, function (e) {
        callback(e);
    });
}

// add events
       
addEvent('dblclick', '.cell-col', function (e) {
    jQuery('.cell-col-selected').removeClass('cell-col-selected right-selected left-selected bottom-selected top-selected');
    jQuery(e.target).addClass('cell-col-selected');
    jQuery(e.target).attr('contenteditable', 'true');
})

addEvent('blur', '.cell-col', function (e) {
    jQuery(e.target).attr('contenteditable', 'false');
    updateCellData('text', jQuery(e.target).text());
    // formula related
    let [rowId, colId] = getRowNColID(e.currentTarget);
    if(data[selectedSheet][rowId] && data[selectedSheet][rowId][colId] && data[selectedSheet][rowId][colId].formula !== '') {
        updateStreams(e.currentTarget, []);
    }
    if(data[selectedSheet][rowId] && data[selectedSheet][rowId][colId]) {
        data[selectedSheet][rowId][colId].formula = '';
    }
    let selfCode = jQuery(e.currentTarget).attr('row-col-name');
    evalFormula(selfCode);
})

export function getRowNColID(ele) {
    let id = Number(jQuery(ele).attr('data-idx'));
    let currRow = Math.floor(id / 100);
    let currCol = Math.floor(id % 100);
    return [currRow, currCol];
}

function getTopRightBottomLeftCell(currRow, currCol) {
    let topCell = jQuery(`.cell-col[data-idx=${(currRow - 1) * 100 + currCol}]`);
    let rightCell = jQuery(`.cell-col[data-idx=${currRow * 100 + (currCol + 1)}]`);
    let bottomCell = jQuery(`.cell-col[data-idx=${(currRow + 1) * 100 + currCol}]`);
    let leftCell = jQuery(`.cell-col[data-idx=${currRow * 100 + (currCol - 1)}]`);

    return [topCell, rightCell, bottomCell, leftCell];
}

addEvent('click', '.cell-col', function (e) {
    let [currRow, currCol] = getRowNColID(e.target);
    // fetch row and col name 
    jQuery('.cell-address').text(jQuery(e.currentTarget).attr('row-col-name'));
    //
    let [top, right, bottom, left] = getTopRightBottomLeftCell(currRow, currCol);
    // on click also check for unselection
    if (jQuery(e.target).hasClass('cell-col-selected') && e.ctrlKey) {
        unselectCell(e.target, e, top, right, bottom, left);
    } else {
        selectCell(e.target, e, top, bottom, left, right);
    }
})

function selectCell(ele, e, topcell, bottomcell, leftcell, rightcell) {
    if (e.ctrlKey) {
        let topselected;
        if (topcell) {
            topselected = topcell.hasClass('cell-col-selected');
        }

        let bottomselected;
        if (bottomcell) {
            bottomselected = bottomcell.hasClass('cell-col-selected');
        }

        let rightselected;
        if (rightcell) {
            rightselected = rightcell.hasClass('cell-col-selected');
        }

        let leftselected;
        if (leftcell) {
            leftselected = leftcell.hasClass('cell-col-selected')
        }

        // work on selections 

        if (topselected) {
            jQuery(ele).addClass('top-selected');
            topcell.addClass('bottom-selected');
        }
        if (bottomselected) {
            jQuery(ele).addClass('bottom-selected');
            bottomcell.addClass('top-selected');
        }
        if (rightselected) {
            jQuery(ele).addClass('right-selected');
            rightcell.addClass('left-selected');
        }
        if (leftselected) {
            jQuery(ele).addClass('left-selected');
            leftcell.addClass('right-selected');
        }


    } else {
        jQuery('.cell-col-selected').removeClass('cell-col-selected right-selected left-selected bottom-selected top-selected');
    }
    jQuery(ele).addClass('cell-col-selected');
    // exported
    changeHeader(ele);
}

function unselectCell(ele, e, topcell, rightcell, bottomcell, leftcell) {
    if (jQuery(ele).hasClass('top-selected')) {
        topcell.removeClass('bottom-selected');
    }
    if (jQuery(ele).hasClass('bottom-selected')) {
        bottomcell.removeClass('top-selected');
    }
    if (jQuery(ele).hasClass('left-selected')) {
        leftcell.removeClass('right-selected');
    }
    if (jQuery(ele).hasClass('right-selected')) {
        rightcell.removeClass('left-selected');
    }
}

// select cells on mouse drag

let startingSelectedCell = false;
let startCell = {},
    endCell = {};
let customScrollStartedR = false;
let customScrollStartedL = false;

var scrollIntervalR;
var scrollIntervalL;

function customScrollR() {
    customScrollStartedR = true;
    scrollIntervalR = setInterval(function() {
        document.querySelector('.cells').scrollTo(document.querySelector('.cells').scrollLeft + 100, 0);
    }, 100);
}
function customScrollL() {
    customScrollStartedL = true;
    scrollIntervalL = setInterval(function() {
        document.querySelector('.cells').scrollTo(document.querySelector('.cells').scrollRight - 100, 0);
    }, 100);
}

jQuery('.cells').mouseup(function(e) {
    clearInterval(scrollIntervalR);
    clearInterval(scrollIntervalL);
    customScrollStartedR = false;
    customScrollStartedL = false;
});

addEvent('mousemove', '.cell-col', function (e) {
    e.preventDefault();
    if (e.buttons === 1) {

        if(e.pageX + 100 > window.innerWidth && customScrollStartedR === false) { 
            customScrollR();
        } else if(e.pageX < 100 && customScrollStartedL == false) {
            customScrollL();
        }
        if (startingSelectedCell == false) {
            let [sr, sc] = getRowNColID(e.target);
            startCell = {
                r: sr,
                c: sc
            };
            selectAllCells(startCell, startCell);   
            startingSelectedCell = true;
            // 
            // jQuery('.cell-col-selected').attr('contenteditable', 'false');
        }

    } else {
        startingSelectedCell = false;
    }
});

// end point is calculated on mouse enter 

addEvent('mouseenter', '.cell-col', function (e) {
    if (e.buttons === 1) {
        if(e.pageX < window.innerWidth - 100 && customScrollStartedR) {
            clearInterval(scrollIntervalR);
            customScrollStartedR = false;
        }
    
        if(e.pageX + 100 > window.innerWidth && customScrollStartedL) {
            clearInterval(scrollIntervalL);
            customScrollStartedL = false;
        }   

        let [dr, dc] = getRowNColID(e.target);
        endCell = {
            r: dr,
            c: dc
        };
        selectAllCells(startCell, endCell);
    }
});

// you can use mousemove on data container for scroll too

function selectAllCells(start, end) {
    jQuery('.cell-col-selected').removeClass('cell-col-selected right-selected left-selected bottom-selected top-selected');
    for (let i = Math.min(start.r, end.r); i <= Math.max(start.r, end.r); i++) {
        for (let j = Math.min(start.c, end.c); j <= Math.max(start.c, end.c); j++) {
            let [top, right, bottom, left] = getTopRightBottomLeftCell(i, j);
            selectCell(jQuery(`.cell-col[data-idx=${i * 100 + j}]`)[0], {
                "ctrlKey": true
            }, top, bottom, left, right);
        }
    }
}