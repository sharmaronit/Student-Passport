// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IssuerRegistry
 * @notice Maintains a whitelist of authorized credential issuers.
 * @dev Only the contract owner (admin) can add or remove issuers.
 *      The SkillCredential contract checks this registry before allowing minting.
 */
contract IssuerRegistry is Ownable {

    // ── Structs ──────────────────────────────────────────────────
    struct Issuer {
        string  name;       // Organization name (e.g., "MIT", "TechCorp")
        string  orgType;    // "university", "company", "hackathon_org", "cert_platform"
        bool    isActive;   // Can be deactivated without removal
        uint256 registeredAt;
    }

    // ── State ────────────────────────────────────────────────────
    mapping(address => Issuer) private _issuers;
    address[] private _issuerAddresses;

    // ── Events ───────────────────────────────────────────────────
    event IssuerRegistered(address indexed issuerAddress, string name, string orgType);
    event IssuerRevoked(address indexed issuerAddress);
    event IssuerReactivated(address indexed issuerAddress);

    // ── Constructor ──────────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    // ── Admin Functions ──────────────────────────────────────────

    /**
     * @notice Register a new authorized issuer.
     * @param issuerAddress The wallet address of the issuer.
     * @param name The organization name.
     * @param orgType The type of organization.
     */
    function registerIssuer(
        address issuerAddress,
        string calldata name,
        string calldata orgType
    ) external onlyOwner {
        require(issuerAddress != address(0), "Invalid address");
        require(!_issuers[issuerAddress].isActive, "Issuer already active");
        require(bytes(name).length > 0, "Name required");

        _issuers[issuerAddress] = Issuer({
            name: name,
            orgType: orgType,
            isActive: true,
            registeredAt: block.timestamp
        });

        _issuerAddresses.push(issuerAddress);

        emit IssuerRegistered(issuerAddress, name, orgType);
    }

    /**
     * @notice Revoke (deactivate) an issuer. They can no longer issue credentials.
     * @param issuerAddress The wallet address to revoke.
     */
    function revokeIssuer(address issuerAddress) external onlyOwner {
        require(_issuers[issuerAddress].isActive, "Issuer not active");

        _issuers[issuerAddress].isActive = false;

        emit IssuerRevoked(issuerAddress);
    }

    /**
     * @notice Reactivate a previously revoked issuer.
     * @param issuerAddress The wallet address to reactivate.
     */
    function reactivateIssuer(address issuerAddress) external onlyOwner {
        require(bytes(_issuers[issuerAddress].name).length > 0, "Issuer not found");
        require(!_issuers[issuerAddress].isActive, "Issuer already active");

        _issuers[issuerAddress].isActive = true;

        emit IssuerReactivated(issuerAddress);
    }

    // ── Public View Functions ────────────────────────────────────

    /**
     * @notice Check if an address is an authorized (active) issuer.
     * @param issuerAddress The address to check.
     * @return True if the address is an active issuer.
     */
    function isAuthorizedIssuer(address issuerAddress) external view returns (bool) {
        return _issuers[issuerAddress].isActive;
    }

    /**
     * @notice Get issuer details.
     * @param issuerAddress The issuer's wallet address.
     * @return name The organization name.
     * @return orgType The organization type.
     * @return isActive Whether the issuer is currently active.
     * @return registeredAt Timestamp of registration.
     */
    function getIssuer(address issuerAddress) external view returns (
        string memory name,
        string memory orgType,
        bool isActive,
        uint256 registeredAt
    ) {
        Issuer memory issuer = _issuers[issuerAddress];
        return (issuer.name, issuer.orgType, issuer.isActive, issuer.registeredAt);
    }

    /**
     * @notice Get the total number of registered issuers (including revoked).
     * @return The count of issuer addresses.
     */
    function getIssuerCount() external view returns (uint256) {
        return _issuerAddresses.length;
    }
}
