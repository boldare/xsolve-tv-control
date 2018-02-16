const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow

const actions = require('../actions.js');
const tvlistJson = actions.getTvList();

var tvListElem = document.getElementById('tvList')

function getData() {
    tvListElem.innerHTML = '';

    for (var name in tvlistJson) {
        var powerColorClass = getTvPowerState(name) ? 'power-on': 'power-off';

        tvListElem.innerHTML += `
        <div class="card text-center text-wrap ${powerColorClass}">
            <div class="form-check">
                <input class="form-check-input position-static checkbox-big" type="checkbox" id="blankCheckbox" value="option1" aria-label="...">
            </div>
            <div class="card-body col align-self-end" tv="${ name }">
                    <h4 class="card-title" id="name">${ name }</h4>
                    <p class="card-text">${ tvlistJson[name].ip } <br /> ${ tvlistJson[name].mac }</p>
            </div>
        </div>
        `
    }
}

getData();

// function selectAllCheckboxes() {
//
// }
// document.querySelector('#checkbox-select-all').addEventListener('click', selectAllCheckboxes)

function powerOn() {
    return actions.powerSet(['Aula 3'], true);
}

function powerOff() {
    return actions.powerSet(['Aula 3'], false);
}

//test only

function getTvPowerState(tvName) {
    var y =Math.random();
    return y > 0.5 ? true : false;
}
