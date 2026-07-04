// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SkillCredential
 * @notice Soulbound Token (SBT) contract for issuing non-transferable credentials.
 * @dev Extends ERC721 but overrides transfer functions to make tokens non-transferable.
 *      Only authorized issuers (verified via IssuerRegistry) can mint.
 *      Token URI points to IPFS metadata (via Pinata).
 */

// Interface for the IssuerRegistry contract
interface IIssuerRegistry {
    function isAuthorizedIssuer(address issuerAddress) external view returns (bool);
}

contract SkillCredential is ERC721, ERC721URIStorage, Ownable {

    // ── Structs ──────────────────────────────────────────────────
    struct CredentialData {
        address issuer;             // Wallet of the issuer who minted this
        address student;            // Wallet of the student who owns this
        string  credentialType;     // "hackathon", "certification", "internship", "project"
        string  contentHash;        // SHA-256 hash of the credential JSON
        string  ipfsCID;            // IPFS Content Identifier for full metadata
        uint256 issuedAt;           // Block timestamp when issued
        bool    revoked;            // Whether the credential has been revoked
    }

    // ── State ────────────────────────────────────────────────────
    uint256 private _nextTokenId;
    IIssuerRegistry public issuerRegistry;

    // tokenId → credential data
    mapping(uint256 => CredentialData) private _credentials;

    // student address → list of token IDs
    mapping(address => uint256[]) private _studentCredentials;

    // issuer address → list of token IDs they've issued
    mapping(address => uint256[]) private _issuerCredentials;

    // ── Events ───────────────────────────────────────────────────
    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed issuer,
        address indexed student,
        string credentialType,
        string contentHash,
        string ipfsCID
    );

    event CredentialRevoked(uint256 indexed tokenId, address indexed issuer);

    // ── Constructor ──────────────────────────────────────────────
    constructor(
        address _issuerRegistryAddress
    ) ERC721("SkillCredential", "SKILL") Ownable(msg.sender) {
        issuerRegistry = IIssuerRegistry(_issuerRegistryAddress);
        _nextTokenId = 1; // Start token IDs at 1
    }

    // ── Core Functions ───────────────────────────────────────────

    /**
     * @notice Issue a new Soulbound credential to a student.
     * @dev Only callable by authorized issuers registered in IssuerRegistry.
     * @param student The student's wallet address.
     * @param credentialType One of: "hackathon", "certification", "internship", "project"
     * @param contentHash SHA-256 hash of the credential JSON payload.
     * @param ipfsCID IPFS Content Identifier where full metadata is stored.
     * @param metadataURI Full IPFS URI for the token metadata (e.g., "ipfs://Qm...").
     * @return tokenId The ID of the newly minted SBT.
     */
    function issueCredential(
        address student,
        string calldata credentialType,
        string calldata contentHash,
        string calldata ipfsCID,
        string calldata metadataURI
    ) external returns (uint256) {
        require(student != address(0), "Invalid student address");
        require(bytes(credentialType).length > 0, "Credential type required");
        require(bytes(contentHash).length > 0, "Content hash required");
        require(bytes(ipfsCID).length > 0, "IPFS CID required");
        require(
            issuerRegistry.isAuthorizedIssuer(msg.sender),
            "Caller is not an authorized issuer"
        );

        uint256 tokenId = _nextTokenId++;

        // Mint the SBT to the student
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Store credential data on-chain
        _credentials[tokenId] = CredentialData({
            issuer: msg.sender,
            student: student,
            credentialType: credentialType,
            contentHash: contentHash,
            ipfsCID: ipfsCID,
            issuedAt: block.timestamp,
            revoked: false
        });

        _studentCredentials[student].push(tokenId);
        _issuerCredentials[msg.sender].push(tokenId);

        emit CredentialIssued(tokenId, msg.sender, student, credentialType, contentHash, ipfsCID);

        return tokenId;
    }

    /**
     * @notice Revoke a credential. Only the original issuer can revoke.
     * @param tokenId The token ID to revoke.
     */
    function revokeCredential(uint256 tokenId) external {
        require(_credentials[tokenId].issuer == msg.sender, "Only the issuer can revoke");
        require(!_credentials[tokenId].revoked, "Already revoked");

        _credentials[tokenId].revoked = true;

        emit CredentialRevoked(tokenId, msg.sender);
    }

    // ── View Functions ───────────────────────────────────────────

    /**
     * @notice Get full credential data for a token ID.
     * @param tokenId The SBT token ID.
     */
    function getCredential(uint256 tokenId) external view returns (CredentialData memory) {
        require(tokenId > 0 && tokenId < _nextTokenId, "Token does not exist");
        return _credentials[tokenId];
    }

    /**
     * @notice Get all token IDs owned by a student.
     * @param student The student's wallet address.
     */
    function getStudentCredentials(address student) external view returns (uint256[] memory) {
        return _studentCredentials[student];
    }

    /**
     * @notice Get all token IDs issued by an issuer.
     * @param issuer The issuer's wallet address.
     */
    function getIssuerCredentials(address issuer) external view returns (uint256[] memory) {
        return _issuerCredentials[issuer];
    }

    /**
     * @notice Check if a credential is revoked.
     * @param tokenId The token ID to check.
     */
    function isRevoked(uint256 tokenId) external view returns (bool) {
        return _credentials[tokenId].revoked;
    }

    /**
     * @notice Get the total number of credentials issued.
     */
    function totalCredentials() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // ── Soulbound: Disable Transfers ─────────────────────────────
    // Override _update to prevent all transfers except minting (from = address(0))
    // and burning. This makes the token non-transferable (Soulbound).

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0)) and burning (to == address(0))
        // Block all other transfers
        if (from != address(0) && to != address(0)) {
            revert("SkillCredential: Soulbound tokens cannot be transferred");
        }

        return super._update(to, tokenId, auth);
    }

    // ── Required Overrides ───────────────────────────────────────

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
