const fs = require('fs');
const path = require('path');

// Function to convert slash-delimited strings to arrays
function convertEquipmentToArrays(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertEquipmentToArrays);
  } else if (obj && typeof obj === 'object') {
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'head' || key === 'chest' || key === 'boots') {
        if (typeof value === 'string') {
          if (value === '' || value.trim() === '') {
            converted[key] = [];
          } else {
            // Split by '/' and clean up each item
            converted[key] = value.split('/').map(item => item.trim()).filter(item => item !== '');
          }
        } else {
          converted[key] = value;
        }
      } else {
        converted[key] = convertEquipmentToArrays(value);
      }
    }
    return converted;
  }
  return obj;
}

// Process all roster files in test-data directory
const testDataDir = path.join(__dirname, 'src', 'test-data');
const files = fs.readdirSync(testDataDir).filter(file => file.startsWith('roster') && file.endsWith('-json.txt'));

files.forEach(file => {
  const filePath = path.join(testDataDir, file);
  console.log(`Processing ${file}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const converted = convertEquipmentToArrays(data);
    
    // Write back with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(converted, null, 2));
    console.log(`✓ Converted ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
});

console.log('Conversion complete!');
