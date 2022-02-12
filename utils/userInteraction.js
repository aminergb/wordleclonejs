//use interaction :  
//start interaction function
import dictionnary from '../dictionary.js'
//length of a row
const WORDLE_ROW_SIZE = 5
//flip animation duration in ms
const dailyWorld = "sadle"
const FLIP_DURATION = 400
const DANCE_DURATION = 400
const guessGridElem = document.querySelector('[data-guess-grid]')
const keyBoardElem = document.querySelector('[data-keyboard]')
const alertContainer = document.querySelector('[data-alert-container]')
export function startInteraction() {
    //adding event listeners :
    //adding onclick event listener to use the virtual keyboard: 
    document.addEventListener("click", handleClick)
    //adding keydown eventlistener to use the real keyboard:
    document.addEventListener('keydown', handleKeyPress)
}

//stop interaction in case we win or lose
export function stopInteraction() {
    //removing event listeners :
    //removing onclick event listener 
    document.removeEventListener("click", handleClick)
    //removing keydown eventlistener 
    document.removeEventListener('keydown', handleKeyPress)
}


function handleClick(e) {
    //handling the click event on our virutal keyboard target : 
    //we use the element.matches function, it returns true if our element has the exact target that we passed as a parameter :
    //selectors can be data attributes, classes, id, also tagNames

    //see if we clicked on an alphabet
    if (e.target.matches("[data-key]")) {
        //we associate the equivalent key
        //what is dataset.key ?
        associateKey(e.target.dataset.key)

        return
    }
    //see if we clicked on enter
    if (e.target.matches("[data-enter]")) {
        //we verify the word
        verifyWord()
        return

    }
    if (e.target.matches("[data-delete]")) {
        //we delete the current key
        deleteCurrentKey()
        return

    }
}
//handling keypress on real keyboard
function handleKeyPress(e) {
    //see if we pressed on alphabet keys
    //the match function (from string prototype) takes a regular expression as an argument and matches it with an existing string 
    //^[a-z]$ means we need one single letter
    if (e.repeat) return
    if (e.key.match(/^[a-z]$/)) {
        associateKey(e.key)
        return
    }
    //we press enter to verify the word
    if (e.key === "Enter") {
        verifyWord()
        return
    }
    //delete the current alphabet (as in word)
    if (e.key === "Delete" || e.key === "Backspace") {
        deleteCurrentKey()
        return
    }


}

function associateKey(key) {
    //associate the key to a grid :
    //1)find the current tile, 
    //2) associate a dataset letter and also write the alphabet key as a textcontent of the tile
    //3) add another dataset called active for us to write only the recommended size of the row (number of tiles in a row)

    //find the current tile : if the found tile doesn't have the dataset letter, then it means we can write in it.
    const activeTile = getActiveTiles()
    if (activeTile.length >= WORDLE_ROW_SIZE) return
    const currentTile = guessGridElem.querySelector(':not([data-letter])')
    currentTile.dataset.letter = key.toLowerCase()
    currentTile.textContent = key
    //add active dataset: (the is a letter in it)
    currentTile.dataset.state = "active"


}
function getActiveTiles() {
    return guessGridElem.querySelectorAll('[data-state="active"]')
}

function verifyWord() {

    //getting the active tiles and putting them into an array : to use array methods
    const activeTiles = [...getActiveTiles()]
    const guessWord = activeTiles.reduce((prevChars, currentTile) => {
        //we need to be careful here: either we concatenate the textcontent or the dataset 
        //we do not want to concatenate our tileElement
        return prevChars + currentTile.dataset.letter
    }, "")
    //there is nothing to verify
    if (activeTiles.length < WORDLE_ROW_SIZE) {

        showToolTip("the word length is shorter than " + WORDLE_ROW_SIZE, 1000)
        shakeTiles(activeTiles)
        return

    }
    if (!dictionnary.includes(guessWord)) {
        showToolTip("not included in dictionnary")
        shakeTiles(activeTiles)
        return
    }
    //for stopping user interactions
    stopInteraction()
    //to start flip animation
    activeTiles.forEach((...tileParams) => flipTile(...tileParams, guessWord))

}
//animate the tiles by flipping
function flipTile(tile, index, array, guessWord) {
    const letter = tile.dataset.letter
    //get the corresponding key from board
    //`[data-key="${letter}"i]` : 
    //letter is lowcase, but the data-keys are uppercase, by adding "i" this enables case incensitive 
    const key = keyBoardElem.querySelector(`[data-key="${letter}"i]`)
    //setting a timout to animate the tiles one by one : 
    setTimeout(() => {
        tile.classList.add('flip')
    }, (index * FLIP_DURATION) / 2)
    //here we change the state from active to one of those three : correct , wrong-location or wrong
    tile.addEventListener("transitionend", () => {
        tile.classList.remove("flip")
        if (dailyWorld[index] === letter) {
            tile.dataset.state = "correct"
            key.classList.add('correct')
        } else if (dailyWorld.includes(letter)) {
            tile.dataset.state = "wrong-location"
            key.classList.add("wrong-location")
        } else {
            tile.dataset.state = "wrong"
            key.classList.add("wrong")
        }
        //if tile is last from activetiles
        if (index === array.length - 1) {
            tile.addEventListener("transitionend", () => {
                startInteraction()
                checkwinLose(guessWord, array)
            }, { once: true })
        }

    }, { once: true })
}
function checkwinLose(guessWord, arrayTiles) {
    //if win
    if (guessWord === dailyWorld) {
        showToolTip("you won ", 3000)
        danceTiles(arrayTiles)
        stopInteraction()
        showToolTip("press Space to replay", 2000)
        document.addEventListener("keydown", (e) => {
            console.log(e.key)
            // TODO: replayGame
            if (e.key === "Spacebar" || e.key === " ") {

                replayGame()
            }
        }, { once: true })
    }
    const emptyTiles = guessGridElem.querySelectorAll(':not([data-letter])')
    if (emptyTiles.length === 0) {
        showToolTip(dailyWorld, 5000)
        stopInteraction()
    }
}
function danceTiles(tiles) {

    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("dance")
            tile.addEventListener('animationend', () => {
                tile.classList.remove("dance")
            }, { once: true })
        }, (index * DANCE_DURATION / 5))


    });
}


function deleteCurrentKey() {
    //we will delete from the active tiles 
    const activeTiles = getActiveTiles()
    if (activeTiles.length <= 0) return
    const currentActiveTile = activeTiles[activeTiles.length - 1]
    if (currentActiveTile == null) return
    delete currentActiveTile.dataset.letter
    delete currentActiveTile.dataset.state
    currentActiveTile.textContent = ""
    return
}


function showToolTip(message, duration = 1000) {
    //creating an alert : 
    const alertElem = document.createElement('div')
    //adding a class
    alertElem.classList.add('alert')
    //adding the textcontent: 
    alertElem.textContent = message
    //adding the alert on top of alertContainer element:  by using prepend: adds from the last (LIFO ?)
    alertContainer.prepend(alertElem)
    //if no duration we will return nothing
    if (duration == null) return
    //else we set our timeout :
    //when the transition ends we remove our element
    setTimeout(() => {
        alertElem.classList.add('hide')
        alertElem.addEventListener('transitionend', () => {
            alertElem.remove()
        })

    }, duration)


    return
}

function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add("shake")
        tile.addEventListener('animationend', () => {
            tile.classList.remove("shake")
        }, { once: true })

    });
    return
}

//TODO
function replayGame() {
    [...guessGridElem.children].forEach((item) => {
        delete item.dataset.letter
        item.textContent = ""
        delete item.dataset.state
    })
    startInteraction()
}


