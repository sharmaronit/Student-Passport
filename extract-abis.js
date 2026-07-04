const fs = require('fs');
const path = require('path');

const baseDir = '/Users/Apple/Desktop/VS CODe/student-skill-passport';
const contracts = ['IssuerRegistry', 'SkillCredential', 'RevocationRegistry'];

let goContent = `package blockchain

// ABIs of the compiled smart contracts, used for dynamic binding at runtime.
const (
`;

contracts.forEach(name => {
  const jsonPath = path.join(baseDir, 'contracts', 'artifacts', 'contracts', `${name}.sol`, `${name}.json`);
  if (!fs.existsSync(jsonPath)) {
    console.error(`Artifact not found at: ${jsonPath}`);
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const abiString = JSON.stringify(artifact.abi);
  goContent += `\t${name}ABI = \`${abiString}\`\n\n`;
});

goContent += `)\n`;

const targetDir = path.join(baseDir, 'backend', 'internal', 'blockchain');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(path.join(targetDir, 'abis.go'), goContent);
console.log('Successfully generated backend/internal/blockchain/abis.go');
