// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

import "./Types.sol";
// import console.sol;
import "hardhat/console.sol";

contract Ballot {
    // cadiidate list
    Types.Candidate[] public candidates;
    mapping(address => uint256) public votesReceived;
    // voter list
    address[] public voters;
    mapping(address => bool) public voterStatus;
    // total votes
    uint256 public totalVotes;
    // owner of the contract
    address public owner;
    // start time of the voting
    uint256 public startTime;
    // end time of the voting
    uint256 public endTime;

    // event
    event Vote(address indexed voter, uint256 indexed candidateIndex);
    event AddCandidate(uint256 indexed candidateIndex);
    event Reset();

    constructor(uint256 _endTime) {
        owner = msg.sender;
        totalVotes = 0;
        startTime = block.timestamp;
        endTime = block.timestamp + _endTime;
    }

    // is the voting ended?
    function isEnded() public view returns (bool) {
        return block.timestamp > endTime;
    }

    // reset the voting
    function reset(uint256 _endTime) public {
        require(msg.sender == owner, "Only owner can reset the voting");
        for (uint256 i = 0; i < candidates.length; i++) {
            votesReceived[candidates[i].candidateAddress] = 0;
        }
        // reset the candidate array
        delete candidates;
        // reset the voter list
        for (uint256 i = 0; i < voters.length; i++) {
            voterStatus[voters[i]] = false;
        }
        delete voters;
        // reset the total votes
        totalVotes = 0;
        // reset the start time
        startTime = block.timestamp;
        endTime = startTime + _endTime;
        emit Reset();
    }

    // register a candidate
    function registerCandidate(string memory _name) public {
        require(!isEnded(), "Voting is ended");
        candidates.push(Types.Candidate(_name, msg.sender));
        votesReceived[msg.sender] = 0;
        emit AddCandidate(candidates.length - 1);
    }

    // vote for a candidate
    function vote(uint256 candidateIndex) public {
        require(!isEnded(), "Voting is ended");
        require(!voterStatus[msg.sender], "Already voted");
        require(candidateIndex < candidates.length, "Invalid candidate index");
        require(voterStatus[msg.sender] == false, "Already voted");

        votesReceived[candidates[candidateIndex].candidateAddress]++;
        voterStatus[msg.sender] = true;
        voters.push(msg.sender);
        totalVotes++;
        emit Vote(msg.sender, candidateIndex);
    }

    // get the results
    function getResults() public view returns (Types.Results[] memory) {
        Types.Results[] memory results = new Types.Results[](candidates.length);
        for (uint256 i = 0; i < candidates.length; i++) {
            results[i] = Types.Results(
                candidates[i].name,
                votesReceived[candidates[i].candidateAddress],
                candidates[i].candidateAddress
            );
        }
        return results;
    }
}
