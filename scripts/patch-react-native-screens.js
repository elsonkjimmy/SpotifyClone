const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-screens',
  'android',
  'src',
  'main',
  'java',
  'com',
  'swmansion',
  'rnscreens',
  'ScreenStackHeaderConfig.kt',
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const source = fs.readFileSync(target, 'utf8');
const appCompatImport = 'import androidx.appcompat.R';

if (source.includes(appCompatImport)) {
  process.exit(0);
}

const anchor = 'import android.widget.TextView\n';
const patched = source.replace(anchor, `${anchor}${appCompatImport}\n`);

if (patched === source) {
  console.warn('Could not patch react-native-screens ScreenStackHeaderConfig.kt');
  process.exit(0);
}

fs.writeFileSync(target, patched);
