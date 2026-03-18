#!/usr/bin/env node
const args = process.argv.slice(2);
switch(args[0]) {
    case "--help":
        console.log(`
    Usage: dictionary-test <name>

    Options:
    --help Show this help message
    --version Show Tests Version
        `);
        process.exit(0);
    case "--version":
       console.log(`Dictionary Testing Environment v1.0.0`);
        process.exit(0);
    case "--test":
        const what = args[1];
        if(what==="hi") {
            console.log("Hi! Detected");
        }
}