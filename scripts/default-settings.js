/**
 * Default Server Settings
 * 
 * This file contains the default settings that will be used to initialize
 * the Firestore serverSettings collection. These settings can be modified
 * through the ServerSettings admin UI after initialization.
 */

const defaultSettings = {
  // Discord Server Configuration
  guildId: '123456789012345678',            // Your Discord server/guild ID
  elevatedRoleId: '234567890123456789',     // Admin role ID with full access
  userRoleId: '345678901234567890',         // Standard user role ID
  guestRoleId: '456789012345678901',        // Guest role ID with limited access
  guildName: 'Your Discord Server',          // Will be auto-populated from API

  // Gameplay Roles (character classes/roles for the roster)
  roles: ['Tank', 'Healer', 'DPS', 'Support', 'Scout'],
  
  // Weapons available for each role
  weaponsByRole: {
    'Tank': ['Sword and Shield', 'Warhammer', 'Great Axe', 'Halberd'],
    'Healer': ['Life Staff', 'Void Gauntlet', 'Nature Staff'],
    'DPS': ['Bow', 'Musket', 'Fire Staff', 'Rapier', 'Spear', 'Great Sword'],
    'Support': ['Ice Gauntlet', 'Void Gauntlet', 'Sword and Shield', 'Spear'],
    'Scout': ['Bow', 'Musket', 'Hatchet', 'Dagger']
  },
  
  // Armor options by slot
  armorOptions: {
    head: ['Heavy Helm', 'Medium Helm', 'Light Hood', 'No Helm'],
    chest: ['Heavy Plate', 'Medium Chest', 'Light Chest', 'Cloth Robe'],
    feet: ['Heavy Boots', 'Medium Boots', 'Light Shoes', 'No Footwear']
  }
};

module.exports = defaultSettings;
