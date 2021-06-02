import {addEvent} from './selectScroll.js';
import {changeHeader} from './properties.js';

addEvent('click', 'body', function (e) {
    jQuery('.sheet-modal').removeClass('modal-open');
});

addEvent('click', '.sheet-modal', function (e) {
    e.stopPropagation();
});

//

addEvent('click', '.add-sheet', function (e) {
    lastSheet++;
    totalSheets++;
    data['Sheet' + lastSheet] = {};
    jQuery('.sheet-tab-container').append('<div class="sheet-tab">' + 'Sheet' + lastSheet + '</div>');
    // make last added ele in view
    var eleArr = [].slice.call(jQuery('.sheet-tab'));
    eleArr[eleArr.length - 1].scrollIntoView();
    changesMade = true;
});

addEvent('click', '.sheet-tab', function (e) {
    jQuery('.sheet-tab').removeClass('sheet-selected');
    jQuery(e.currentTarget).addClass('sheet-selected');
    selectSheet();
});

function selectSheet() {
    emptyPreviousSheet();
    selectedSheet = jQuery('.sheet-tab.sheet-selected').text();
    loadCurrentSheet();
}

// empty and load sheet

export function emptyPreviousSheet() {
    let sheetData = data[selectedSheet];
    if (sheetData) {
        let rowKeys = Object.keys(sheetData);
        for (let i of rowKeys) {
            let colKeys = Object.keys(sheetData[i]);
            let rowId = parseInt(i);
            for (let j of colKeys) {
                let colId = parseInt(j);
                jQuery(`.cell-col[data-idx=${rowId * 100 + colId}]`).text('');
                jQuery(`.cell-col[data-idx=${rowId * 100 + colId}]`).css({
                    'font-family': 'Noto Sans',
                    'font-size': '14px',
                    'font-weight': 'normal',
                    'font-style': 'normal',
                    'text-decoration': 'none',
                    'text-align': 'left',
                    'color': '#000000',
                    'background-color': '#fff'
                });
            }
        }
    }
}

export function loadCurrentSheet() {
    jQuery('.cell-col[data-idx="0"]').click();

    let sheetData = data[selectedSheet];
    let rowKeys = Object.keys(sheetData);
    for (let i of rowKeys) {
        let colKeys = Object.keys(sheetData[i]);
        let rowId = parseInt(i);
        for (let j of colKeys) {
            let colId = parseInt(j);
            jQuery(`.cell-col[data-idx=${rowId * 100 + colId}]`).text(sheetData[rowId][colId]['text']);
            jQuery(`.cell-col[data-idx=${rowId * 100 + colId}]`).css({
                'font-family': sheetData[rowId][colId]['fontFamily'],
                'font-size': sheetData[rowId][colId]['fontSize'],
                'font-weight': sheetData[rowId][colId]['bold'] ? 'bold' : 'normal',
                'font-style': sheetData[rowId][colId]['italic'] ? 'italic' : 'normal',
                'text-decoration': sheetData[rowId][colId]['underlined'] ? 'underline' : 'none',
                'text-align': sheetData[rowId][colId]['alignment'],
                'color': sheetData[rowId][colId]['color'],
                'background-color': sheetData[rowId][colId]['backgroundColor'] === '#000000' ? '#fff' : sheetData[rowId][colId]['backgroundColor']
            });
        }
    }
}

// close and open of modals


addEvent('contextmenu', '.sheet-tab', function (e) {
    if (jQuery(e.currentTarget).hasClass('sheet-selected')) {
        jQuery('.sheet-modal').addClass('modal-open');
        jQuery('.sheet-modal').css('left', e.pageX);
        jQuery('.sheet-tab').removeClass('sheet-selected');
        jQuery(e.currentTarget).addClass('sheet-selected');
    }
    e.preventDefault();
});

addEvent('click', '.sheet-modal', function (e) {
    if (jQuery(e.target).hasClass('rename')) {
        jQuery('.rename-modal').addClass('show-rename');
        jQuery('.delete-modal').removeClass('show-delete');
        jQuery('.delete-rename-modal').addClass('show-del-ren-modal');
        jQuery('.rename-modal input').focus();

    } else if (jQuery(e.target).hasClass('delete')) {
        if (totalSheets > 1) {
            jQuery('.delete-modal').addClass('show-delete');
            jQuery('.rename-modal').removeClass('show-rename');
            jQuery('.delete-rename-modal').addClass('show-del-ren-modal');
        } else {
            alert('There must be atleast 1 sheet');
        }
    }
});

// rename sheet

addEvent('click', '.rename-modal .cancel-btn', function (e) {
    jQuery('.rename-modal').removeClass('show-rename');
    jQuery('.delete-rename-modal').removeClass('show-del-ren-modal');
});

addEvent('click', '.rename-modal .ok-btn', function (e) {
    renameSheet();
});

function renameSheet() {
    let sheetName = jQuery('.rename-modal input').val();

    if (sheetName && !Object.keys(data).includes(sheetName)) {
        changesMade = true;
        let temp = data;
        data = {};
        for (let i of Object.keys(temp)) {
            if (i === selectedSheet) {
                data[sheetName] = temp[selectedSheet];
            } else {
                data[i] = temp[i];
            }
        }
        selectedSheet = sheetName;
        temp = {};

        jQuery('.sheet-tab.sheet-selected').text(sheetName);
        jQuery('.rename-modal').removeClass('show-rename');
        jQuery('.delete-rename-modal').removeClass('show-del-ren-modal');
        jQuery('.rename-modal input').val('');

    } else {
        alert("Please specify valid name!");
    }
}

// delete sheet

addEvent('click', '.delete-modal .cancel-btn', function (e) {
    jQuery('.delete-modal').removeClass('show-delete');
    jQuery('.delete-rename-modal').removeClass('show-del-ren-modal');
});

addEvent('click', '.delete-modal .ok-btn', function (e) {
    deleteSheet();
});

function deleteSheet() {
    changesMade = true;
    let sheetIdx = Object.keys(data).indexOf(selectedSheet);
    let currSheetEle = jQuery('.sheet-tab.sheet-selected');
    emptyPreviousSheet();
    delete data[selectedSheet];
    if (sheetIdx === 0) {
        currSheetEle.next().click();
    } else {
        currSheetEle.prev().click();
    }
    currSheetEle.remove();
    // close modal
    jQuery('.delete-modal').removeClass('show-delete');
    jQuery('.delete-rename-modal').removeClass('show-del-ren-modal');
    totalSheets--;
}

// select sheet on click of right and left btns

addEvent('click', '.scroller', function (e) {
    if (jQuery(e.currentTarget).hasClass('left-scroller')) {
        jQuery('.sheet-tab.sheet-selected').prev().click();
        let prevEle = jQuery('.sheet-tab.sheet-selected').prev()[0];
        if (prevEle) {
            prevEle.scrollIntoView();
        }

    } else if (jQuery(e.currentTarget).hasClass('right-scroller')) {
        jQuery('.sheet-tab.sheet-selected').next().click();
        let nextEle = jQuery('.sheet-tab.sheet-selected').next()[0];
        if (nextEle) {
            nextEle.scrollIntoView();
        }
    }
})

// open file modal
addEvent('click', '.menu-bar .file', function (e) {
    jQuery('.file-modal').addClass('show-file-modal');
    jQuery('.file-content').animate({
        width: '50%'
    }, 300);
});

function closeFileModal() {
    jQuery('.file-content').animate({
        width: 0
    }, 300);
    setTimeout(function () {
        jQuery('.file-modal').removeClass('show-file-modal');
    }, 300);
}

function makeNewFile() {
    emptyPreviousSheet();
    data = {
        'Sheet1': {}
    }
    jQuery('.sheet-tab').remove();
    jQuery('.sheet-tab-container').prepend('<div class="sheet-tab sheet-selected">Sheet 1</div>');
    selectSheet = 'Sheet1';
    totalSheets = 1;
    lastSheet = 1;
}

function downloadFile() {
    let anchorTag = jQuery(`<a href='data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}' download='excelCloneFile.json'></a>`);
    jQuery('.main-container').append(anchorTag);
    anchorTag[0].click();
    anchorTag.remove(); 
}

addEvent('click', '.file-options', function (e) {
    let attr = jQuery(e.currentTarget).attr('type');
    if (attr === 'new') {
        if (changesMade) {
            // ask if the user wants to save data
            jQuery('.delete-rename-modal').addClass('show-del-ren-modal');
            jQuery('.save-changes-modal').addClass('show-save-changes');
        }  else {
            makeNewFile();
        }
    } else if(attr === 'save') {
        downloadFile();
    } else if(attr === 'open') {
        openFile();
    }
    closeFileModal();
});

// cancel and save clicks

addEvent('click', '.save-changes-modal .ctas div', function (e) {
    if(jQuery(e.currentTarget).hasClass('ok-btn')) {
        // save function...
        downloadFile();
        //
        makeNewFile();
    }
    jQuery('.delete-rename-modal').removeClass('show-del-ren-modal');
    jQuery('.save-changes-modal').removeClass('show-save-changes');
})

// open file

function openFile() {
    let inputTag = jQuery(`<input accept="application/json" type='file'>`);
    jQuery('.main-container').append(inputTag);
    inputTag[0].click();
}

addEvent('change', '.main-container input[type="file"]', function(e) {
    let file = e.target.files[0];
    jQuery('.title').text(file.name.split('.')[0]);
    // to read data in file
    let reader = new FileReader(); 
    let content;
    reader.readAsText(file);
    reader.onload = function() {
        content = JSON.parse(reader.result);
        emptyPreviousSheet();
        loadFile(content);
        jQuery('.main-container input[type="file"]').remove();
    }
}); 


// load file

function loadFile(obj) {
    totalSheets = Object.keys(obj).length;
    data = obj;
    lastSheet = 0;
    jQuery('.sheet-tab').remove();
    for(let i of Object.keys(obj)) {
        jQuery('.sheet-tab-container').append(`<div class="sheet-tab">${i}</div>`);
        lastSheet++;
    }
    // select the first sheet
    jQuery('.sheet-tab:nth-of-type(1)').click();
    // this was the signature move
}