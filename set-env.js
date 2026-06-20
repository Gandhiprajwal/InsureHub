const fs = require('fs');
const path = require('path');

// Load default configuration
let useMock = 'true';
let apiUrl = 'http://localhost:8080/api';

const envPath = path.join(__dirname, '.env');

// Read .env if it exists
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  lines.forEach(line => {
    // Strip comments
    const cleanLine = line.split('#')[0].trim();
    if (!cleanLine) return;

    const parts = cleanLine.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'USE_MOCK') {
        useMock = val;
      } else if (key === 'API_URL') {
        apiUrl = val;
      }
    }
  });
}

// Generate environments directory if not exists
const dirPath = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Write environment.ts
const envFileContent = `// Generated automatically by set-env.js script
export const environment = {
  production: false,
  useMock: ${useMock === 'true'},
  apiUrl: '${apiUrl}'
};
`;

fs.writeFileSync(path.join(dirPath, 'environment.ts'), envFileContent);
console.log('Environment file generated successfully at src/environments/environment.ts');
console.log(`- USE_MOCK: ${useMock}`);
console.log(`- API_URL: ${apiUrl}`);
