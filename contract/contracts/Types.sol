// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

library Types {
    struct Candidate {
        string name;
        address candidateAddress;
    }

    struct Results {
        string name;
        uint256 voteCount;
        address candidateAddress;
    }
}
