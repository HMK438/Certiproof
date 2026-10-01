import { expect } from "chai";
import hre from "hardhat";

const { ethers, networkHelpers } = await hre.network.create();

const SAMPLE_HASH_1 = ethers.keccak256(ethers.toUtf8Bytes("sample-certificate-1"));
const SAMPLE_HASH_2 = ethers.keccak256(ethers.toUtf8Bytes("sample-certificate-2"));

async function deployRegistryFixture() {
  const [owner, issuer, student, stranger] = await ethers.getSigners();
  const registry = await ethers.deployContract("CertificateRegistry");
  return { registry, owner, issuer, student, stranger };
}

describe("CertificateRegistry", function () {
  describe("Deployment", function () {
    it("sets the deployer as owner and as the first authorized issuer", async function () {
      const { registry, owner } = await networkHelpers.loadFixture(deployRegistryFixture);
      expect(await registry.owner()).to.equal(owner.address);
      expect(await registry.isIssuer(owner.address)).to.equal(true);
    });
  });

  describe("Issuer management", function () {
    it("lets the owner add a new issuer", async function () {
      const { registry, owner, issuer } = await networkHelpers.loadFixture(deployRegistryFixture);
      await expect(registry.connect(owner).addIssuer(issuer.address))
        .to.emit(registry, "IssuerAdded")
        .withArgs(issuer.address);
      expect(await registry.isIssuer(issuer.address)).to.equal(true);
    });

    it("reverts when a non-owner tries to add an issuer", async function () {
      const { registry, issuer, stranger } = await networkHelpers.loadFixture(deployRegistryFixture);
      await expect(
        registry.connect(stranger).addIssuer(issuer.address)
      ).to.be.revertedWithCustomError(registry, "NotOwner");
    });

    it("reverts when adding the zero address as an issuer", async function () {
      const { registry, owner } = await networkHelpers.loadFixture(deployRegistryFixture);
      await expect(
        registry.connect(owner).addIssuer(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(registry, "ZeroAddress");
    });

    it("lets the owner remove an issuer", async function () {
      const { registry, owner, issuer } = await networkHelpers.loadFixture(deployRegistryFixture);
      await registry.connect(owner).addIssuer(issuer.address);
      await expect(registry.connect(owner).removeIssuer(issuer.address))
        .to.emit(registry, "IssuerRemoved")
        .withArgs(issuer.address);
      expect(await registry.isIssuer(issuer.address)).to.equal(false);
    });
  });

  describe("Issuing certificates", function () {
    it("lets an authorized issuer issue a certificate", async function () {
      const { registry, owner } = await networkHelpers.loadFixture(deployRegistryFixture);
      const tx = registry.connect(owner).issueCertificate(SAMPLE_HASH_1);
      await expect(tx).to.emit(registry, "CertificateIssued");

      const result = await registry.verifyCertificate(SAMPLE_HASH_1);
      expect(result.exists).to.equal(true);
      expect(result.issuer).to.equal(owner.address);
      expect(result.revoked).to.equal(false);
    });

    it("reverts when an unauthorized address tries to issue", async function () {
      const { registry, stranger } = await networkHelpers.loadFixture(deployRegistryFixture);
      await expect(
        registry.connect(stranger).issueCertificate(SAMPLE_HASH_1)
      ).to.be.revertedWithCustomError(registry, "NotAuthorizedIssuer");
    });

    it("reverts when issuing the same certificate hash twice", async function () {
      const { registry, owner } = await networkHelpers.loadFixture(deployRegistryFixture);
      await registry.connect(owner).issueCertificate(SAMPLE_HASH_1);
      await expect(
        registry.connect(owner).issueCertificate(SAMPLE_HASH_1)
      ).to.be.revertedWithCustomError(registry, "CertificateAlreadyExists");
    });

    it("allows different issuers to issue distinct certificates", async function () {
      const { registry, owner, issuer } = await networkHelpers.loadFixture(deployRegistryFixture);
      await registry.connect(owner).addIssuer(issuer.address);
      await registry.connect(owner).issueCertificate(SAMPLE_HASH_1);
      await registry.connect(issuer).issueCertificate(SAMPLE_HASH_2);

      const first = await registry.verifyCertificate(SAMPLE_HASH_1);
      const second = await registry.verifyCertificate(SAMPLE_HASH_2);
      expect(first.issuer).to.equal(owner.address);
      expect(second.issuer).to.equal(issuer.address);
    });
  });

  describe("Revoking certificates", function () {
    it("lets the original issuer revoke their own certificate", async function () {
      const { registry, owner, issuer } = await networkHelpers.loadFixture(deployRegistryFixture);
      await registry.connect(owner).addIssuer(issuer.address);
      await registry.connect(issuer).issueCertificate(SAMPLE_HASH_1);

      await expect(registry.connect(issuer).revokeCertificate(SAMPLE_HASH_1))
        .to.emit(registry, "CertificateRevoked");

      const result = await registry.verifyCertificate(SAMPLE_HASH_1);
      expect(result.revoked).to.equal(true);
    });

    it("lets the contract owner revoke a certificate issued by someone else", async function () {
      const { registry, owner, issuer } = await networkHelpers.loadFixture(deployRegistryFixture);
      await registry.connect(owner).addIssuer(issuer.address);
      await registry.connect(issuer).issueCertificate(SAMPLE_HASH_1);

      await expect(registry.connect(owner).revokeCertificate(SAMPLE_HASH_1)).to.emit(
        registry,
        "CertificateRevoked"
      );
    });

    it("reverts when an unrelated address tries to revoke", async function () {
      const { registry, owner, stranger } = await networkHelpers.loadFixture(deployRegistryFixture);
      await registry.connect(owner).issueCertificate(SAMPLE_HASH_1);

      await expect(
        registry.connect(stranger).revokeCertificate(SAMPLE_HASH_1)
      ).to.be.revertedWithCustomError(registry, "NotOriginalIssuerOrOwner");
    });

    it("reverts when revoking a certificate that was never issued", async function () {
      const { registry, owner } = await networkHelpers.loadFixture(deployRegistryFixture);
      await expect(
        registry.connect(owner).revokeCertificate(SAMPLE_HASH_1)
      ).to.be.revertedWithCustomError(registry, "CertificateDoesNotExist");
    });

    it("reverts when revoking an already-revoked certificate", async function () {
      const { registry, owner } = await networkHelpers.loadFixture(deployRegistryFixture);
      await registry.connect(owner).issueCertificate(SAMPLE_HASH_1);
      await registry.connect(owner).revokeCertificate(SAMPLE_HASH_1);

      await expect(
        registry.connect(owner).revokeCertificate(SAMPLE_HASH_1)
      ).to.be.revertedWithCustomError(registry, "CertificateAlreadyRevoked");
    });
  });

  describe("Verification", function () {
    it("reports exists=false for a hash that was never issued", async function () {
      const { registry } = await networkHelpers.loadFixture(deployRegistryFixture);
      const result = await registry.verifyCertificate(SAMPLE_HASH_1);
      expect(result.exists).to.equal(false);
      expect(result.issuer).to.equal(ethers.ZeroAddress);
    });

    it("is a free view call usable by anyone, including addresses with no role", async function () {
      const { registry, owner, stranger } = await networkHelpers.loadFixture(deployRegistryFixture);
      await registry.connect(owner).issueCertificate(SAMPLE_HASH_1);
      const result = await registry.connect(stranger).verifyCertificate(SAMPLE_HASH_1);
      expect(result.exists).to.equal(true);
    });
  });

  describe("Ownership", function () {
    it("lets the owner transfer ownership", async function () {
      const { registry, owner, stranger } = await networkHelpers.loadFixture(deployRegistryFixture);
      await expect(registry.connect(owner).transferOwnership(stranger.address))
        .to.emit(registry, "OwnershipTransferred")
        .withArgs(owner.address, stranger.address);
      expect(await registry.owner()).to.equal(stranger.address);
    });

    it("reverts when transferring ownership to the zero address", async function () {
      const { registry, owner } = await networkHelpers.loadFixture(deployRegistryFixture);
      await expect(
        registry.connect(owner).transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(registry, "ZeroAddress");
    });

    it("reverts when a non-owner tries to transfer ownership", async function () {
      const { registry, stranger } = await networkHelpers.loadFixture(deployRegistryFixture);
      await expect(
        registry.connect(stranger).transferOwnership(stranger.address)
      ).to.be.revertedWithCustomError(registry, "NotOwner");
    });
  });
});
