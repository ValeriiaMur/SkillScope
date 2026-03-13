// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SkillScopeAttestation
 * @notice Stores onchain attestations of AI agent skill quality scores.
 * @dev Deployed on Base. Each attestation records a skill's evaluated
 *      performance metrics so that anyone can verify agent quality.
 */
contract SkillScopeAttestation {
    struct Attestation {
        bytes32 skillFileHash;
        string skillName;
        uint256 score;
        uint256 executionCount;
        uint256 successCount;
        uint256 timestamp;
        string erc8004AgentId;
        address attester;
    }

    uint256 public nextAttestationId;
    mapping(uint256 => Attestation) public attestations;
    mapping(bytes32 => uint256[]) public skillAttestations;
    mapping(address => uint256[]) public attesterAttestations;

    event Attested(
        uint256 indexed attestationId,
        bytes32 indexed skillFileHash,
        string skillName,
        uint256 score,
        address attester,
        uint256 timestamp
    );

    /**
     * @notice Create an onchain attestation for a skill's quality score.
     * @param skillFileHash SHA-256 hash of the skill file content
     * @param skillName Human-readable skill name
     * @param score Quality score (0-100)
     * @param executionCount Number of executions evaluated
     * @param successCount Number of successful executions
     * @param timestamp Unix timestamp of the evaluation
     * @param erc8004AgentId Optional ERC-8004 agent identifier
     * @return attestationId The ID of the newly created attestation
     */
    function attest(
        bytes32 skillFileHash,
        string calldata skillName,
        uint256 score,
        uint256 executionCount,
        uint256 successCount,
        uint256 timestamp,
        string calldata erc8004AgentId
    ) external returns (uint256) {
        require(score <= 100, "Score must be 0-100");
        require(executionCount > 0, "Must have at least 1 execution");
        require(successCount <= executionCount, "Success count exceeds total");
        require(bytes(skillName).length > 0, "Skill name required");

        uint256 attestationId = nextAttestationId++;

        attestations[attestationId] = Attestation({
            skillFileHash: skillFileHash,
            skillName: skillName,
            score: score,
            executionCount: executionCount,
            successCount: successCount,
            timestamp: timestamp,
            erc8004AgentId: erc8004AgentId,
            attester: msg.sender
        });

        skillAttestations[skillFileHash].push(attestationId);
        attesterAttestations[msg.sender].push(attestationId);

        emit Attested(attestationId, skillFileHash, skillName, score, msg.sender, timestamp);

        return attestationId;
    }

    /**
     * @notice Get all attestation IDs for a given skill file hash.
     */
    function getSkillAttestations(bytes32 skillFileHash) external view returns (uint256[] memory) {
        return skillAttestations[skillFileHash];
    }

    /**
     * @notice Get all attestation IDs for a given attester.
     */
    function getAttesterAttestations(address attester) external view returns (uint256[] memory) {
        return attesterAttestations[attester];
    }

    /**
     * @notice Get a single attestation by ID.
     */
    function getAttestation(uint256 attestationId) external view returns (Attestation memory) {
        require(attestationId < nextAttestationId, "Attestation does not exist");
        return attestations[attestationId];
    }
}
