// @ts-expect-error
import DeltosAscii from "./../../internal/deltos_ascii.txt" with { type: "text" };

let development: boolean = true;

/**
 * The Output object provides various logging functions for different types of messages.
 */
export const Output = {
    http: (req: Request) => {
        if (development) console.log(Color.yellow + req.method + Color.reset + " " + req.url)
    },
    error: (message: string) => {
        if (development) console.log(Color.bold + Color.red + "ERROR: " + Color.reset + message)
    },
    info: (message: string) => {
        console.log(Color.bold + Color.blue + "[info] " + Color.reset + message)
    },
    ws: (message: string) => {
        if (development) console.log(Color.bold + Color.green + "WS " + Color.reset + message)
    },
    debug: (message: any) => {
        if (!development) return;
        console.log(Color.bold + Color.magenta + "[debug] " + Color.reset);
        Object.keys(message).forEach(key => {
            console.log(key + ": " + JSON.stringify(message[key]));
        });
    },
    /**
     * the center function centers a message in the console.
     * @param message The message to center
     * @param dotted Optional: whether to use dots instead of spaces
     */
    center: (message: string, dotted: boolean = false) => {
        let lineLength = 70;
        let center = Math.floor((lineLength - message.length) / 2);
        let line = "";
        for (let i = 0; i < center; i++) {
            line += (dotted ? "-" : " ");
        }
        console.log(line + message + line);
    },
    printProgress: (progress: string) => {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(progress + '%');
    }
    
}

export const Color = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    reset: "\x1b[0m",
    red_bg: "\x1b[41m",
    green_bg: "\x1b[42m",
    yellow_bg: "\x1b[43m",
    blue_bg: "\x1b[44m",
    magenta_bg: "\x1b[45m",
    cyan_bg: "\x1b[46m",
    white_bg: "\x1b[47m",

    bold: "\x1b[1m",
    underline: "\x1b[4m",
    inverse: "\x1b[7m",
    hidden: "\x1b[8m",
    strikethrough: "\x1b[9m",
}

export function splashscreen () {
    console.log(Color.green, Color.bold)
    Output.center("", true);
    console.log(DeltosAscii+"\n");
    Output.center("Welcome to Deltos!", true);
    console.log(Color.blue);
    Output.center("Running on Bun.js "+Bun.version+ " and Deltos "+(Bun.env.BUILD_VERSION || "dev"));
    process.stdout.write("\n\n");
    Output.info("Deltos is a lightweight, modular, and easy-to-use cloud service.");
    Output.info("Visit https://deltos.com for more information.\n");
}