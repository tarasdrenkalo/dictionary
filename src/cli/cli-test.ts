#!/usr/bin/env node
import chalk from "chalk";
import { deepStrictEqual } from "node:assert/strict";
import { Dictionary } from "../persistance/dictionary.js";
import { DictionaryDB } from "../persistance/db/core.js";
import { DBFilters, DBSearchQuery } from "../persistance/db/mappings.js";
export const AvailableTests = {
    "Dictionary.Define":Dictionary.Define,
    "DictionaryDB.BuildFilters":DictionaryDB.BuildFilters
}
const args:["--help"|"--version"|"--test", keyof typeof AvailableTests] = process.argv.slice(2) as ["--help"|"--version"|"--test", keyof typeof AvailableTests];
switch(args[0]) {
    case "--help":
        console.log(`
    Usage: ${chalk.yellowBright("dictionary-test <name>")}

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
        switch(what) {
            case "Dictionary.Define":{
                const ddt = ["help", "test", "school", "church", "building", "trust", "harmony", "treasure", "draughts", "chess"];
                let PassedTests = 0;
                console.log(`Testing ${what}...`)
                for(const test of ddt) {
                    try {
                        console.log(`Running Test of ${what} ${chalk.gray(`${ddt.indexOf(test)+1}/${ddt.length} on "${test}"...`)}`)
                        await Dictionary.Define({word:test});
                        PassedTests++
                    } catch (error) {
                        console.log(chalk.red(`${what} Failed Testing Environment: ${(error as Error)?.message}`));
                        process.exit(1);
                    }
                    finally {
                        if(PassedTests === ddt.length) {
                            console.log(chalk.green(`${what} successfully passed ${PassedTests}/${PassedTests} of tests!`));
                            process.exit(0);
                        }
                        
                    }
                }
                break;
            } 
            case "DictionaryDB.BuildFilters":{
                let Tests:Map<DBSearchQuery, DBFilters> = new Map();
                let PassedTests  = 0;
                let CurrentTest = 0;
                
                Tests.set({}, {});
                Tests.set(
                { word: "hello" },
                { Word: { "Word.English": "hello" } }
                );

                Tests.set(
                { word: "hej", language: "Polish" },
                { Word: { "Word.Polish": "hej" } }
                );

                Tests.set(
                { word: "nice", gender: "U" },
                {
                    Word: { "Word.English": "nice" },
                    Lexeme: { Gender: "U" }
                }
                );

                Tests.set(
                { wordid: "abc123" },
                {
                    Word: { WordId: "abc123" }
                }
                );
                Tests.set(
                { pos: "Noun" },
                {
                    Lexeme: { POS: "Noun" }
                }
                );
                Tests.set(
                { pos: "Verb", gender: "F", kind: "Auxiliary" },
                {
                    Lexeme: { POS: "Verb", Gender: "F", Kind: "Auxiliary" }
                }
                );
                Tests.set(
                { flags: ["Colloquialism", "Abbreviation"] },
                {
                    Editorial: { Flags: { $in: ["Colloquialism", "Abbreviation"] } }
                }
                );
                Tests.set(
                { seo: ["Visible", "Indexable"] },
                {
                    Editorial: { SEO: { $in: ["Visible", "Indexable"] } }
                }
                );

                Tests.set(
                {
                    word: "run",
                    language: "English",
                    pos: "Verb",
                    gender: "U",
                    flags: ["FormalOnly"],
                    seo: ["Visible"]
                },
                {
                    Word: { "Word.English": "run" },
                    Lexeme: { POS: "Verb", Gender: "U" },
                    Editorial: {
                    Flags: { $in: ["FormalOnly"] },
                    SEO: { $in: ["Visible"] }
                    }
                }
                );
                let TotalTests = Tests.size;
                for (const [expectedarg, expectedout] of Tests.entries()) {
                try {
                    CurrentTest++;
                    console.log(`Running Test of ${what} ${chalk.gray(`${CurrentTest}/${TotalTests} on ${JSON.stringify(expectedarg)}...`)}`);
                    const actual = DictionaryDB.BuildFilters(expectedarg);
                    deepStrictEqual(actual, expectedout);
                    PassedTests++;
                } catch (error) {
                    console.log(chalk.red(`${what} Failed Testing Environment: ${(error as Error)?.message}`));
                    process.exit(1);
                }
                finally {
                    if(PassedTests === TotalTests) {
                        console.log(chalk.green(`${what} successfully passed ${PassedTests}/${TotalTests} of tests!`));
                        process.exit(0);
                    }
                }
            }  
            }
        }
}