import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {

  // State variable we use to store our user's public wallet.
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingWaves, setLoadingWaves] = useState(false);
  const [loadingWave, setLoadingWave] = useState(false);
  const contractAddress = "0xeFA935d80408bcf1aB818f3F193Dc8a5dd0fFBFF";
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        setLoadingWaves(true)
        const waves = await wavePortalContract.getAllWaves();
        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        setAllWaves(wavesCleaned);
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
        setLoadingWaves(false)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
      setLoadingWaves(false)
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      // Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves()
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Connect metamask wallet (like login)
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      getAllWaves()
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async (inputMessage) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        setLoadingWave(true)
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(inputMessage, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        // getAllWaves();
        setLoadingWave(false);
      } else {
        console.log("Ethereum object doesn't exist!");
        setLoadingWave(false);
      }
    } catch (error) {
      console.log(error)
      if (error?.error?.code === -32603) {
        alert("Need to wait 30 seconds")
      }

      if (error?.code === 4001) {
        alert("Transaction rejected")
      }
      setLoadingWave(false);
    }
  }

  const handleChange = (e) => {
    setInputMessage(e.target.value)
  }

  //This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="Wave Emoji">👋</span> Hey there!
        </div>

        <div className="bio">
          <p>I am R'veen and I'm a frontend developer. This is my first web3 project and I hope this thing works.</p>
          <p>Connect your Ethereum wallet and wave at me!</p>
        </div>

        <input className="waveInput" type="text" value={inputMessage} onChange={handleChange} />
        <button className="waveButton" onClick={() => wave(inputMessage)} disabled={loadingWave}>
          {loadingWave ? 'Loading...' : 'Wave at Me'}
        </button>
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {!loadingWaves && allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px", borderRadius: "5px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toLocaleString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
        {loadingWaves && <p>Loading...</p>}
      </div>
    </div>
  );
}
