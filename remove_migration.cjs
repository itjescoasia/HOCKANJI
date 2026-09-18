const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /if \(currentUser\?\.email === 'nguyenthetrung200126@gmail\.com'\) \{\s*const migrate = async \(\) => \{[\s\S]*?migrate\(\);\s*\}/;

if(regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/App.tsx', code);
    console.log("Migration script removed from App.tsx");
} else {
    console.log("Migration script not found");
}

