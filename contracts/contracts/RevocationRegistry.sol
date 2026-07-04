// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RevocationRegistry
 * @notice A standalone registry that tracks revoked credentials.
 * @dev This provides an additional, independent revocation check
 *      separate from the SkillCredential contract's internal revocation.
 *      Useful for cross-contract queries and future interoperability.
 */
contract RevocationRegistry is Ownable {

    // ── State ────────────────────────────────────────────────────
    // credentialHash → revocation status
    mapping(string => bool) private _revokedByHash;

    // credentialHash → revoker address
    mapping(string => address) private _revokedBy;

    // credentialHash → revocation timestamp
    mapping(string => uint256) private _revokedAt;

    // Total revocation count
    uint256 private _revocationCount;

    // Addresses authorized to revoke (issuers + admin)
    mapping(address => bool) private _authorizedRevokers;

    // ── Events ───────────────────────────────────────────────────
    event CredentialRevoked(string indexed contentHash, address indexed revoker, uint256 timestamp);
    event RevokerAdded(address indexed revoker);
    event RevokerRemoved(address indexed revoker);

    // ── Constructor ──────────────────────────────────────────────
    constructor() Ownable(msg.sender) {
        _authorizedRevokers[msg.sender] = true;
    }

    // ── Admin Functions ──────────────────────────────────────────

    /**
     * @notice Add an address authorized to revoke credentials.
     * @param revoker The address to authorize.
     */
    function addRevoker(address revoker) external onlyOwner {
        require(revoker != address(0), "Invalid address");
        _authorizedRevokers[revoker] = true;
        emit RevokerAdded(revoker);
    }

    /**
     * @notice Remove an address from authorized revokers.
     * @param revoker The address to remove.
     */
    function removeRevoker(address revoker) external onlyOwner {
        _authorizedRevokers[revoker] = false;
        emit RevokerRemoved(revoker);
    }

    // ── Revocation Functions ─────────────────────────────────────

    /**
     * @notice Revoke a credential by its content hash.
     * @param contentHash The SHA-256 hash of the credential data.
     */
    function revoke(string calldata contentHash) external {
        require(_authorizedRevokers[msg.sender], "Not authorized to revoke");
        require(bytes(contentHash).length > 0, "Content hash required");
        require(!_revokedByHash[contentHash], "Already revoked");

        _revokedByHash[contentHash] = true;
        _revokedBy[contentHash] = msg.sender;
        _revokedAt[contentHash] = block.timestamp;
        _revocationCount++;

        emit CredentialRevoked(contentHash, msg.sender, block.timestamp);
    }

    // ── View Functions ───────────────────────────────────────────

    /**
     * @notice Check if a credential has been revoked.
     * @param contentHash The SHA-256 hash of the credential data.
     * @return True if the credential is revoked.
     */
    function isRevoked(string calldata contentHash) external view returns (bool) {
        return _revokedByHash[contentHash];
    }

    /**
     * @notice Get revocation details for a credential.
     * @param contentHash The credential's content hash.
     * @return revokedByAddr The address that revoked it.
     * @return revokedAtTime The timestamp of revocation.
     * @return revoked Whether it is revoked.
     */
    function getRevocationDetails(string calldata contentHash) external view returns (
        address revokedByAddr,
        uint256 revokedAtTime,
        bool revoked
    ) {
        return (
            _revokedBy[contentHash],
            _revokedAt[contentHash],
            _revokedByHash[contentHash]
        );
    }

    /**
     * @notice Check if an address is an authorized revoker.
     * @param addr The address to check.
     */
    function isAuthorizedRevoker(address addr) external view returns (bool) {
        return _authorizedRevokers[addr];
    }

    /**
     * @notice Get the total number of revoked credentials.
     */
    function getRevocationCount() external view returns (uint256) {
        return _revocationCount;
    }
}
