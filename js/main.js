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
// get_data.html part
// getting data function
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
// function to draw a table for a sigle requested value
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
// function to draw a table for all table content 
function drawMultipleItem(data) {
    // getting major div element for drawing
    let dataDrawDiv = document.querySelector('div[class$="data_draw"]');
    // calculating the cell width
    let cellWidth = Math.round(100 / Object.keys(data[0]).length);

    // table title div with proper class
    let tableTitle = document.createElement('div');
    tableTitle.classList.add('data_draw_table_title');
    dataDrawDiv.appendChild(tableTitle);

    // table content div with proper class
    let tableContent = document.createElement('div');
    tableContent.classList.add('data_draw_table_content');
    dataDrawDiv.appendChild(tableContent);

    // for each element that should be drawn
    for (let i = 0; i < data.length; i++) {
        let keys = Object.keys(data[i]);
        // if that is the first drawing iteration -> making title cells with
        // object keys values inside
        if (i == 0) {
            for (let j = 0; j < keys.length; j++) {
                let cellTitle = document.createElement('div');
                cellTitle.classList.add('ddtt_cell');
                cellTitle.innerText = makeTitle(keys[j]);
                cellTitle.style.width = `${cellWidth}%`;
                tableTitle.appendChild(cellTitle);
            }
        }
        // individual line of a data to draw with proper class
        let tableContentLine = document.createElement('div');
        tableContentLine.classList.add('data_draw_table_line');
        tableContent.appendChild(tableContentLine);
        // for each element key drawing cells of object data with proper values.
        // here we consider that each object from data has the same amount of keys with the same sequence.
        // in all other cases at lease name will be seen.
        for (let j = 0; j < keys.length; j++) {
            let cellContent = document.createElement('div');
            cellContent.classList.add('ddtl_cell');
            cellContent.innerText = data[i][keys[j]];
            cellContent.style.width = `${cellWidth}%`;
            tableContentLine.appendChild(cellContent);
        }
        // for the last element we adding additinal div class to make round corners
        if (i == data.length - 1) {
            tableContentLine.classList.add('table_line_last');
        }
    }
}

// database has key records like episode_id.
// that function makes it like Episode Id
function makeTitle(rawData) {
    return rawData
        // splitting an input string with "_" character
        .split("_")
        // for each element of split result make first letter in upper case
        .map(item => {
            return item.charAt(0).toUpperCase() + item.slice(1)
        })
        // joining all elements together
        .join(' ');
}

// function to draw error
function drawError(data, status) {
    let dataDrawDiv = document.querySelector('div[class$="data_draw"]');
    let errDiv = document.createElement('div');
    errDiv.classList.add('error_msg');
    errDiv.innerText = `${data}. Respond status code: ${status}`;
    dataDrawDiv.appendChild(errDiv);
}