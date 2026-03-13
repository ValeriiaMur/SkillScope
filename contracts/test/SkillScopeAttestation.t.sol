// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SkillScopeAttestation.sol";

contract SkillScopeAttestationTest is Test {
    SkillScopeAttestation public attestation;
    address public attester = address(0x1234);

    function setUp() public {
        attestation = new SkillScopeAttestation();
    }

    function test_attest() public {
        vm.prank(attester);
        uint256 id = attestation.attest(
            bytes32(uint256(0xabcdef)),
            "code-review",
            85,
            100,
            90,
            block.timestamp,
            ""
        );

        assertEq(id, 0);
        assertEq(attestation.nextAttestationId(), 1);

        SkillScopeAttestation.Attestation memory att = attestation.getAttestation(0);
        assertEq(att.skillName, "code-review");
        assertEq(att.score, 85);
        assertEq(att.executionCount, 100);
        assertEq(att.successCount, 90);
        assertEq(att.attester, attester);
    }

    function test_attest_with_erc8004() public {
        vm.prank(attester);
        uint256 id = attestation.attest(
            bytes32(uint256(0xdeadbeef)),
            "summarizer",
            92,
            50,
            48,
            block.timestamp,
            "agent-0x5678"
        );

        SkillScopeAttestation.Attestation memory att = attestation.getAttestation(id);
        assertEq(att.erc8004AgentId, "agent-0x5678");
    }

    function test_revert_score_over_100() public {
        vm.expectRevert("Score must be 0-100");
        attestation.attest(bytes32(0), "test", 101, 1, 1, block.timestamp, "");
    }

    function test_revert_zero_executions() public {
        vm.expectRevert("Must have at least 1 execution");
        attestation.attest(bytes32(0), "test", 80, 0, 0, block.timestamp, "");
    }

    function test_revert_success_exceeds_total() public {
        vm.expectRevert("Success count exceeds total");
        attestation.attest(bytes32(0), "test", 80, 5, 10, block.timestamp, "");
    }

    function test_revert_empty_name() public {
        vm.expectRevert("Skill name required");
        attestation.attest(bytes32(0), "", 80, 5, 3, block.timestamp, "");
    }

    function test_skill_attestations_lookup() public {
        bytes32 hash = bytes32(uint256(0x1111));
        attestation.attest(hash, "skill-a", 70, 10, 8, block.timestamp, "");
        attestation.attest(hash, "skill-a", 80, 20, 18, block.timestamp, "");

        uint256[] memory ids = attestation.getSkillAttestations(hash);
        assertEq(ids.length, 2);
        assertEq(ids[0], 0);
        assertEq(ids[1], 1);
    }

    function test_attester_lookup() public {
        vm.startPrank(attester);
        attestation.attest(bytes32(uint256(1)), "s1", 50, 5, 3, block.timestamp, "");
        attestation.attest(bytes32(uint256(2)), "s2", 60, 10, 8, block.timestamp, "");
        vm.stopPrank();

        uint256[] memory ids = attestation.getAttesterAttestations(attester);
        assertEq(ids.length, 2);
    }
}
