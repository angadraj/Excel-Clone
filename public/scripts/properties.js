import {addEvent, getRowNColID} from './selectScroll.js';

export function updateCellData(property, value) {
    let temp = JSON.stringify(data);
    if (value !== defaultProperties[property]) {
        jQuery('.cell-col-selected').each(function (idx, ele) {
            let [rowID, colID] = getRowNColID(ele);
            if (data[selectedSheet][rowID] === undefined) {
                data[selectedSheet][rowID] = {};
                data[selectedSheet][rowID][colID] = {};
                data[selectedSheet][rowID][colID] = {
                    ...defaultProperties
                , 'upStream': [], 'downStream': []};
                
                data[selectedSheet][rowID][colID][property] = value;
               
            } else {
                if (data[selectedSheet][rowID][colID] === undefined) {
                    data[selectedSheet][rowID][colID] = {};
                    data[selectedSheet][rowID][colID] = {
                        ...defaultProperties
                    , 'upStream': [], 'downStream': []};
                    data[selectedSheet][rowID][colID][property] = value;

                } else {
                    data[selectedSheet][rowID][colID][property] = value;
                }
            }
        });
    } else {
        jQuery('.cell-col-selected').each(function (idx, ele) {
            let [rowID, colID] = getRowNColID(ele);
            if (data[selectedSheet][rowID] && data[selectedSheet][rowID][colID]) {
                data[selectedSheet][rowID][colID][property] = value;
                if (JSON.stringify(data[selectedSheet][rowID][colID]) == JSON.stringify(defaultProperties)) {
                    delete data[selectedSheet][rowID][colID];
                    if(Object.keys(data[selectedSheet][rowID]).length === 0) {
                        delete data[selectedSheet][rowID];
                    }
                }
            }
        });
    }
    if(temp !== JSON.stringify(data)) {
        // upstream and downstream arrays are made saperately, because ...make 1 level of copy, so doing 44th line thing would point on same up and down arr
        changesMade = true;
    }
}

addEvent('click', '.alignment', function (e) {
    let alignStyle = jQuery(e.currentTarget).attr('data-type');
    jQuery('.alignment').removeClass('selected-align');
    jQuery(e.currentTarget).addClass('selected-align');
    jQuery('.cell-col-selected').css('text-align', alignStyle);
    //  change alignment property of all cells selected
    updateCellData('alignment', alignStyle);
});

export function changeHeader(ele) {
    let [rowID, colID] = getRowNColID(ele);
    let currObj;

    if (data[selectedSheet][rowID] && data[selectedSheet][rowID][colID]) {
        currObj = data[selectedSheet][rowID][colID];

    } else {
        currObj = defaultProperties;
    }
    
    // alignment

    jQuery('.alignment').removeClass('selected-align');
    jQuery(`.alignment[data-type=${currObj['alignment']}]`).addClass('selected-align');

    // font styles

    if (currObj['bold']) {
        jQuery('.font-style[data-type="bold"]').addClass('selected-font-style');
    } else {
        jQuery('.font-style[data-type="bold"]').removeClass('selected-font-style');

    }
    if (currObj['italic']) {
        jQuery('.font-style[data-type="italic"]').addClass('selected-font-style');

    } else {
        jQuery('.font-style[data-type="italic"]').removeClass('selected-font-style');

    }
    if (currObj['underlined']) {
        jQuery('.font-style[data-type="underlined"]').addClass('selected-font-style');

    } else {
        jQuery('.font-style[data-type="underlined"]').removeClass('selected-font-style');
    }

    // color picker
    jQuery('.color-picker[data-type="fill"]').css({
        'color': currObj['backgroundColor']
    });

    jQuery('.color-picker[data-type="color-text"]').css({
        'color': currObj['color']
    });

    // font-family and font-size

    jQuery('.font-size-selector').val(currObj['fontSize']);
    jQuery('.font-style-selector').val(currObj['fontFamily']);
    jQuery('.font-style-selector').css('font-family', currObj['fontFamily']);

    // change of formulas
    jQuery('.formula-tab').text(currObj.formula);

}

// change of font styles

addEvent('click', '.font-style', function (e) {
    let option = jQuery(e.currentTarget).attr('data-type');
    changeFontStyles(e, option);
});

function changeFontStyles(e, option) {
    if (jQuery(e.currentTarget).hasClass('selected-font-style')) {
        // toggle
        jQuery(e.currentTarget).removeClass('selected-font-style');
        updateCellData(option, false);

        switch (option) {
            case 'bold':
                jQuery('.cell-col-selected').css('font-weight', 'normal');
                break;

            case 'italic':
                jQuery('.cell-col-selected').css('font-style', 'normal');
                break;

            case 'underlined':
                jQuery('.cell-col-selected').css('text-decoration', 'none');
                break;
        }

    } else {
        jQuery(e.currentTarget).addClass('selected-font-style');
        updateCellData(option, true);

        switch (option) {
            case 'bold':
                jQuery('.cell-col-selected').css('font-weight', 'bold');
                break;

            case 'italic':
                jQuery('.cell-col-selected').css('font-style', 'italic');
                break;

            case 'underlined':
                jQuery('.cell-col-selected').css('text-decoration', 'underline');
                break;
        }
    }
}

// color picker

jQuery('.color-picker').colorPick({
    'initialColor': '#abcd',
    'recentMax': 5,
    'allowCustomColor': true,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function () {
        if (this.color !== '#ABCD') {

            if (jQuery(this.element).attr('data-type') === 'fill') {
                backgroundFill(this.element, this.color);

            } else if (jQuery(this.element).attr('data-type') === 'color-text') {
                textFill(this.element, this.color);
            }
        }
    }
});

function backgroundFill(ele, color) {
    jQuery(ele).css('color', color);
    jQuery('.cell-col-selected').css('background-color', color);
    updateCellData('backgroundColor', color);
}

function textFill(ele, color) {
    jQuery(ele).css('color', color);
    jQuery('.cell-col-selected').css('color', color);
    updateCellData('color', color);
}

// font style and font family 

addEvent('change', '.font-size-selector', function (e) {
    let fontSize = Number(jQuery(e.currentTarget).val());
    jQuery('.cell-col-selected').css('font-size', fontSize);
    updateCellData('fontSize', jQuery(e.currentTarget).val());
});

addEvent('change', '.font-style-selector', function (e) {
    let fontFamily = jQuery(e.currentTarget).val();
    jQuery(e.currentTarget).css('font-family', fontFamily);
    jQuery('.cell-col-selected').css('font-family', fontFamily);
    updateCellData('fontFamily', fontFamily);
});