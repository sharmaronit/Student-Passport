const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RevocationRegistry", function () {
  let registry;
  let owner, revoker, randomUser;

  beforeEach(async function () {
    [owner, revoker, randomUser] = await ethers.getSigners();
    const RevocationRegistry = await ethers.getContractFactory("RevocationRegistry");
    registry = await RevocationRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Revoker Management", function () {
    it("should have owner as authorized revoker by default", async function () {
      expect(await registry.isAuthorizedRevoker(owner.address)).to.be.true;
    });

    it("should allow owner to add revoker", async function () {
      await expect(registry.addRevoker(revoker.address))
        .to.emit(registry, "RevokerAdded")
        .withArgs(revoker.address);

      expect(await registry.isAuthorizedRevoker(revoker.address)).to.be.true;
    });

    it("should allow owner to remove revoker", async function () {
      await registry.addRevoker(revoker.address);
      await expect(registry.removeRevoker(revoker.address))
        .to.emit(registry, "RevokerRemoved")
        .withArgs(revoker.address);

      expect(await registry.isAuthorizedRevoker(revoker.address)).to.be.false;
    });
  });

  describe("Revocation", function () {
    it("should allow authorized revoker to revoke", async function () {
      const hash = "abc123hash";

      await expect(registry.revoke(hash))
        .to.emit(registry, "CredentialRevoked");

      expect(await registry.isRevoked(hash)).to.be.true;
    });

    it("should reject revocation from unauthorized address", async function () {
      await expect(
        registry.connect(randomUser).revoke("hash")
      ).to.be.revertedWith("Not authorized to revoke");
    });

    it("should prevent double revocation", async function () {
      await registry.revoke("hash");
      await expect(registry.revoke("hash")).to.be.revertedWith("Already revoked");
    });

    it("should track revocation details", async function () {
      await registry.revoke("myhash");

      const [revokedBy, revokedAt, revoked] = await registry.getRevocationDetails("myhash");
      expect(revokedBy).to.equal(owner.address);
      expect(revokedAt).to.be.greaterThan(0);
      expect(revoked).to.be.true;
    });

    it("should increment revocation count", async function () {
      expect(await registry.getRevocationCount()).to.equal(0);

      await registry.revoke("hash1");
      await registry.revoke("hash2");

      expect(await registry.getRevocationCount()).to.equal(2);
    });
  });
});
