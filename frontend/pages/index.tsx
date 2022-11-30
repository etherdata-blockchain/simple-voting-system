import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import abi from "../src/abi.json";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../src/config";
import dayjs from "dayjs";

interface CandidateResult {
  name: string;
  candidateAddress: string;
  voteCount: number;
}

export default function Home() {
  const [address, setAddress] = useState();
  const [candidateResults, setCandidateResults] = useState<CandidateResult[]>(
    []
  );
  const [endTime, setEndTime] = useState<string>();
  const [loading, setLoading] = useState(false);

  const connectToTheMetaMask = useCallback(async () => {
    // check if the browser has MetaMask installed
    if (!(window as any).ethereum) {
      alert("Please install MetaMask first.");
      return;
    }
    // get the user's account address
    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });
    setAddress(accounts[0]);
  }, []);

  const signer = useMemo(() => {
    if (!address) return null;
    return new ethers.providers.Web3Provider(
      (window as any).ethereum
    ).getSigner();
  }, [address]);

  const provider = useMemo(() => {
    // only connect to the contract if the user has MetaMask installed
    if (typeof window === "undefined") return null;
    return new ethers.providers.Web3Provider((window as any).ethereum);
  }, []);

  // function will be called whenever the address changed
  useEffect(() => {
    if (provider) {
      (async () => {
        // get latest candidate names
        const ballotContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          abi,
          provider
        );

        // get the list of candidates
        const results = await ballotContract.getResults();
        const endTime = ethers.utils.formatUnits(
          await ballotContract.endTime(),
          0
        );
        setEndTime(dayjs.unix(parseInt(endTime)).format("YYYY-MM-DD HH:mm:ss"));
        setCandidateResults(results);
      })();
    }
  }, [provider, loading]);

  const registerAsCandidate = useCallback(async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const ballotContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      // show a pop-up to the user to confirm the transaction
      const name = prompt("Please enter your name");
      if (!name) return;
      const tx = await ballotContract.registerCandidate(name);
      // wait for the transaction to be mined
      await tx.wait();
    } catch (e) {
      // show any error using the alert box
      alert(`Error: ${e}`);
    }
    setLoading(false);
  }, [signer]);

  const vote = useCallback(
    async (index: number) => {
      if (!signer) return;
      setLoading(true);
      try {
        const ballotContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          abi,
          signer
        );
        const tx = await ballotContract.vote(index);
        await tx.wait();
      } catch (e) {
        console.error(e, index);
        window.alert(`${e}`);
      }
      setLoading(false);
    },
    [signer]
  );

  const reset = useCallback(async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const ballotContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const endTime = prompt("Please enter the end time in hours");
      if (endTime) {
        const parsedEndTime = parseInt(endTime);
        const tx = await ballotContract.reset(parsedEndTime * 3600);
        await tx.wait();
      }
    } catch (e) {
      window.alert(`${e}`);
    }
    setLoading(false);
  }, [signer]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Simple Voting System</h1>
      {loading && <h1>Loading...</h1>}
      {/* Connect to metamask button */}
      <div>
        <label style={{ paddingRight: 10 }}>Address: </label>
        {!address ? (
          <button onClick={connectToTheMetaMask}>Connect to the website</button>
        ) : (
          <span>{address}</span>
        )}
      </div>
      {/* End time */}
      <div>
        <label style={{ paddingRight: 10 }}>End time: {endTime}</label>
      </div>

      {/** Table for all candidates */}
      <table style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Candidate Name</th>
            <th>Candidate Address</th>
            <th>Vote Count</th>
            <th>Vote</th>
          </tr>
        </thead>
        <tbody>
          {candidateResults.map((candidateResult, index) => (
            <tr key={candidateResult.candidateAddress}>
              <td>{candidateResult.name}</td>
              <td>{candidateResult.candidateAddress}</td>
              <td>{ethers.utils.formatUnits(candidateResult.voteCount, 0)}</td>
              <td>
                <button disabled={!address} onClick={() => vote(index)}>
                  Vote
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 20 }}>
        <button disabled={!address} onClick={registerAsCandidate}>
          Register as a candidate
        </button>
        <button disabled={!address} onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
