// based on upstream and downstream dependencies
// upstream : A's upstream : on which it is dependent
// A -> (b, c)
// downstream : b and c will have downstream dependency of A
import {addEvent, getRowNColID} from './selectScroll.js';
import {loadCurrentSheet} from './sheets.js'

addEvent('blur', '.formula-bar > div', function(e) {
    let eleClass = jQuery(e.currentTarget).attr('class').split(' ')[1];
    if(eleClass === 'cell-address') {   
        console.log('cell address hit');
    } else if(eleClass === 'formula-sign') {
        console.log('cell formula hit');
    } else if(eleClass === 'formula-tab') {
        implementFormula(e.currentTarget);
    }
});

function implementFormula(ele) {
    if(jQuery('.cell-col-selected').length > 0) {

        let formula = jQuery(ele).text();
        // formula validation
        let items = [];
        let temp = formula.split(' ');
        for(let i of temp) {
            if(i.length >= 2) {
                i = i.replace('(', '');
                i = i.replace(')', '');
                if(!items.includes(i)) {
                    items.push(i);
                }
            }
        }
        console.log(items);
        jQuery('.cell-col-selected').each(function(idx, cell) {
            if(updateStreams(cell, items, false)) {
                let [rowId, colId] = getRowNColID(cell);
                data[selectedSheet][rowId][colId].formula = formula;
                let selfCode = jQuery(cell).attr('row-col-name');
                evalFormula(selfCode);
            } else {
                alert('Formula invalid!');
            }
        })
    } else {
        alert('Please select any cell!');
    }
}

// ele: current selected element
export function updateStreams(cell, arr, update, oldUpStream) {

    let [rowId, colId] = getRowNColID(cell);
    let selfCode = jQuery(cell).attr('row-col-name');

    
    // check if the ele is itself present
    if(arr.includes(selfCode)) {
        console.log(selfCode);
        return false;
    }
    
    if(data[selectedSheet][rowId] && data[selectedSheet][rowId][colId]) {
        let downStream = data[selectedSheet][rowId][colId].downStream;
        let upStream = data[selectedSheet][rowId][colId].upStream;
        for(let i of downStream) {
            if(arr.includes(i)) {
                return false;
            }
        }

        for(let i of downStream) {
            updateStreams(jQuery(`.cell-col[row-col-name=${i}]`)[0], arr, true, upStream);
        }
    }

    //  if element is not there

    if(!data[selectedSheet][rowId]) {
        data[selectedSheet][rowId] = {};
        data[selectedSheet][rowId][colId] = {...defaultProperties, 'upStream': [...arr], 'downStream': []}; 
    } else if(!data[selectedSheet][rowId][colId]) {
        data[selectedSheet][rowId][colId] = {...defaultProperties, 'upStream': [...arr], 'downStream': []};  
    } else {
        // if element is present 

        let upStream = [...data[selectedSheet][rowId][colId].upStream];
        if(update) {      
        //  maybe upstream is updated more than 1st time
            for(let i of oldUpStream) {
                let [dr, dc] = codeToValue(i);
                let idx = data[selectedSheet][dr][dc].downStream.indexOf(selfCode);
                data[selectedSheet][dr][dc]['downStream'].splice(idx, 1);
                // now after changing downstream it may have default properties
                if(JSON.stringify(data[selectedSheet][dr][dc]) === JSON.stringify(defaultProperties)) {
                    delete data[selectedSheet][dr][dc]; 
                    if(Object.keys(data[selectedSheet][dr]).length === 0) {
                        delete data[selectedSheet][dr];
                    }
                } 
                idx = data[selectedSheet][rowId][colId].upStream.indexOf(i);
                data[selectedSheet][rowId][colId].upStream.splice(idx, 1);
            } 
            for(let i of arr) {
                data[selectedSheet][rowId][colId].upStream.push(i);
            }
        } else {
            for(let i of upStream) {
                let [dr, dc] = codeToValue(i);
                let index = data[selectedSheet][dr][dc].downStream.indexOf(selfCode);
                data[selectedSheet][dr][dc].downStream.splice(index, 1);
                if(JSON.stringify(data[selectedSheet][dr][dc]) === JSON.stringify(defaultProperties)) {
                    delete data[selectedSheet][dr][dc];
                    if(Object.keys(data[selectedSheet][dr]).length === 0) {
                        delete data[selectedSheet][dr];
                    }
                }
            }
            data[selectedSheet][rowId][colId].upStream = [...arr];
        }

    }
    // update downstream
    for(let i of arr) {
        let [drow, dcol] = codeToValue(i);
        if(!data[selectedSheet][drow]) {
            data[selectedSheet][drow] = {};
            data[selectedSheet][drow][dcol] = {};
            data[selectedSheet][drow][dcol] = {...defaultProperties, 'upStream': [], 'downStream': [selfCode]};
        } else if(!data[selectedSheet][drow][dcol]) {
            data[selectedSheet][drow][dcol] = {...defaultProperties, 'upStream': [], 'downStream': [selfCode]};
        } else {
            data[selectedSheet][drow][dcol].downStream.push(selfCode);
        }
    }
    return true;
}   

function codeToValue(code) {
    return getRowNColID(jQuery(`.cell-col[row-col-name=${code}]`));
}

export function evalFormula(code) {
    let [rowId, colId] = codeToValue(code);
    if(data[selectedSheet][rowId] && data[selectedSheet][rowId][colId]) {
        let formula = data[selectedSheet][rowId][colId].formula;
        console.log('line 144' + formula);
        if(formula != '') {
            let upStream = data[selectedSheet][rowId][colId].upStream;
            let upStreamVals = [];
            for (let i in  upStream) {
                let [dr, dc] = codeToValue(upStream[i]);
                let value;
                if(data[selectedSheet][dr][dc].text === '') {
                    value = '0';
                } else {
                    value = data[selectedSheet][dr][dc].text;
                }
                upStreamVals.push(value);
                console.log('line 157'+ upStreamVals);
                formula = formula.replace(upStream[i], upStreamVals[i]);
            }
            // in built function eval 
            data[selectedSheet][rowId][colId].text = eval(formula);
            // after updating the data, need to load the sheet
            loadCurrentSheet();
        }
        let downStream = data[selectedSheet][rowId][colId].downStream;
        for(let i = downStream.length - 1; i >= 0; i--) {
            evalFormula(downStream[i]);
        }
    }
}