const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SkillCredential (Soulbound Token)", function () {
  let registry, credential;
  let owner, issuer, student, randomUser;

  beforeEach(async function () {
    [owner, issuer, student, randomUser] = await ethers.getSigners();

    // Deploy IssuerRegistry
    const IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
    registry = await IssuerRegistry.deploy();
    await registry.waitForDeployment();

    // Register the issuer
    await registry.registerIssuer(issuer.address, "MIT", "university");

    // Deploy SkillCredential with registry address
    const SkillCredential = await ethers.getContractFactory("SkillCredential");
    credential = await SkillCredential.deploy(await registry.getAddress());
    await credential.waitForDeployment();
  });

  describe("Credential Issuance", function () {
    it("should allow authorized issuer to mint a credential", async function () {
      const tx = await credential.connect(issuer).issueCredential(
        student.address,
        "hackathon",
        "abc123hash",
        "QmTestCID123",
        "ipfs://QmTestCID123"
      );

      await expect(tx)
        .to.emit(credential, "CredentialIssued")
        .withArgs(1, issuer.address, student.address, "hackathon", "abc123hash", "QmTestCID123");

      // Verify token ownership
      expect(await credential.ownerOf(1)).to.equal(student.address);

      // Verify credential data
      const cred = await credential.getCredential(1);
      expect(cred.issuer).to.equal(issuer.address);
      expect(cred.student).to.equal(student.address);
      expect(cred.credentialType).to.equal("hackathon");
      expect(cred.contentHash).to.equal("abc123hash");
      expect(cred.ipfsCID).to.equal("QmTestCID123");
      expect(cred.revoked).to.be.false;
    });

    it("should reject minting from unauthorized address", async function () {
      await expect(
        credential.connect(randomUser).issueCredential(
          student.address, "hackathon", "hash", "cid", "ipfs://cid"
        )
      ).to.be.revertedWith("Caller is not an authorized issuer");
    });

    it("should reject minting to zero address", async function () {
      await expect(
        credential.connect(issuer).issueCredential(
          ethers.ZeroAddress, "hackathon", "hash", "cid", "ipfs://cid"
        )
      ).to.be.revertedWith("Invalid student address");
    });

    it("should increment token IDs", async function () {
      await credential.connect(issuer).issueCredential(
        student.address, "hackathon", "hash1", "cid1", "ipfs://cid1"
      );
      await credential.connect(issuer).issueCredential(
        student.address, "certification", "hash2", "cid2", "ipfs://cid2"
      );

      expect(await credential.totalCredentials()).to.equal(2);
      expect(await credential.ownerOf(1)).to.equal(student.address);
      expect(await credential.ownerOf(2)).to.equal(student.address);
    });
  });

  describe("Soulbound (Non-Transferable)", function () {
    beforeEach(async function () {
      await credential.connect(issuer).issueCredential(
        student.address, "hackathon", "hash", "cid", "ipfs://cid"
      );
    });

    it("should prevent transfers via transferFrom", async function () {
      await expect(
        credential.connect(student).transferFrom(student.address, randomUser.address, 1)
      ).to.be.revertedWith("SkillCredential: Soulbound tokens cannot be transferred");
    });

    it("should prevent transfers via safeTransferFrom", async function () {
      await expect(
        credential.connect(student)["safeTransferFrom(address,address,uint256)"](
          student.address, randomUser.address, 1
        )
      ).to.be.revertedWith("SkillCredential: Soulbound tokens cannot be transferred");
    });
  });

  describe("Revocation", function () {
    beforeEach(async function () {
      await credential.connect(issuer).issueCredential(
        student.address, "hackathon", "hash", "cid", "ipfs://cid"
      );
    });

    it("should allow issuer to revoke their credential", async function () {
      await expect(credential.connect(issuer).revokeCredential(1))
        .to.emit(credential, "CredentialRevoked")
        .withArgs(1, issuer.address);

      expect(await credential.isRevoked(1)).to.be.true;
    });

    it("should prevent non-issuer from revoking", async function () {
      await expect(
        credential.connect(randomUser).revokeCredential(1)
      ).to.be.revertedWith("Only the issuer can revoke");
    });

    it("should prevent double revocation", async function () {
      await credential.connect(issuer).revokeCredential(1);
      await expect(
        credential.connect(issuer).revokeCredential(1)
      ).to.be.revertedWith("Already revoked");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await credential.connect(issuer).issueCredential(
        student.address, "hackathon", "hash1", "cid1", "ipfs://cid1"
      );
      await credential.connect(issuer).issueCredential(
        student.address, "internship", "hash2", "cid2", "ipfs://cid2"
      );
    });

    it("should return student credentials", async function () {
      const tokenIds = await credential.getStudentCredentials(student.address);
      expect(tokenIds.length).to.equal(2);
      expect(tokenIds[0]).to.equal(1);
      expect(tokenIds[1]).to.equal(2);
    });

    it("should return issuer credentials", async function () {
      const tokenIds = await credential.getIssuerCredentials(issuer.address);
      expect(tokenIds.length).to.equal(2);
    });

    it("should return correct tokenURI", async function () {
      expect(await credential.tokenURI(1)).to.equal("ipfs://cid1");
    });
  });
});
