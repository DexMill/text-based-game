import { rand } from "./utils.js";
import { weightedRandom } from "./weighted-random.js";

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
      // @ts-ignore
      if (e.target.value === "/clear") {
        document.getElementById("text-updates").innerHTML = "";
        // @ts-ignore
        e.target.value = "";
        // @ts-ignore
      } else if (e.target.value === "/reset") {
        localStorage.setItem("text-based-game-state", null);
        // @ts-ignore
        e.target.value = "";
      } else {
        // @ts-ignore
        let outputText = process(e.target.value.trim());
        addTextUpdate(outputText);
        // save state to localStorage
        localStorage.setItem("text-based-game-state", JSON.stringify(state));
        // @ts-ignore
        e.target.value = "";
      }
      updateAlwaysUp();
    }
  });
});

function generateRandomAlligatorStr() {
  let randomAlligatorStr = rand(1, 2);
  state.alligatorStr = randomAlligatorStr;
}

// Dex can ignore
function deleteFromInv(treasures) {
  if (typeof treasures === "string") {
    state.yourTreasures[state.yourTreasures.indexOf(treasures)] = undefined;
    state.yourTreasures = state.yourTreasures.filter((t) => t !== undefined);
  }

  for (let t of treasures) {
    state.yourTreasures[state.yourTreasures.indexOf(t)] = undefined;
  }
  state.yourTreasures = state.yourTreasures.filter((t) => t !== undefined);
}

let SET_NAME = "/name ";
let GOTO_LOC = "/goto ";
let EXPLORE = "/explore";
let EXPLORE_SHORT = "/e";
let TREASURES = "?t";

let treasures = ["Pearl", "Diamond", "Alligator tooth", "Stick"];
let treasureWeights = [20, 10, 50, 100];

let itemTypes = [
  { name: "Wooden sword", slot: "Weapon" },
  { name: "Iron sword", slot: "Weapon" },
  { name: "Cloth tunic", slot: "Chest" },
  { name: "Iron armor", slot: "Chest" },
  { name: "Alligator knife", slot: "Weapon" },
];

let locations = [
  { name: "Swamp" },
  { name: "Inn" },
  { name: "Forest" },
  { name: "Village" },
];

let dangerLevelOfLoc = {
  Inn: 0,
  Swamp: 5,
  Forest: 3,
  Village: 1,
};

const savedStateAsString = localStorage.getItem("text-based-game-state");

function canExplore() {
  if (state.charLoc === "Swamp") {
    return true;
  }

  if (!locations.some((loc) => loc.name === state.charLoc)) {
    state.charLoc = "Inn";
    state.outputText =
      "You were moved into the Inn because that location does not exist";
  }

  return false;
}

let savedState;
if (savedStateAsString) {
  savedState = JSON.parse(savedStateAsString);
}

let state = savedState
  ? savedState
  : {
      charName: "Adventurer",
      charLoc: "Inn",
      yourTreasures: [],
      health: 10,
      maxHealth: 10,
      mana: 10,
      stamina: 10,
      strength: 3,
      alligator: false,
      alligatorStr: 0,
      combat: false,
      alligatorHealth: 10,
      coins: 150,
      xp: 0,
      level: 0,
      levelPoints: 0,
      neededXp: 10,
      equippedItems: {
        Chest: "Cloth tunic",
        Weapon: "Wooden sword",
      },
    };

function process(inputText) {
  let outputText = "unknown command";

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
/a-attack = attack
/retreat = run away
/u h or s = upgrade strength or health
?craft = list all recipes
/craft = crafts
/equip (item) = equips a item
`;
  }

  if (inputText === "?stat" || inputText === "?s") {
    outputText = `stats:

strength:  ${state.strength}
health: ${state.maxHealth}

`;
  }

  if (inputText.startsWith("/equip")) {
    let inputTextSplit = inputText.split(" ");
    let itemName = inputTextSplit.slice(1).join(" ");
    let itemType = itemTypes.find((i) => i.name === itemName);

    if (!itemType) {
      outputText = `The item type "${itemName}" does not exist`;
      return outputText;
    }

    let haveInInventory = state.yourTreasures.some((t) => t === itemType.name);

    if (!haveInInventory) {
      outputText = `You don't have the item "${itemName}" in your inventory`;
      return outputText;
    }

    let prevItemInSlot = state.equippedItems[itemType.slot];

    state.equippedItems[itemType.slot] = itemType.name;

    let index = state.yourTreasures.indexOf(itemType.name);

    state.yourTreasures[index] = prevItemInSlot;

    state.yourTreasures = state.yourTreasures.filter((t) => t !== undefined);

    outputText = `You equipped ${itemType.name}`;
  }

  if (inputText === "?craft") {
    outputText = `recipes:
/craft Alligator knife = 1 alligator tooth and 1 stick
    
    `;
  }

  if (inputText === "/craft Alligator knife") {
    let haveStick = state.yourTreasures.some((t) => t === "Stick");
    let haveAlligatorTooth = state.yourTreasures.some(
      (t) => t === "Alligator tooth"
    );

    if (!haveStick && !haveAlligatorTooth) {
      outputText = "You need a stick! And an alligator tooth";
      return outputText;
    }

    if (!haveStick) {
      outputText = "You need a stick!";
      return outputText;
    }

    if (!haveAlligatorTooth) {
      outputText = `\nYou need an alligator tooth`;
      return outputText;
    }

    deleteFromInv(["Stick", "Alligator tooth"]);

    outputText = "you crafted an Alligator knife";
    state.yourTreasures.push("Alligator knife");
  }

  if (inputText === "?name") {
    outputText = state.charName;
  }

  if (inputText === "?loc" || inputText === "?l") {
    outputText = `Location: ${state.charLoc} - Danger Lvl: ${
      dangerLevelOfLoc[state.charLoc]
    }`;
  }

  if (inputText.startsWith(SET_NAME)) {
    state.charName = inputText.slice(SET_NAME.length);
    outputText = `Name set to ${state.charName}`;
  }

  if (inputText.startsWith(GOTO_LOC)) {
    let newLoc = inputText.slice(GOTO_LOC.length);

    if (!locations.some((loc) => loc.name === newLoc)) {
      state.charLoc = "Inn";
      outputText =
        "You were moved into the Inn because that location does not exist";
      return outputText;
    }

    state.charLoc = newLoc;

    outputText = `You've traveled to ${newLoc}`;
  }

  if (state.charLoc === "Inn" && state.health != state.maxHealth) {
    state.health = state.maxHealth;
    outputText += `\nYou have max health.`;
  }

  if (inputText === EXPLORE || inputText === EXPLORE_SHORT) {
    if (canExplore() === false) {
      outputText = "You cannot explore here ";
      return outputText;
    }

    if (state.alligator === true) {
      outputText =
        "You must either defeat the alligator and gain 30 coins or retreat and lose 10 coins before you may explore more";
      return outputText;
    }

    let randExplore = rand(0, 10);

    if (randExplore <= 6) {
      let treasureYouFound = weightedRandom(treasures, treasureWeights);
      state.yourTreasures.push(treasureYouFound);
      outputText = `You have found ${treasureYouFound}!`;
    } else if (randExplore > 6 && randExplore <= 8) {
      outputText = "You have found nothing :/";
    } else {
      generateRandomAlligatorStr();
      outputText = `You have found something! An alligator with strength ${state.alligatorStr}!! Use /attack or /retreat`;
      state.alligator = true;
    }
  }

  if (inputText === TREASURES) {
    outputText = `Treasures: ${state.yourTreasures.join(", ")}
    `;
  }

  if (state.alligator === true) {
    if (inputText === "/attack" || inputText === "/a") {
      outputText = "You attack an alligator.";
      state.alligatorHealth = state.alligatorHealth - state.strength;

      if (state.alligatorHealth < 0) {
        state.alligatorHealth = 0;
      }

      let isAlligatorDead = state.alligatorHealth === 0;

      outputText += `\nThe alligator health is ${state.alligatorHealth}.`;

      if (!isAlligatorDead) {
        state.health = state.health - state.alligatorStr;
      }

      if (isAlligatorDead) {
        outputText += `\nYou've defeated the alligator!`;
        state.alligator = false;
        state.coins = state.coins + 30;
        state.xp = state.xp + 10;
        state.alligatorHealth = 10;
        state.yourTreasures.push(treasures[2]);

        if (state.xp >= state.neededXp) {
          state.xp = state.xp - state.neededXp;
          state.level = state.level + 1;
          state.neededXp = state.neededXp + 5;
          state.levelPoints = state.levelPoints + 1;
        }
      }
    }

    if (inputText === "/retreat") {
      outputText = "You retreat from the alligator!";
      state.alligator = false;
      state.coins = state.coins - 10;
      state.health = state.health - 1;
    }
  }

  if (inputText.startsWith("/u")) {
    let skillToUpgrade = inputText.split(" ")[1];
    if (skillToUpgrade === "s" && state.levelPoints >= 1) {
      state.strength = state.strength + 1;
      state.levelPoints = state.levelPoints - 1;
      outputText = "you upgraded Strength";
    }

    if (skillToUpgrade === "h" && state.levelPoints >= 1) {
      state.maxHealth = state.maxHealth + 1;
      state.health = state.maxHealth;
      outputText = "You have upgrade Health";
      state.levelPoints = state.levelPoints - 1;
    }
  }

  return outputText;
}

function updateAlwaysUp() {
  document.getElementById("always-up").innerHTML = `Health: ${
    state.health
  } - Mana: ${state.mana} - Stamina: ${state.stamina} - coins ${
    state.coins
  } <br /> Location: ${state.charLoc} <br /> xp: ${state.xp} / ${
    state.neededXp
  } <br /> Level: ${
    state.level
  } <hr /> <strong>Equipped Items</strong> <br /> ${Object.entries(
    state.equippedItems
  )
    .map(([key, val]) => `<em>${key}</em>: ${val}`)
    .join("<br />")}<hr />${state.yourTreasures.join(", ") && ""}`;
}
