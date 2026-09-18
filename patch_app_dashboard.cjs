const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/onNavigateAdd=\{\(\) => handleNavigate\('add'\)\}/g, "onNavigateAdd={isAdmin ? () => handleNavigate('add') : undefined}");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx Dashboard prop successfully.");
