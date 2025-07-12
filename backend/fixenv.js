const fs = require('fs');
const content = `MONGO_URI=mongodb+srv://user_guna:cyber4guna@cluster0.xbxjlxf.mongodb.net/mydb?retryWrites=true&w=majority\nPORT=5000\n`;
fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('Clean .env file written.'); 