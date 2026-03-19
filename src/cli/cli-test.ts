#!/usr/bin/env node
import chalk from "chalk";
import { Version } from "../domain/release.js";

const TestIds: TestName[] = [
    "Dictionary.Define",
    "DictionaryDB.BuildFilters"
];
import { deepStrictEqual } from "node:assert/strict";
import { Dictionary } from "../persistance/dictionary.js";
import { DictionaryDB } from "../persistance/db/core.js";
import { DBFilters, DBSearchQuery } from "../persistance/db/mappings.js";

export type TestResult = {
    name: string;
    passed: number;
    total: number;
    errors: string[];
};
export const Tests = {
    async "Dictionary.Define"(): Promise<TestResult> {
        const cases = ["help", "test", "school", "church"];
        const errors: string[] = [];
        for (const word of cases) {
            try {
                await Dictionary.Define({ word });
            } catch (err) {
                errors.push(`Word "${word}" failed: ${(err as Error).message}`);
            }
        }
        return {
            name: "Dictionary.Define",
            passed: cases.length - errors.length,
            total: cases.length,
            errors
        };
    },
    async "DictionaryDB.BuildFilters"(): Promise<TestResult> {
        const cases: Array<[DBSearchQuery, DBFilters]> = [
            [{}, {}],
            [{ word: "hello" }, { Word: { "Word.English": "hello" } }],
            [{ pos: "Noun" }, { Lexeme: { POS: "Noun" } }]
        ];
        const errors: string[] = [];
        for (const [input, expected] of cases) {
            try {
                const actual = DictionaryDB.BuildFilters(input);
                deepStrictEqual(actual, expected);
            } catch (err) {
                errors.push(
                    `Input ${JSON.stringify(input)} failed: ${(err as Error).message}`
                );
            }
        }
        return {
            name: "DictionaryDB.BuildFilters",
            passed: cases.length - errors.length,
            total: cases.length,
            errors
        };
    }
} as const;
export type TestName = keyof typeof Tests;
export async function RunTest(name: TestName): Promise<TestResult> {
    return await Tests[name]();
}
async function main() {
    const [flag, value] = process.argv.slice(2);

    switch (flag) {
        case "-h":
        case "--help":
            console.log(`
Dictionary SDK Tester
Usage: dictionary-test <flag> <value>

Flags:
  --help, -h        Show help
  --version, -v     Show SDK version
  --test, -t        Run test by name
  --testid, --tid   Run test by numeric id
`);
            return;

        case "-v":
        case "--version":
            console.log(`Dictionary SDK v${Version}`);
            return;

        case "-t":
        case "--test":
            if (!value || !(value in Tests)) {
                console.log(chalk.red("Invalid test name."));
                return;
            }
            await execute(value as TestName);
            return;

        case "--testid":
        case "--tid":
            const index = Number(value) - 1;
            const test = TestIds[index];
            if (!test) {
                console.log(chalk.red("Invalid test id."));
                return;
            }
            await execute(test);
            return;

        default:
            console.log(chalk.red("Unknown command. Use --help."));
            return;
    }
}

async function execute(name: TestName) {
    console.log(chalk.blue(`Running ${name}...`));

    const result = await RunTest(name);

    for (const err of result.errors) {
        console.log(chalk.red("X " + err));
    }

    console.log(
        result.errors.length === 0
            ? chalk.green(`v ${name} passed all ${result.total} tests`)
            : chalk.yellow(
                  `! ${name} passed ${result.passed}/${result.total} tests`
              )
    );
}

await main();