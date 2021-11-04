'use strict';
// API GW endpoint should be added here.
const urlRoot = "https://tz319u77cl.execute-api.us-east-1.amazonaws.com/prod";

function maintainInitButtonPress(buttonId) {
    let urlSuffix = buttonId.split("_").at(-1);
    console.log(`${urlRoot}/${urlSuffix}`);
    fetch(`${urlRoot}/${urlSuffix}`,
        { mode: "no-cors" }).
        then(result => { alert(`Table ${urlSuffix} is initiated successfully`) }).
        catch(err => { alert(err) });
}