'use strict';
// API GW endpoint should be added here.
const urlRoot = "https://vxd5wsu94c.execute-api.us-east-1.amazonaws.com/prod";

// index.html part.
function maintainInitButtonPress(buttonId) {
    // getting table name from button id
    let urlSuffix = buttonId.split("_").at(-1);
    console.log(`${urlRoot}/${urlSuffix}`);
    // calling REST API endpoint to init the table on the AWS side.
    fetch(`${urlRoot}/${urlSuffix}`, { mode: "no-cors" }).
        then(result => { alert(`Table ${urlSuffix} is initiated successfully`) }).
        catch(err => { alert(err) });
}

async function get_data(event) {
    // looking for Enter button press on the text input form
    if (event.keyCode === 13) {
        // dropping drawing div to empty state.
        document.querySelector('div[class$="data_draw"]').innerHTML = "";
        // if name value on get_data.html page is provided => we
        // are looking for a single record.
        let singleRecord = true;
        // getting table name and object name values from get_data.html page
        let tableName = document.getElementById("table_name");
        let objectName = document.getElementById("object_name");
        let getRequestUrl;
        if (objectName.value == '') {
            // if object name is not providede => we are looking for entire table content
            console.log("Entire table content is requested");
            console.log(`resource: ${tableName.value}`);
            getRequestUrl = new URL(`${urlRoot}/anyResource?resource=${tableName.value}`);
            singleRecord = false;
        }
        else {
            console.log("Single record is requested");
            console.log(`resource: ${tableName.value}, name: ${objectName.value}`);
            getRequestUrl = new URL(`${urlRoot}/anyResource?resource=${tableName.value}&name=${objectName.value}`);
        }
        console.log(`Request url: ${getRequestUrl}`);
        let responce = await fetch(getRequestUrl);
        if (responce.status == 200) {
            // in case of no issues with the initial request proceed maintaining the retrieved data
            let data = await responce.json();
            console.log(data)
            if (singleRecord) {
                // since we are looking for individual object from database
                // we'll draw that single object
                drawSingleItem(data.Item);
            }
            else {
                drawMultipleItem(data);
            }

        }
        else {
            let data = await responce.text();
            drawError(data, responce.status);
        }
    }
}

function drawSingleItem(data) {
    // playing with divs:
    // getting the one from page with class data_draw
    let dataDrawDiv = document.querySelector('div[class$="data_draw"]');
    // running through all keys of the retrieved object
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
        // creating the new divs, adding proper classes, adding proper content
        // css is ready for that classes.
        let dataDrawCell = document.createElement('div');
        dataDrawCell.classList.add('data_draw_cell');
        dataDrawDiv.append(dataDrawCell);
        let cellTitle = document.createElement('div');
        cellTitle.classList.add('data_draw_title');
        cellTitle.innerText = makeTitle(keys[i]);
        dataDrawCell.appendChild(cellTitle);
        let cellData = document.createElement('div');
        cellData.classList.add('data_draw_retrieved_data');
        cellData.innerText = data[keys[i]];
        dataDrawCell.appendChild(cellData);
        // adding radius classes to first and last keys to have nice
        // rounded corners of div elements
        if (i == 0) {
            cellTitle.classList.add('data_draw_top_left');
            cellData.classList.add('data_draw_top_right');
        }
        if (i == keys.length - 1) {
            cellTitle.classList.add('data_draw_bottom_left');
            cellData.classList.add('data_draw_bottom_right');
        }

    }
}
function drawMultipleItem(data) {
    let dataDrawDiv = document.querySelector('div[class$="data_draw"]');
    let cellWidth = Math.round(100 / Object.keys(data[0]).length);

    let tableTitle = document.createElement('div');
    tableTitle.classList.add('data_draw_table_title');
    dataDrawDiv.appendChild(tableTitle);

    let tableContent = document.createElement('div');
    tableContent.classList.add('data_draw_table_content');
    dataDrawDiv.appendChild(tableContent);

    for (let i = 0; i < data.length; i++) {
        let keys = Object.keys(data[i]);
        if (i == 0) {
            for (let j = 0; j < keys.length; j++) {
                let cellTitle = document.createElement('div');
                cellTitle.classList.add('ddtt_cell');
                cellTitle.innerText = makeTitle(keys[j]);
                cellTitle.style.width = `${cellWidth}%`;
                tableTitle.appendChild(cellTitle);
            }
        }
        let tableContentLine = document.createElement('div');
        tableContentLine.classList.add('data_draw_table_line');
        tableContent.appendChild(tableContentLine);
        for (let j = 0; j < keys.length; j++) {
            let cellContent = document.createElement('div');
            cellContent.classList.add('ddtl_cell');
            cellContent.innerText = data[i][keys[j]];
            cellContent.style.width = `${cellWidth}%`;
            tableContentLine.appendChild(cellContent);
        }
        if (i == data.length - 1) {
            tableContentLine.classList.add('table_line_last');
        }
    }
}

// database has key records like episode_id.
// that function makes it like Episode Id
function makeTitle(rawData) {
    return rawData
        .split("_")
        .map(item => {
            return item.charAt(0).toUpperCase() + item.slice(1)
        })
        .join(' ');
}

function drawError(data, status) {
    let dataDrawDiv = document.querySelector('div[class$="data_draw"]');
    let errDiv = document.createElement('div');
    errDiv.classList.add('error_msg');
    errDiv.innerText = `${data}. Respond status code: ${status}`;
    dataDrawDiv.appendChild(errDiv);
}

// function to get approximate table structure.
async function getTableFields() {
    document.querySelector('div[class$="data_draw"]').innerHTML = "";

    let selectedIndex = document.getElementById("table_name").options.selectedIndex;
    let selectedTableName = document.getElementById("table_name").options[selectedIndex].value;
    let getRequestUrl = new URL(`${urlRoot}/anyResource?resource=${selectedTableName}`);
    let dataDrawDiv = document.querySelector('div[class$="data_draw"]');

    console.log(`Request url: ${getRequestUrl}`);
    let responce = await fetch(getRequestUrl);
    if (responce.status == 200) {
        let data = await responce.json();
        console.log(data);
        let keys = Object.keys(data[0]);

        keys.forEach(keyValue => {
            let newDiv = document.createElement('div');
            newDiv.innerText = keyValue;
            dataDrawDiv.appendChild(newDiv);
        })
    }
    else {
        let msg = `Table ${selectedTableName} is empty, use any structure, you want`;
        console.log(msg)
        let msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.innerText = msg;
        dataDrawDiv.appendChild(msgDiv);
    }

}

function testFunction(event) {
    console.log(event);
}