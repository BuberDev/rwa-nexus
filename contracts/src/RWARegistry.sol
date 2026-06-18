// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RWAToken.sol";

/// @title RWARegistry — on-chain registry of tokenized real-world assets
/// @notice Deploys and tracks RWAToken contracts; emits events indexed by The Graph
contract RWARegistry is Ownable {
    enum AssetClass { RealEstate, Commodity, PrivateCredit, Infrastructure, Other }
    enum AssetStatus { Pending, Active, Paused, Redeemed }

    struct Asset {
        bytes32 id;
        string name;
        AssetClass assetClass;
        AssetStatus status;
        address tokenAddress;
        uint256 totalValue;      // USD, 18-decimal fixed point
        string documentCID;
        uint256 createdAt;
    }

    mapping(bytes32 => Asset) public assets;
    bytes32[] public assetIds;

    /// @notice Authorised issuers who can register assets
    mapping(address => bool) public issuers;

    event AssetRegistered(
        bytes32 indexed id,
        string name,
        AssetClass assetClass,
        address tokenAddress
    );
    event AssetStatusChanged(bytes32 indexed id, AssetStatus newStatus);
    event IssuerUpdated(address indexed issuer, bool authorised);

    modifier onlyIssuer() {
        require(issuers[msg.sender] || msg.sender == owner(), "RWARegistry: not an issuer");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        issuers[initialOwner] = true;
    }

    /// @notice Register a new asset and deploy its token contract
    /// @return id   The keccak256 asset identifier
    /// @return token The deployed RWAToken address
    function registerAsset(
        string calldata name,
        string calldata symbol,
        AssetClass assetClass,
        uint256 totalValue,
        string calldata documentCID
    ) external onlyIssuer returns (bytes32 id, address token) {
        id = keccak256(abi.encodePacked(name, symbol, block.timestamp, msg.sender));
        require(assets[id].createdAt == 0, "RWARegistry: asset already exists");

        RWAToken rwaToken = new RWAToken(name, symbol, id, documentCID, msg.sender);
        token = address(rwaToken);

        assets[id] = Asset({
            id: id,
            name: name,
            assetClass: assetClass,
            status: AssetStatus.Active,
            tokenAddress: token,
            totalValue: totalValue,
            documentCID: documentCID,
            createdAt: block.timestamp
        });
        assetIds.push(id);

        emit AssetRegistered(id, name, assetClass, token);
    }

    /// @notice Change the lifecycle status of an asset
    function setAssetStatus(bytes32 id, AssetStatus newStatus) external onlyIssuer {
        require(assets[id].createdAt != 0, "RWARegistry: unknown asset");
        assets[id].status = newStatus;
        emit AssetStatusChanged(id, newStatus);
    }

    function setIssuer(address issuer, bool authorised) external onlyOwner {
        issuers[issuer] = authorised;
        emit IssuerUpdated(issuer, authorised);
    }

    function totalAssets() external view returns (uint256) {
        return assetIds.length;
    }

    function getAsset(bytes32 id) external view returns (Asset memory) {
        return assets[id];
    }
}
