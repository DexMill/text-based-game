function rand(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function addTextUpdate(text) {
  let newUpdate = document.createElement("pre");
  newUpdate.innerHTML = text;
  newUpdate.className = "text-update";
  document.getElementById("text-updates").prepend(newUpdate);
}

// Set up event handling after DOM has loaded
document.addEventListener("DOMContentLoaded", function () {
  updateAlwaysUp();
  // Detecting ENTER in main text input
  document.getElementById("main-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (e.target.value === "/clear") {
        document.getElementById("text-updates").innerHTML = "";
        e.target.value = "";
      } else {
        const outputText = process(e.target.value);
        addTextUpdate(outputText);
        e.target.value = "";
      }
      updateAlwaysUp();
    }
  });
});

function generateRandomAlligatorStr() {
  const randomAlligatorStr = rand(1, 2);
  alligatorStr = randomAlligatorStr;
}

const SET_NAME = "/name ";
const GOTO_LOC = "/goto ";
const EXPLORE = "/explore";
const EXPLORE_SHORT = "/e";

let charName = "Adventurer";
let charLoc = "Inn";

const dangerLevelOfLoc = {
  Inn: 0,
  Swamp: 5,
};

let health = 10;
let mana = 10;
let stamina = 10;
let strength = 3;
let defense = 10;
let canExplore = charLoc === "Swamp" ? true : false;
let alligator = false;
let alligatorStr = 0;
let combat = false;
let alligatorHealth = 10;

function process(inputText) {
  let outputText = "default";

  if (inputText === "?help" || inputText === "?h") {
    outputText = `Commands available:

?name = prints name
?loc = print current location
/name newName = sets name to newName
?help = shows commands
?stat = shows you your stats
/clear = clears log
/goto loc = goes to a loc
/explore-e = explores
`;
  }

  if (inputText === "?stat" || inputText === "?s") {
    outputText = `stats:

strength:  ${strength}
defence: ${defense}

`;
  }

  if (inputText === "?name") {
    outputText = charName;
  }

  if (inputText === "?loc" || inputText === "?l") {
    outputText = `Location: ${charLoc} - Danger Lvl: ${dangerLevelOfLoc[charLoc]}`;
  }

  if (inputText.startsWith(SET_NAME)) {
    charName = inputText.slice(SET_NAME.length);
    outputText = `Name set to ${charName}`;
  }

  if (inputText.startsWith(GOTO_LOC)) {
    newLoc = inputText.slice(GOTO_LOC.length);
    charLoc = newLoc;

    if (charLoc === "Swamp") {
      canExplore = true;
    } else {
      canExplore = false;
    }

    outputText = `You've traveled to ${newLoc}`;
  }

  if (charLoc === "Inn") {
    if (health < 10) {
      health = health + 1;
      outputText = `You have + 1 health.`;
    }
  }

  if (inputText === EXPLORE || inputText === EXPLORE_SHORT) {
    if (canExplore === false) {
      outputText = "You cannot explore here ";
      return outputText;
    }

    if (alligator === true) {
      outputText =
        "You must either defeat the alligator or retreat before you may explore more";
      return outputText;
    }

    const rand = Math.random() * 10;

    if (rand <= 3) {
      outputText = "You have found treasure!";
    } else if (rand > 3 && rand <= 5) {
      outputText = "You have found nothing :/";
    } else {
      generateRandomAlligatorStr();
      outputText = `You have found something! An alligator with strength ${alligatorStr}!! Use /attack or /retreat`;
      alligator = true;
    }
  }

  if (alligator === true) {
    if (inputText === "/attack") {
      outputText = "You attack an alligator.";
      alligatorHealth = alligatorHealth - strength;

      if (alligatorHealth < 0) {
        alligatorHealth = 0;
      }

      outputText += `\nThe alligator health is ${alligatorHealth}.`;
      health = health - alligatorStr;

      if (alligatorHealth === 0) {
        outputText += `\nYou've defeated the alligator!`;
        alligator = false;
      }
    }

    if (inputText === "/retreat") {
      outputText = "You retreat from the alligator!";
      alligator = false;
    }
  }

  return outputText;
}

function updateAlwaysUp() {
  document.getElementById(
    "always-up"
  ).innerHTML = `Health: ${health} - Mana: ${mana} - Stamina: ${stamina} <br /> Locatioin: ${charLoc}`;
}
