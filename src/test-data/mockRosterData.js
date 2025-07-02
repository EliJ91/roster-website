// Mock roster data for testing
export const mockRosterData = {
  id: "test-roster-1",
  eventName: "Conflict Army Test Event",
  eventDescription: "Test event for roster management",
  author: "TestAdmin",
  createdAt: new Date(),
  updatedAt: new Date(),
  parties: [
    {
      name: "Main Party",
      partyName: "Main Party",
      description: "Main party with caller and core team",
      positions: [
        {
          role: "Main Caller",
          weapon: "Clump Tank",
          player: "Elijxh",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "Don't fucking die",
          signedUpUser: "Elijxh"
        },
        {
          role: "Tank",
          weapon: "Heavy Mace",
          player: "InstantRegrett",
          head: "Hellion/Judi",
          chest: "Guardian",
          boots: "idc don't die",
          buildNotes: "SNARE CHARGE - STOP THEM/PURGE THEM - FLANK THEM",
          signedUpUser: "InstantRegrett"
        },
        {
          role: "Tank",
          weapon: "1H Hammer",
          player: "GloopEater",
          head: "Judi/Hellion/Soldier",
          chest: "Duskweaver",
          boots: "idc don't die",
          buildNotes: "Leering Cane - Onion Ring - Flank them and HOLD them",
          signedUpUser: "GloopEater"
        },
        {
          role: "Tank",
          weapon: "GA (OFF)",
          player: "manuelto33",
          head: "Judi/Assassin/Hellion",
          chest: "Knight",
          boots: "Stalker/Cleric",
          buildNotes: "CLEANSE - STOP ENGAGE/HOLD THEM",
          signedUpUser: "manuelto33"
        },
        {
          role: "Tank",
          weapon: "Incubus Mace",
          player: "Kjdogg",
          head: "idc don't die",
          chest: "Demon",
          boots: "idc don't die",
          buildNotes: "Guard Rune/Snare Charge - HIT ELIJXH'S CLUMP",
          signedUpUser: "Kjdogg"
        },
        {
          role: "Support",
          weapon: "Lifecurse",
          player: "BeatDatAshe",
          head: "Assassin",
          chest: "Demon",
          boots: "Graveguard",
          buildNotes: "Armored Piercer",
          signedUpUser: "BeatDatAshe"
        },
        {
          role: "Support",
          weapon: "Oathkeepers(OFF)",
          player: "Bonanah",
          head: "Assassin",
          chest: "Demon",
          boots: "Guardian",
          buildNotes: "Guard Rune - E ENGAGE - DEMON DEFENSIVE",
          signedUpUser: "Bonanah"
        },
        {
          role: "Support",
          weapon: "Shadowcaller",
          player: "Arcturana",
          head: "Assassin",
          chest: "Demon",
          boots: "Stalker/Graveguard",
          buildNotes: "Armored Piercer | E ELIJXH ON 3 | WALK UP IN RANGE",
          signedUpUser: "Arcturana"
        },
        {
          role: "Support",
          weapon: "Locus(DEF)",
          player: "Ardwyrn",
          head: "Assassin",
          chest: "Judi",
          boots: "idc don't die",
          buildNotes: "Cleanse - get us the fuck out",
          signedUpUser: "Ardwyrn"
        },
        {
          role: "Support",
          weapon: "Damnation",
          player: "Flamin",
          head: "Feyscale",
          chest: "Judi/Scholar",
          boots: "Refresh Sprint",
          buildNotes: "E On 3 | CAST TIME PASSIVES ON HELM/CHEST",
          signedUpUser: "Flamin"
        },
        {
          role: "Healer",
          weapon: "Hallowfall",
          player: "Galadorn",
          head: "Merc(Cleanse)",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "SAVE URSELF WITH E",
          signedUpUser: "Galadorn"
        },
        {
          role: "Healer",
          weapon: "Hallowfall",
          player: "Ryuvong",
          head: "Merc(Cleanse)",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "SAVE URSELF WITH E",
          signedUpUser: "Ryuvong"
        },
        {
          role: "Healer",
          weapon: "Hallowfall",
          player: "RagdollMegs",
          head: "Guardian",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "SAVE URSELF WITH E",
          signedUpUser: "RagdollMegs"
        },
        {
          role: "Healer",
          weapon: "Blight",
          player: "Trubold",
          head: "Assassin",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "Cleanse W | Heal everyone",
          signedUpUser: "Trubold"
        },
        {
          role: "Mdps",
          weapon: "Spirithunter",
          player: "Jerryjeff1",
          head: "Knight",
          chest: "Judi",
          boots: "Stalker/Valor",
          buildNotes: "E on 2",
          signedUpUser: "Jerryjeff1"
        },
        {
          role: "Mdps",
          weapon: "Spiked",
          player: "Imspartan",
          head: "idc don't die",
          chest: "idc don't die",
          boots: "idc don't die",
          buildNotes: "Q2 | E the CLUMP | Morgana Cape(t7e+) | T9+ Weapon | T10+ Weapon has prio",
          signedUpUser: "Imspartan"
        },
        {
          role: "Mdps",
          weapon: "Realmbreaker",
          player: "Hawklore",
          head: "Knight",
          chest: "Hellion",
          boots: "Stalker/Valor",
          buildNotes: "E the CLUMP | T9+ Weapon",
          signedUpUser: "Hawklore"
        },
        {
          role: "Mdps",
          weapon: "Kingmaker",
          player: "AuroraAstro",
          head: "Soldier",
          chest: "Hellion",
          boots: "Stalker/Valor",
          buildNotes: "E the CLUMP | T9+ Weapon",
          signedUpUser: "AuroraAstro"
        },
        {
          role: "Mdps",
          weapon: "Infernal Scythe",
          player: "ThisIsVoidBTW",
          head: "Soldier",
          chest: "Hellion",
          boots: "Stalker/Valor",
          buildNotes: "E the CLUMP | T9+ Weapon | T10+ Weapon has prio",
          signedUpUser: "ThisIsVoidBTW"
        },
        {
          role: "Mdps",
          weapon: "Hellfire",
          player: "Amnystyy",
          head: "Soldier",
          chest: "Hellion",
          boots: "Stalker/Valor",
          buildNotes: "W2 | E the CLUMP | MORGANA CAPE(T7E+) | T9+ Weapon",
          signedUpUser: "Amnystyy"
        }
      ]
    },
    {
      name: "Party Two",
      partyName: "STOP GETTING LOST",
      description: "/join Nazori",
      positions: [
        {
          role: "Backup Caller",
          weapon: "Golem",
          player: "Nazori",
          head: "Cleric",
          chest: "Judi",
          boots: "Hunter",
          buildNotes: "EXTEND ELIJXH'S CLUMP",
          signedUpUser: "Nazori"
        },
        {
          role: "Tank",
          weapon: "Grovekeeper",
          player: "b0b761",
          head: "Hellion/Judi",
          chest: "Duskweaver",
          boots: "idc don't die",
          buildNotes: "E ON ELIJXH WHEN COUNTING DOWN ON 2, DROP HELLION HOOD",
          signedUpUser: "b0b761"
        },
        {
          role: "Tank",
          weapon: "Heavy Mace",
          player: "AmUnSkop",
          head: "Hellion/Judi",
          chest: "Guardian",
          boots: "idc don't die",
          buildNotes: "SNARE CHARGE - STOP THEM/PURGE THEM - FLANK THEM",
          signedUpUser: "AmUnSkop"
        },
        {
          role: "Tank",
          weapon: "Stillgaze",
          player: "",
          head: "Judi/Hellion/Soldier",
          chest: "Judi",
          boots: "idc don't die",
          buildNotes: "idk yet do something big",
          signedUpUser: null
        },
        {
          role: "Tank",
          weapon: "Truebolt",
          player: "Lumost",
          head: "Judi/Hellion/Soldier",
          chest: "Knight",
          boots: "idc don't die",
          buildNotes: "idk yet do something big",
          signedUpUser: "Lumost"
        },
        {
          role: "Tank",
          weapon: "1H Arcane(Cleanse)",
          player: "Slightofhand",
          head: "Assassin",
          chest: "Knight",
          boots: "Stalker/Cleric",
          buildNotes: "CLEANSE - STOP THEIR BOMB/ENGAGE",
          signedUpUser: "Slightofhand"
        },
        {
          role: "Support",
          weapon: "Locus(OFF)",
          player: "BigSteewy",
          head: "Assassin",
          chest: "Judi",
          boots: "Stalker/Cleric",
          buildNotes: "CLEANSE - GET US THE FUCK IN THERE",
          signedUpUser: "BigSteewy"
        },
        {
          role: "Support",
          weapon: "Carving Sword",
          player: "KienpaKuliar",
          head: "Knight",
          chest: "Judi",
          boots: "Stalker/Cleric",
          buildNotes: "IRON WILL - GET 2/3 STACK E CLUMP ON 2",
          signedUpUser: "KienpaKuliar"
        },
        {
          role: "Support",
          weapon: "Oathkeepers(DEF)",
          player: "JCuster",
          head: "Assassin",
          chest: "Demon",
          boots: "Guardian",
          buildNotes: "Guard Rune - E ENGAGE - DEMON DEFENSIVE",
          signedUpUser: "JCuster"
        },
        {
          role: "Support",
          weapon: "Rotcaller (Support)",
          player: "",
          head: "Assassin",
          chest: "Demon",
          boots: "Graveguard",
          buildNotes: "HIT OUR CLUMP - DEMON FOR DEF",
          signedUpUser: null
        },
        {
          role: "Healer",
          weapon: "Hallowfall",
          player: "Galbion",
          head: "Merc(Cleanse)",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "SAVE URSELF WITH E",
          signedUpUser: "Galbion"
        },
        {
          role: "Healer",
          weapon: "Hallowfall",
          player: "",
          head: "Merc(Cleanse)",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "SAVE URSELF WITH E",
          signedUpUser: null
        },
        {
          role: "Healer",
          weapon: "Exalted",
          player: "burntpeaches",
          head: "Assassin",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "CLEANSE DEFENSIVELY",
          signedUpUser: "burntpeaches"
        },
        {
          role: "Healer",
          weapon: "Forge Bark",
          player: "Noodlebob",
          head: "Assassin",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "q3 | Cleanse W | E into MW jacket to walk in safely. E snare when full send.",
          signedUpUser: "Noodlebob"
        },
        {
          role: "Mdps",
          weapon: "Realmbreaker",
          player: "CraftHor",
          head: "Knight",
          chest: "Hellion",
          boots: "Stalker/Valor",
          buildNotes: "E the CLUMP - T9+ Weapon",
          signedUpUser: "CraftHor"
        },
        {
          role: "Mdps",
          weapon: "Bear Paws",
          player: "NRHeqms",
          head: "Soldier",
          chest: "Hellion",
          boots: "idc don't die",
          buildNotes: "FIND A HEALER AND CLAP THEM - T9+ Weapon",
          signedUpUser: "NRHeqms"
        },
        {
          role: "Mdps",
          weapon: "Infinity Blade",
          player: "DarkestTemplar",
          head: "Soldier",
          chest: "Hellion",
          boots: "idc don't die",
          buildNotes: "DIVE PAST - FREE E - KILL EM ALL - T9+ Weapon",
          signedUpUser: "DarkestTemplar"
        },
        {
          role: "Rdps",
          weapon: "Astral Staff",
          player: "SlickMischief",
          head: "idc don't die",
          chest: "idc don't die",
          boots: "Graveguard/Valor",
          buildNotes: "PRESSURE NEAR CLUMP OR ON THE CLUMP | T9+ Weapon",
          signedUpUser: "SlickMischief"
        },
        {
          role: "Mdps",
          weapon: "Ursine Maulers",
          player: "",
          head: "idc don't die",
          chest: "idc don't die",
          boots: "Stalker/Valor",
          buildNotes: "PRESSURE NEAR CLUMP OR ON THE CLUMP | T9+ Weapon",
          signedUpUser: null
        },
        {
          role: "Mdps",
          weapon: "Bloodletter",
          player: "Unitay",
          head: "idc don't die",
          chest: "idc don't die",
          boots: "idc don't die",
          buildNotes: "Execute the CLUMP DONT DIE | T9+ Weapon",
          signedUpUser: "Unitay"
        }
      ]
    },
    {
      name: "Party Three",
      partyName: "STOP GETTING LOST",
      description: "/join ",
      positions: [
        {
          role: "Backup Caller",
          weapon: "Heavy Mace",
          player: "",
          head: "Hellion/Judi",
          chest: "Knight/Guardian",
          boots: "idc don't die",
          buildNotes: "SNARE CHARGE - STOP THEM/PURGE THEM - FLANK THEM",
          signedUpUser: null
        },
        {
          role: "Tank",
          weapon: "Heavy Mace",
          player: "",
          head: "Hellion/Judi",
          chest: "Knight/Guardian",
          boots: "idc don't die",
          buildNotes: "SNARE CHARGE - STOP THEM/PURGE THEM - FLANK THEM",
          signedUpUser: null
        },
        {
          role: "Tank",
          weapon: "Icicle",
          player: "",
          head: "Assassin",
          chest: "Duskweaver",
          boots: "Stalker/Cleric/Royal Shoe",
          buildNotes: "SLOW THEM DOWN, GET BEHIND THEM, PURGE BUFFS",
          signedUpUser: null
        },
        {
          role: "Tank",
          weapon: "Dreadstorm Mace",
          player: "",
          head: "Hellion",
          chest: "Guardian",
          boots: "Stalker/Cleric/Royal Shoe",
          buildNotes: "GET BEHIND THEM, SNARE CHARGE, STOP THEM FROM MOVING",
          signedUpUser: null
        },
        {
          role: "Tank",
          weapon: "GA (DEF)",
          player: "",
          head: "Judi/Assassin/Hellion",
          chest: "Knight",
          boots: "Stalker/Cleric",
          buildNotes: "CLEANSE - STOP ENGAGE/HOLD THEM",
          signedUpUser: null
        },
        {
          role: "Tank",
          weapon: "1H Hammer",
          player: "",
          head: "Judi/Hellion/Soldier",
          chest: "Duskweaver",
          boots: "idc don't die",
          buildNotes: "Flank them and HOLD them",
          signedUpUser: null
        },
        {
          role: "Support",
          weapon: "Oathkeepers",
          player: "",
          head: "Assassin",
          chest: "Demon",
          boots: "Guardian",
          buildNotes: "Guard Rune - E ENGAGE - DEMON DEFENSIVE",
          signedUpUser: null
        },
        {
          role: "Support",
          weapon: "Oathkeepers",
          player: "",
          head: "Assassin",
          chest: "Demon",
          boots: "Guardian",
          buildNotes: "Guard Rune - E ENGAGE - DEMON DEFENSIVE",
          signedUpUser: null
        },
        {
          role: "Support",
          weapon: "Rootbound",
          player: "",
          head: "Assassin",
          chest: "Judi",
          boots: "Stalker/Cleric",
          buildNotes: "BE IN TREE FORM WHEN YOU HAVE STACKS, HELP US SOAK",
          signedUpUser: null
        },
        {
          role: "Support",
          weapon: "Lifecurse(DEF)",
          player: "",
          head: "Assassin",
          chest: "Demon",
          boots: "idc don't die",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Healer",
          weapon: "Hallowfall",
          player: "",
          head: "Merc(Cleanse)",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Healer",
          weapon: "Fallen",
          player: "",
          head: "Merc(Cleanse)",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Healer",
          weapon: "Blight",
          player: "",
          head: "Assassin",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Healer",
          weapon: "Rampant",
          player: "",
          head: "Assassin",
          chest: "Purity",
          boots: "Stalker",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Mdps",
          weapon: "Halberd",
          player: "",
          head: "Soldier",
          chest: "Hellion",
          boots: "idc don't die",
          buildNotes: "FREE E OFF TIMER | T9+ Weapon",
          signedUpUser: null
        },
        {
          role: "Mdps",
          weapon: "Greataxe",
          player: "",
          head: "Soldier",
          chest: "Hellion",
          boots: "idc don't die",
          buildNotes: "FREE E OFF TIMER | T9+ Weapon",
          signedUpUser: null
        },
        {
          role: "Mdps",
          weapon: "Infinity Blade",
          player: "",
          head: "Soldier",
          chest: "Hellion",
          boots: "idc don't die",
          buildNotes: "DIVE PAST - FREE E - KILL EM ALL - T9+ Weapon",
          signedUpUser: null
        },
        {
          role: "Rdps",
          weapon: "Astral Staff",
          player: "",
          head: "idc don't die",
          chest: "idc don't die",
          boots: "idc don't die",
          buildNotes: "FREE E OFF TIMER | T9+ Weapon",
          signedUpUser: null
        },
        {
          role: "Mdps",
          weapon: "Infernal Scythe",
          player: "",
          head: "Soldier",
          chest: "Hellion",
          boots: "Stalker/Valor",
          buildNotes: "FREE E OFF TIMER | T9+ Weapon",
          signedUpUser: null
        },
        {
          role: "Mdps",
          weapon: "Halberd",
          player: "",
          head: "Soldier",
          chest: "Hellion",
          boots: "idc don't die",
          buildNotes: "FREE E OFF TIMER | T9+ Weapon",
          signedUpUser: null
        }
      ]
    },
    {
      name: "Party Four",
      partyName: "STOP GETTING LOST",
      description: "/join Oib",
      positions: [
        {
          role: "Battlemount",
          weapon: "Chariot",
          player: "Oib",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "PRIO #1 | Cooldown and Def vs All",
          signedUpUser: "Oib"
        },
        {
          role: "Battlemount",
          weapon: "Behemoth",
          player: "LordDrakonrius",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "PRIO #2 | Cooldown and Def vs All",
          signedUpUser: "LordDrakonrius"
        },
        {
          role: "Battlemount",
          weapon: "Colossal Beetle",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "PRIO #3 | Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Ballista",
          player: "msusacjr2",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "PRIO #4 | Cooldown and Def vs All",
          signedUpUser: "msusacjr2"
        },
        {
          role: "Battlemount",
          weapon: "Phalanx Beetle",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "PRIO #5 | Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Flame Basi",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "PRIO #6 | Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Venom Basi",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "PRIO #7 | Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Juggernaut",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "PRIO #8 | Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Chariot",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "PRIO #9 | Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Spider",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Bastion",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Colossal Beetle",
          player: "",
          head: "Soldier",
          chest: "Valor",
          boots: "Feyscale",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Behemoth",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Flame Basi",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Venom Basi",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Rhino",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Battlemount",
          weapon: "Eagle",
          player: "",
          head: "",
          chest: "",
          boots: "",
          buildNotes: "Cooldown and Def vs All",
          signedUpUser: null
        },
        {
          role: "Tank",
          weapon: "Black Monk Staff",
          player: "",
          head: "Soldier/Cleric",
          chest: "Knight/Guardian",
          boots: "idc don't die",
          buildNotes: "Q3W4 | Throw E at their engage/bomb",
          signedUpUser: null
        },
        {
          role: "Tank",
          weapon: "Black Monk Staff",
          player: "",
          head: "Soldier/Cleric",
          chest: "Knight/Guardian",
          boots: "idc don't die",
          buildNotes: "Q3W4 | Throw E at their engage/bomb",
          signedUpUser: null
        },
        {
          role: "Tank",
          weapon: "Black Monk Staff",
          player: "",
          head: "Soldier/Cleric",
          chest: "Knight/Guardian",
          boots: "idc don't die",
          buildNotes: "Q3W4 | Throw E at their engage/bomb",
          signedUpUser: null
        }
      ]
    }
  ]
};

export default mockRosterData;
