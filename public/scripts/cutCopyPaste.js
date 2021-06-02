import {addEvent, getRowNColID} from './selectScroll.js';
import {loadCurrentSheet, emptyPreviousSheet} from './sheets.js';

addEvent('click', '.menu-icon-item', function(e) {
    let eleType = jQuery(e.currentTarget).attr('class').split(' ')[2];

    if(eleType === 'cut') {
        cut();

    } else if(eleType === 'copy') {
        copy();

    } else if(eleType === 'paste') {
        paste();
    }
})

let clipBoard = {
    startCell: [],
    cellData: []
};

function copy() {
    clipBoard = {
        startCell: [],
        cellData: []
    };

    clipBoard.startCell = getRowNColID(jQuery('.cell-col-selected')[0]);
    jQuery('.cell-col-selected').each(function(idx, ele) {
        let [rowId, colId]  = getRowNColID(ele); 
        // validate if row and col is present in data, ie changes are done
        if(data[selectedSheet][rowId] && data[selectedSheet][rowId][colId]) {
            if(!clipBoard.cellData[rowId]) {
                clipBoard.cellData[rowId] = {};
            }
            clipBoard.cellData[rowId][colId] = {...data[selectedSheet][rowId][colId]}
        } 
    });
}

function paste() {
    // for cut 
    if(cutUsed) {
        emptyPreviousSheet();
        // first empty every thing on click of paste and then load sheet at last will fill everything
    }
    let startCellXY = getRowNColID(jQuery('.cell-col-selected')[0]);
    // for paste travel in matrix form

    // cut and delete work 

    let rows = Object.keys(clipBoard.cellData);
    for(let i of rows) {
        let cols = Object.keys(clipBoard.cellData[i]);
        for(let j of cols) {
            if(cutUsed) {
                delete data[selectedSheet][i][j];
                if(Object.keys(data[selectedSheet][i]).length === 0) {
                    delete data[selectedSheet][i];
                }
            }
        }
    }

    // only pasting work

    for(let i of rows) {
        let cols = Object.keys(clipBoard.cellData[i]);
        for(let j of cols) {
            let rowDistance = parseInt(i) - parseInt(clipBoard.startCell[0]);
            let colDistance = parseInt(j) - parseInt(clipBoard.startCell[1]);
            // update data of new cell on which paste is invoked
            if(!data[selectedSheet][startCellXY[0] + rowDistance]) {
                data[selectedSheet][startCellXY[0] + rowDistance] = {};
            }
            data[selectedSheet][startCellXY[0] + rowDistance][startCellXY[1] + colDistance] = {...clipBoard.cellData[i][j]};
        }
    }

    if(cutUsed) {
        clipBoard = {
            startCell: [],
            cellData: []
        };
        cutUsed = false;
    }

    loadCurrentSheet();
}

let cutUsed = false;

function cut() {
    cutUsed = true;
    copy();
}