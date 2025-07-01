// Test data structure example for roster
const exampleRosterData = {
  author: "user123",
  eventName: "Weekly Siege Battle",
  eventDescription: "Large scale siege warfare event",
  parties: [
    {
      name: "Main Party", // First party is always "Main Party"
      description: "Primary assault team",
      positions: [
        {
          role: "Main Caller",
          weapon: "Great Axe",
          buildNotes: "Tank build with heavy armor"
        },
        {
          role: "Backup Caller", 
          weapon: "Sword & Shield",
          buildNotes: "Support tank build"
        },
        {
          role: "DPS",
          weapon: "Fire Staff",
          buildNotes: "High damage mage build"
        }
        // ... 17 more positions to make 20 total
      ]
    },
    {
      name: "Flanking Party",
      description: "Secondary assault team",
      positions: [
        // ... 20 positions
      ]
    }
    // ... up to 5 parties total
  ],
  createdBy: {
    discordId: "discord123",
    username: "PlayerName",
    displayName: "Player Display Name",
    nickname: "Player Nickname"
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

console.log('Example roster data structure:', exampleRosterData);
