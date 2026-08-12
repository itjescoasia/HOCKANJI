const fs = require('fs');
const file = 'src/utils/highlight.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldFormsCheck = `        if (form.value && example.includes(form.value)) {
          isMatch = true;
          break;
        }`;
const newFormsCheck = `        if ((form.value && example.includes(form.value)) || (form.reading && example.includes(form.reading))) {
          isMatch = true;
          break;
        }`;

if (code.includes(oldFormsCheck)) {
    code = code.replace(oldFormsCheck, newFormsCheck);
    fs.writeFileSync(file, code);
    console.log("Patched forms check successfully");
} else {
    console.log("Not found forms check");
}
