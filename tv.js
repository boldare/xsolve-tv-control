const BraviaRemoteControl = require('sony-bravia-tv-remote');
const commandLineArgs = require('command-line-args');
const clu = require('command-line-usage');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('tvconfig.json', 'utf8'));

const help = [
    {
        header: 'XSolve TV control',
        content: 'Help.'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'help, -h',
                description: 'Displays this help.'
            },
            {
                name: 'poweron',
                description: 'Turns TV on. Example: --poweron'
            },
            {
                name: 'poweroff',
                description: 'Turns TV off. Example: --poweroff'
            }
        ]
    }
]
console.log(config);

const clu_help = clu(help);

const cliOptionDefinitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'poweron', type: Boolean},
    { name: 'poweroff', type: Boolean},
]
const cliOptions = commandLineArgs(cliOptionDefinitions);

if(cliOptions.help) {
    console.log(clu_help);
    process.exit(0);
}

const remote = new BraviaRemoteControl('10.254.252.241', 80, 'w4gu0kswvhkiu');

if(cliOptions.poweron) {
    powerSet('test-value', true).then(function() {
        process.exit(0);
    });
}

if(cliOptions.poweroff) {
    powerSet('test-value', false).then(function() {
        process.exit(0);
    });
}

//=======interneal

function powerSet(tvName, powerState) {
    return remote.sendAction(powerState ? 'PowerOn' : 'PowerOff');
}
