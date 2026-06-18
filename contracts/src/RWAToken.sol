// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title RWAToken — ERC-20 token representing a fractional share of a real-world asset
/// @notice Each deployed instance maps 1:1 to a registered asset in RWARegistry
contract RWAToken is ERC20, Ownable, Pausable {
    /// @notice Unique asset ID from the RWARegistry
    bytes32 public immutable assetId;

    /// @notice IPFS CID pointing to the off-chain asset documentation
    string public documentCID;

    /// @notice Addresses whitelisted for transfers (KYC/AML compliance)
    mapping(address => bool) public whitelisted;

    event Whitelisted(address indexed account, bool status);
    event DocumentUpdated(string newCID);
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    modifier onlyWhitelisted(address account) {
        require(whitelisted[account], "RWAToken: address not whitelisted");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        bytes32 assetId_,
        string memory documentCID_,
        address initialOwner
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        assetId = assetId_;
        documentCID = documentCID_;
        whitelisted[initialOwner] = true;
    }

    /// @notice Mint new tokens to a whitelisted address
    function mint(address to, uint256 amount)
        external
        onlyOwner
        onlyWhitelisted(to)
        whenNotPaused
    {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /// @notice Burn tokens from caller's balance
    function burn(uint256 amount) external whenNotPaused {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    }

    /// @notice Update the IPFS document pointer (e.g. after audit)
    function updateDocument(string calldata newCID) external onlyOwner {
        documentCID = newCID;
        emit DocumentUpdated(newCID);
    }

    /// @notice Add or remove an address from the whitelist
    function setWhitelist(address account, bool status) external onlyOwner {
        whitelisted[account] = status;
        emit Whitelisted(account, status);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /// @dev Override to enforce whitelist on every transfer
    function _update(address from, address to, uint256 value)
        internal
        override
        whenNotPaused
    {
        if (from != address(0) && to != address(0)) {
            require(whitelisted[from], "RWAToken: sender not whitelisted");
            require(whitelisted[to], "RWAToken: recipient not whitelisted");
        }
        super._update(from, to, value);
    }
}
