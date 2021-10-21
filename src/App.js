import * as React from "react";
// import { ethers } from "ethers";
import './App.css';

export default function App() {

  const wave = () => {

  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="Wave Emoji">👋</span> Hey there!
        </div>

        <div className="bio">
          <p>I am R'veen and I'm a frontend developer!</p>
          <p>Connect your Ethereum wallet and wave at me!</p>
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
      </div>
    </div>
  );
}
