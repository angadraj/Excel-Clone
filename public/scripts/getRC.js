(function getRowsCols(N) {
    let cols = document.querySelector('.cols');
    let rows = document.querySelector('.rows');
    let cells = document.querySelector('.cells');

    for(let i = 1; i <= N; i++) {
        let str = '';
        let n = i;
        while(n > 0) {
            let rem = n % 26;
            if(rem == 0) {
                str = 'Z' + str;
                n = Math.floor(n / 26) - 1;
            } else {
                str = String.fromCharCode((rem - 1) + 65) + str;
                n = Math.floor(n / 26);
            }
        }
        // str is prepared      

        cols.insertAdjacentHTML('beforeend', '<div class="col-item">' + str + '</div>');
        rows.insertAdjacentHTML('beforeend', '<div class="row-item">' + i + '</div>');

    }

    let allHeaderCols = [].slice.call(cols.querySelectorAll('.col-item'));

    // formation of grid

    for(let i = 0; i < N; i++) {
        let cellRow = document.createElement('div');
        cellRow.classList.add('cell-row');

        for(let j = 0; j < N; j++) {
            let cellCol = document.createElement('div');
            cellCol.classList.add('cell-col');
            cellCol.setAttribute('data-idx', i * N + j);
            // add row col name
            let rowColName = allHeaderCols[j].innerText + '' + (i + 1);
            cellCol.setAttribute('row-col-name', rowColName);
            //
            cellRow.insertAdjacentElement('beforeend', cellCol);
        }
        cells.insertAdjacentElement('beforeend', cellRow);
    }

    const ps = new PerfectScrollbar('.cells', {
        wheelSpeed: 3,
        wheelPropagation: true
    });

    // make scroll 

    jQuery('.cells').scroll(function(e) {
        jQuery('.cols').scrollLeft(this.scrollLeft);
        jQuery('.rows').scrollTop(this.scrollTop);
    });

}(100));

// data = {
//     'sheet1': {
//         "1": {
//             "2": {
//                 'color': 'red',
//                 'text': '#000000',
//                 'bg-color': 'blue'
//             },
//             "10": {}
//         },
//         "100": {}
//     }
// }

// data = {
//     'sheet1': {
//         'cellIdx': {},

//     },
//     'sheet2': {

//     }
// };