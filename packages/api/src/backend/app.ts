import express from "express";
import { Word } from "@dictionary/word"
let application = express();
application.use(express.json())
application.get("/", (req, res) => {
    let word = Word.Create("Noun", {
        Word:{English:"test", Polish:"test"},
        Denotation:{English:"Test Definition", Polish:"Testowa definicja"}
    })
    res.send(JSON.parse(JSON.stringify(word)))
})
application.listen(666, ()=>{console.log("Server Started!")})