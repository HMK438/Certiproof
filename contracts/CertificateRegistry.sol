// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title CertificateRegistry
/// @author Muhammad Ansar (CertiProof — Web3 Academic Credential Platform)
/// @notice Anchors a tamper-evident proof of academic/professional credentials on-chain.
/// @dev Only a keccak256 hash of the credential's canonical fields is stored on-chain —
///      never the underlying personal data. This keeps gas cost low and avoids putting
///      student PII on a public, permanent ledger. See lib/certificateHash.ts for the
///      exact canonicalization scheme the frontend uses to derive `certHash`.
contract CertificateRegistry {
    struct Certificate {
        address issuer;
        uint64 issuedAt;
        bool revoked;
        uint64 revokedAt;
    }

    address public owner;
    mapping(address => bool) public isIssuer;
    mapping(bytes32 => Certificate) private certificates;

    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);
    event CertificateIssued(bytes32 indexed certHash, address indexed issuer, uint64 issuedAt);
    event CertificateRevoked(bytes32 indexed certHash, address indexed revokedBy, uint64 revokedAt);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error NotAuthorizedIssuer();
    error CertificateAlreadyExists();
    error CertificateDoesNotExist();
    error CertificateAlreadyRevoked();
    error NotOriginalIssuerOrOwner();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyIssuer() {
        if (!isIssuer[msg.sender]) revert NotAuthorizedIssuer();
        _;
    }

    constructor() {
        owner = msg.sender;
        isIssuer[msg.sender] = true;
        emit IssuerAdded(msg.sender);
    }

    /// @notice Authorizes a new address (e.g. a university registrar's wallet) to issue certificates.
    function addIssuer(address account) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        isIssuer[account] = true;
        emit IssuerAdded(account);
    }

    /// @notice Revokes issuing authority from an address. Does not affect certificates already issued.
    function removeIssuer(address account) external onlyOwner {
        isIssuer[account] = false;
        emit IssuerRemoved(account);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address previous = owner;
        owner = newOwner;
        emit OwnershipTransferred(previous, newOwner);
    }

    /// @notice Anchors a new certificate hash on-chain. Reverts if this exact hash was already issued.
    function issueCertificate(bytes32 certHash) external onlyIssuer {
        if (certificates[certHash].issuer != address(0)) revert CertificateAlreadyExists();
        certificates[certHash] = Certificate({
            issuer: msg.sender,
            issuedAt: uint64(block.timestamp),
            revoked: false,
            revokedAt: 0
        });
        emit CertificateIssued(certHash, msg.sender, uint64(block.timestamp));
    }

    /// @notice Revokes a previously issued certificate. Callable by the original issuer or the contract owner.
    function revokeCertificate(bytes32 certHash) external {
        Certificate storage cert = certificates[certHash];
        if (cert.issuer == address(0)) revert CertificateDoesNotExist();
        if (cert.revoked) revert CertificateAlreadyRevoked();
        if (msg.sender != cert.issuer && msg.sender != owner) revert NotOriginalIssuerOrOwner();
        cert.revoked = true;
        cert.revokedAt = uint64(block.timestamp);
        emit CertificateRevoked(certHash, msg.sender, uint64(block.timestamp));
    }

    /// @notice Public, permissionless lookup — anyone can verify a certificate hash without gas cost (view call).
    function verifyCertificate(bytes32 certHash)
        external
        view
        returns (bool exists, address issuer, uint64 issuedAt, bool revoked, uint64 revokedAt)
    {
        Certificate memory cert = certificates[certHash];
        exists = cert.issuer != address(0);
        issuer = cert.issuer;
        issuedAt = cert.issuedAt;
        revoked = cert.revoked;
        revokedAt = cert.revokedAt;
    }
}
