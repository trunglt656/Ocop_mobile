/**
 * Script để xóa cache của React Native app
 * Chạy script này nếu gặp vấn đề với token cũ
 * 
 * Cách sử dụng:
 * npx react-native start --reset-cache
 * hoặc
 * expo start -c
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing React Native cache...\n');

// Các thư mục cache cần xóa
const cacheDirs = [
  path.join(__dirname, 'node_modules/.cache'),
  path.join(__dirname, '.expo'),
  path.join(__dirname, '.expo-shared'),
  path.join(__dirname, 'dist'),
];

// Xóa các thư mục cache
cacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Deleting: ${dir}`);
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Deleted: ${dir}\n`);
    } catch (error) {
      console.log(`❌ Could not delete ${dir}: ${error.message}\n`);
    }
  }
});

console.log('\n✨ Cache cleared!');
console.log('\nNext steps:');
console.log('1. Run: npm start');
console.log('2. Press "c" to clear Metro bundler cache');
console.log('3. Or run: expo start -c\n');
