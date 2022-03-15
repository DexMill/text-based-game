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
        const outputText = process(e.target.value.trim());
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
const TREASURES = "?t";

let charName = "Adventurer";
let charLoc = "Inn";

const dangerLevelOfLoc = {
  Inn: 0,
  Swamp: 5,
};

const treasures = ["Pearl", "Diamond", "Alligator tooth", "Stick"];
const treasureWeights = [20, 10, 50, 100];

const yourTreasures = [];

let health = 10;
let maxHealth = 10;
let mana = 10;
let stamina = 10;
let strength = 3;
let canExplore = charLoc === "Swamp" ? true : false;
let alligator = false;
let alligatorStr = 0;
let combat = false;
let alligatorHealth = 10;
let coins = 150;
let xp = 0;
let level = 0;
let levelPoints = 0;
let neededXp = 10;

let equippedItems = {
  Chest: "Cloth tunic",
  Weapon: "Wooden sword",
};

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

strength:  ${strength}
health: ${maxHealth}

`;
  }

  if (inputText.startsWith("/equip")) {
    const inputTextSplit = inputText.split(" ");
    const equipmentSlot = inputTextSplit[1];
    const itemToEquip = inputTextSplit.slice(2).join(" ");
    equippedItems[equipmentSlot] = itemToEquip;
    outputText = `You equipped ${itemToEquip}`;
  }

  if (inputText === "?craft") {
    outputText = `recipes:
/craft alligator knife = 1 alligator tooth and 1 stick
    
    `;
  }

  if (inputText === "/craft alligator knife") {
    const haveStick = yourTreasures.some((t) => t === "Stick");
    const haveAlligatorTooth = yourTreasures.some(
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

    outputText = "you crafted an alligator knife";
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

  if (charLoc === "Inn" && health != maxHealth) {
    health = maxHealth;
    outputText += `\nYou have max health.`;
  }

  if (inputText === EXPLORE || inputText === EXPLORE_SHORT) {
    if (canExplore === false) {
      outputText = "You cannot explore here ";
      return outputText;
    }

    if (alligator === true) {
      outputText =
        "You must either defeat the alligator and gain 30 coins or retreat and lose 10 coins before you may explore more";
      return outputText;
    }

    const randExplore = rand(0, 10);

    if (randExplore <= 6) {
      const treasureYouFound = weightedRandom(treasures, treasureWeights);
      yourTreasures.push(treasureYouFound);
      outputText = `You have found ${treasureYouFound}!`;
    } else if (randExplore > 6 && rand <= 8) {
      outputText = "You have found nothing :/";
    } else {
      generateRandomAlligatorStr();
      outputText = `You have found something! An alligator with strength ${alligatorStr}!! Use /attack or /retreat`;
      alligator = true;
    }
  }

  if (inputText === TREASURES) {
    outputText = `Treasures: ${yourTreasures.join(", ")}
    `;
  }

  if (alligator === true) {
    if (inputText === "/attack" || inputText === "/a") {
      outputText = "You attack an alligator.";
      alligatorHealth = alligatorHealth - strength;

      if (alligatorHealth < 0) {
        alligatorHealth = 0;
      }

      const isAlligatorDead = alligatorHealth === 0;

      outputText += `\nThe alligator health is ${alligatorHealth}.`;

      if (!isAlligatorDead) {
        health = health - alligatorStr;
      }

      if (isAlligatorDead) {
        outputText += `\nYou've defeated the alligator!`;
        alligator = false;
        coins = coins + 30;
        xp = xp + 10;
        alligatorHealth = 10;
        yourTreasures.push(treasures[2]);

        if (xp >= neededXp) {
          xp = xp - neededXp;
          level = level + 1;
          neededXp = neededXp + 5;
          levelPoints = levelPoints + 1;
        }
      }
    }

    if (inputText === "/retreat") {
      outputText = "You retreat from the alligator!";
      alligator = false;
      coins = coins - 10;
      health = health - 1;
    }
  }

  if (inputText.startsWith("/u")) {
    const skillToUpgrade = inputText.split(" ")[1];
    if (skillToUpgrade === "s" && levelPoints >= 1) {
      strength = strength + 1;
      levelPoints = levelPoints - 1;
      outputText = "you upgraded Strength";
    }

    if (skillToUpgrade === "h" && levelPoints >= 1) {
      maxHealth = maxHealth + 1;
      health = maxHealth;
      outputText = "You have upgrade Health";
      levelPoints = levelPoints - 1;
    }
  }

  return outputText;
}

function updateAlwaysUp() {
  document.getElementById(
    "always-up"
  ).innerHTML = `Health: ${health} - Mana: ${mana} - Stamina: ${stamina} - coins ${coins} <br /> Location: ${charLoc} <br /> xp: ${xp} / ${neededXp} <br /> Level: ${level} <hr /> <strong>Equipped Items</strong> <br /> ${Object.entries(
    equippedItems
  )
    .map(([key, val]) => `<em>${key}</em>: ${val}`)
    .join("<br />")}`;
}
