const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IssuerRegistry", function () {
  let registry;
  let owner, issuer1, issuer2, randomUser;

  beforeEach(async function () {
    [owner, issuer1, issuer2, randomUser] = await ethers.getSigners();
    const IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
    registry = await IssuerRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Registration", function () {
    it("should allow owner to register an issuer", async function () {
      await expect(
        registry.registerIssuer(issuer1.address, "MIT", "university")
      )
        .to.emit(registry, "IssuerRegistered")
        .withArgs(issuer1.address, "MIT", "university");

      expect(await registry.isAuthorizedIssuer(issuer1.address)).to.be.true;
    });

    it("should reject registration from non-owner", async function () {
      await expect(
        registry.connect(randomUser).registerIssuer(issuer1.address, "MIT", "university")
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("should reject duplicate active issuer", async function () {
      await registry.registerIssuer(issuer1.address, "MIT", "university");
      await expect(
        registry.registerIssuer(issuer1.address, "MIT", "university")
      ).to.be.revertedWith("Issuer already active");
    });

    it("should reject zero address", async function () {
      await expect(
        registry.registerIssuer(ethers.ZeroAddress, "MIT", "university")
      ).to.be.revertedWith("Invalid address");
    });

    it("should reject empty name", async function () {
      await expect(
        registry.registerIssuer(issuer1.address, "", "university")
      ).to.be.revertedWith("Name required");
    });
  });

  describe("Revocation & Reactivation", function () {
    beforeEach(async function () {
      await registry.registerIssuer(issuer1.address, "MIT", "university");
    });

    it("should allow owner to revoke an issuer", async function () {
      await expect(registry.revokeIssuer(issuer1.address))
        .to.emit(registry, "IssuerRevoked")
        .withArgs(issuer1.address);

      expect(await registry.isAuthorizedIssuer(issuer1.address)).to.be.false;
    });

    it("should allow owner to reactivate a revoked issuer", async function () {
      await registry.revokeIssuer(issuer1.address);

      await expect(registry.reactivateIssuer(issuer1.address))
        .to.emit(registry, "IssuerReactivated")
        .withArgs(issuer1.address);

      expect(await registry.isAuthorizedIssuer(issuer1.address)).to.be.true;
    });
  });

  describe("View Functions", function () {
    it("should return issuer details", async function () {
      await registry.registerIssuer(issuer1.address, "TechCorp", "company");

      const [name, orgType, isActive] = await registry.getIssuer(issuer1.address);
      expect(name).to.equal("TechCorp");
      expect(orgType).to.equal("company");
      expect(isActive).to.be.true;
    });

    it("should track issuer count", async function () {
      expect(await registry.getIssuerCount()).to.equal(0);

      await registry.registerIssuer(issuer1.address, "MIT", "university");
      await registry.registerIssuer(issuer2.address, "TechCorp", "company");

      expect(await registry.getIssuerCount()).to.equal(2);
    });

    it("should return false for unregistered address", async function () {
      expect(await registry.isAuthorizedIssuer(randomUser.address)).to.be.false;
    });
  });
});
