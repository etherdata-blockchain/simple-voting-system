import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Ballot", function () {
  it("should be able to vote", async function () {
    const [owner, voter1, voter2, candidate1, candidate2] =
      await ethers.getSigners();
    const Ballot = await ethers.getContractFactory("Ballot");
    const ballot = await Ballot.deploy(3000);
    await ballot.deployed();

    // register candidates
    await ballot.connect(candidate1).registerCandidate("candidate1");
    await ballot.connect(candidate2).registerCandidate("candidate2");

    await ballot.connect(voter1).vote(0);
    await ballot.connect(voter2).vote(1);

    const results = await ballot.getResults();
    expect(results).to.have.length(2);
    expect(results[0].candidateAddress).to.equal(candidate1.address);
    expect(results[0].voteCount).to.equal(1);
    expect(results[1].candidateAddress).to.equal(candidate2.address);
    expect(results[1].voteCount).to.equal(1);

    await ballot.connect(owner).reset(3000);
    expect(await ballot.getResults()).to.have.length(0);

    await ballot.connect(candidate1).registerCandidate("candidate1");
    await ballot.connect(voter1).vote(0);
  });

  it("Should not be able to register when voting is ended", async function () {
    const [owner, voter1, voter2, candidate1, candidate2] =
      await ethers.getSigners();
    const Ballot = await ethers.getContractFactory("Ballot");
    const ballot = await Ballot.deploy(3000);
    await ballot.deployed();

    await time.increase(4000);

    await expect(
      ballot.connect(voter1).registerCandidate("alice")
    ).to.be.revertedWith("Voting is ended");
  });

  it("Should not be able to vote when voting is ended", async function () {
    const [owner, voter1, voter2, candidate1, candidate2] =
      await ethers.getSigners();
    const Ballot = await ethers.getContractFactory("Ballot");
    const ballot = await Ballot.deploy(3000);
    await ballot.deployed();

    await ballot.connect(candidate1).registerCandidate("candidate1");

    await time.increase(4000);

    await expect(ballot.connect(voter1).vote(0)).to.be.revertedWith(
      "Voting is ended"
    );
  });
});
