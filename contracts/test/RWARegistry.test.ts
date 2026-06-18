import { expect } from "chai";
import { ethers } from "hardhat";
import { RWARegistry, RWAToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("RWARegistry", () => {
  let registry: RWARegistry;
  let owner: HardhatEthersSigner;
  let issuer: HardhatEthersSigner;
  let user: HardhatEthersSigner;

  beforeEach(async () => {
    [owner, issuer, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("RWARegistry");
    registry = (await Factory.deploy(owner.address)) as RWARegistry;
  });

  describe("registerAsset", () => {
    it("deploys a token and emits AssetRegistered", async () => {
      const tx = await registry.registerAsset(
        "Warsaw Office Tower",
        "WOT",
        0, // RealEstate
        ethers.parseEther("10000000"),
        "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (l) => registry.interface.parseLog(l as never)?.name === "AssetRegistered"
      );
      expect(event).to.not.be.undefined;
    });

    it("increments totalAssets", async () => {
      await registry.registerAsset("Asset A", "AAA", 0, ethers.parseEther("1000000"), "cid1");
      await registry.registerAsset("Asset B", "BBB", 1, ethers.parseEther("500000"), "cid2");
      expect(await registry.totalAssets()).to.equal(2n);
    });

    it("reverts for non-issuers", async () => {
      await expect(
        registry.connect(user).registerAsset("Hack", "HCK", 4, 0n, "cid")
      ).to.be.revertedWith("RWARegistry: not an issuer");
    });
  });

  describe("RWAToken via registry", () => {
    let token: RWAToken;
    let assetId: string;

    beforeEach(async () => {
      const tx = await registry.registerAsset(
        "Krakow Logistics Park",
        "KLP",
        2, // PrivateCredit
        ethers.parseEther("5000000"),
        "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku"
      );
      const receipt = await tx.wait();
      const parsed = receipt?.logs
        .map((l) => { try { return registry.interface.parseLog(l as never); } catch { return null; } })
        .find((e) => e?.name === "AssetRegistered");

      assetId = parsed!.args.id;
      const tokenAddress = parsed!.args.tokenAddress;
      token = (await ethers.getContractAt("RWAToken", tokenAddress)) as RWAToken;
    });

    it("owner can mint to whitelisted address", async () => {
      await token.setWhitelist(user.address, true);
      await token.mint(user.address, ethers.parseEther("1000"));
      expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther("1000"));
    });

    it("mint reverts for non-whitelisted", async () => {
      await expect(token.mint(user.address, 1n)).to.be.revertedWith(
        "RWAToken: address not whitelisted"
      );
    });

    it("transfer enforces whitelist", async () => {
      await token.setWhitelist(user.address, true);
      await token.mint(user.address, ethers.parseEther("500"));
      await expect(
        token.connect(user).transfer(issuer.address, ethers.parseEther("100"))
      ).to.be.revertedWith("RWAToken: recipient not whitelisted");
    });

    it("burn reduces total supply", async () => {
      await token.setWhitelist(user.address, true);
      await token.mint(user.address, ethers.parseEther("200"));
      await token.connect(user).burn(ethers.parseEther("50"));
      expect(await token.totalSupply()).to.equal(ethers.parseEther("150"));
    });

    it("assetId matches registry record", async () => {
      expect(await token.assetId()).to.equal(assetId);
    });
  });

  describe("setAssetStatus", () => {
    it("changes status and emits event", async () => {
      const tx = await registry.registerAsset("Asset X", "AXX", 4, 0n, "cid");
      const receipt = await tx.wait();
      const parsed = receipt?.logs
        .map((l) => { try { return registry.interface.parseLog(l as never); } catch { return null; } })
        .find((e) => e?.name === "AssetRegistered");
      const id = parsed!.args.id;

      await expect(registry.setAssetStatus(id, 2)) // Paused
        .to.emit(registry, "AssetStatusChanged")
        .withArgs(id, 2n);
    });
  });
});
