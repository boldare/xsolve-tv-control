module.exports = {
    help: [
        {
            header: 'XSolve TV Control',
            content: 'Help.',
        },
        {
            header: 'Options',
            optionList: [
                {
                    name: 'help, -h',
                    description: 'Displays this help.',
                },
                {
                    name: 'poweron',
                    description: 'Turns TV on.',
                },
                {
                    name: 'poweroff',
                    description: 'Turns TV off.',
                },
                {
                    name: 'volume',
                    description: 'Sets volume. Allowed range: 0-100.',
                },
                {
                    name: 'list',
                    description: 'Displays available TVs',
                },
                {
                    name: 'state',
                    description: 'Displays TVs power state',
                },
                {
                    name: 'tv',
                    description: 'Selects specific TV. All may be selected using --all option',
                },
                {
                    name: 'all',
                    description: 'Selects all TVs.',
                },
                {
                    name: 'run',
                    description: 'Runs application. Example: --run opera',
                },
                {
                    name: 'kill',
                    description: 'Kills application. Example: --kill opera',
                },
                {
                    name: 'viewpage',
                    description: 'Runs youtube movie. Example --viewpage "https://www.google.com"',
                },
                {
                    name: 'browser',
                    description: 'additional parameter for --viewpage. Specific browser may be specified (for example "chrome"). Browser must be defined in "appconfig.json" file.',
                },
                {
                    name: 'yt',
                    description: 'Runs youtube movie. Example --yt "https://www.youtube.com/watch?v=G1IbRujko-A"',
                },
            ],
        },
    ],
    cliOptionDefinitions: [
        {
            name: 'help',
            alias: 'h',
            type: Boolean,
        },
        {
            name: 'poweron',
            type: Boolean,
        },
        {
            name: 'poweroff',
            type: Boolean,
        },
        {
            name: 'volume',
            type: Number,
        },
        {
            name: 'list',
            type: Boolean,
        },
        {
            name: 'state',
            type: Boolean,
        },
        {
            name: 'tv',
            type: String,
            multiple: true,
        },
        {
            name: 'all',
            type: Boolean,
        },
        {
            name: 'run',
            type: String,
            multiple: false,
        },
        {
            name: 'kill',
            type: String,
            multiple: false,
        },
        {
            name: 'viewpage',
            type: String,
            multiple: false,
        },
        {
            name: 'browser',
            type: String,
            multiple: false,
        },
        {
            name: 'yt',
            type: String,
            multiple: false,
        },
    ],
};
