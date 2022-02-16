import { startInteraction } from "./utils/userInteraction.js";

//
let dailyWorld = null

try {//todo if win refetch
    const resp = await fetch("http://localhost:4008/api/word")
    const data = await resp.json()
    console.log(data)
    startInteraction(data)
} catch (e) {
    throw new Error(e)
}


