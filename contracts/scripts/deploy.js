const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("═══════════════════════════════════════════════════════");
  console.log("  Student Skill Passport — Contract Deployment");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Deployer:  ${deployer.address}`);
  console.log(`  Network:   ${hre.network.name}`);
  console.log(`  Chain ID:  ${(await hre.ethers.provider.getNetwork()).chainId}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // ── 1. Deploy IssuerRegistry ────────────────────────────────────
  console.log("1/3  Deploying IssuerRegistry...");
  const IssuerRegistry = await hre.ethers.getContractFactory("IssuerRegistry");
  const issuerRegistry = await IssuerRegistry.deploy();
  await issuerRegistry.waitForDeployment();
  const issuerRegistryAddr = await issuerRegistry.getAddress();
  console.log(`     ✅ IssuerRegistry deployed: ${issuerRegistryAddr}\n`);

  // ── 2. Deploy SkillCredential ───────────────────────────────────
  console.log("2/3  Deploying SkillCredential (SBT)...");
  const SkillCredential = await hre.ethers.getContractFactory("SkillCredential");
  const skillCredential = await SkillCredential.deploy(issuerRegistryAddr);
  await skillCredential.waitForDeployment();
  const skillCredentialAddr = await skillCredential.getAddress();
  console.log(`     ✅ SkillCredential deployed: ${skillCredentialAddr}\n`);

  // ── 3. Deploy RevocationRegistry ────────────────────────────────
  console.log("3/3  Deploying RevocationRegistry...");
  const RevocationRegistry = await hre.ethers.getContractFactory("RevocationRegistry");
  const revocationRegistry = await RevocationRegistry.deploy();
  await revocationRegistry.waitForDeployment();
  const revocationRegistryAddr = await revocationRegistry.getAddress();
  console.log(`     ✅ RevocationRegistry deployed: ${revocationRegistryAddr}\n`);

  // ── Summary ─────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════");
  console.log("  ✅ All contracts deployed successfully!");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`\n  Add these to your .env file:\n`);
  console.log(`  ISSUER_REGISTRY_ADDRESS=${issuerRegistryAddr}`);
  console.log(`  SKILL_CREDENTIAL_ADDRESS=${skillCredentialAddr}`);
  console.log(`  REVOCATION_REGISTRY_ADDRESS=${revocationRegistryAddr}`);
  console.log("\n═══════════════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
