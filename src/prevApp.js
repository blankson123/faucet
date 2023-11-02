import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { loadContract } from "./utils/load-contract";
// import contract from "@truffle/contract";

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    isProviderLoaded: false,
    web3: null,
    contract: null,
  });

  const [account, setAccount] = useState(null);

  const [balance, setBalance] = useState(null);

  const [reload, setReload] = useState(false);

  const canConnectToContract = account && web3Api.contract;

  const reloadEffect = useCallback(() => setReload(!reload), [reload]);

  const setAccountListener = (provider) => {
    provider.on("accountsChanged", (accounts) => setAccount(accounts[0]));
    provider.on("chainChanged", (_) => window.location.reload());
    // NOT RECOMMENDED
    // provider._jsonRpcConnection.event.on("notificatoin", (payload) => {
    //   const {method} = payload;

    //   if(method === 'metamask_unlockStateChanged'){
    //     setAccount(null);
    //   }
    // });
  };

  useEffect(() => {
    const loadProvider = async () => {
      // with metamask we have an access to window.ethereum & to window.web3
      // metamask injects a global API into the web browser
      // this API allows websites to request users, accounts, read data to blockchain,
      // sign messages and transactions

      // console.log(window.web3);
      // console.log(window.ethereum);
      // let provider = null;
      const provider = await detectEthereumProvider();

      if (provider) {
        const contract = await loadContract("Faucet", provider);
        setAccountListener(provider);
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderLoaded: true,
        });
      } else {
        setWeb3Api((api) => ({ ...api, isProviderLoaded: true }));
        console.error("Please intall metamask.");
      }
      // if (window.ethereum) {
      //   provider = window.ethereum;

      //   try {
      //     await provider.request({
      //       method: "eth_requestAccounts",
      //     });
      //   } catch {
      //     console.error("User denied accounts access");
      //   }
      // } else if (window.web3) {
      //   provider = window.web3.currentProvider;
      // } else if (!process.env.production) {
      //   provider = new Web3.providers.HttpProvider("http://localhost:7545");
      // }
    };

    loadProvider();
  }, []);

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      const mBal = web3.utils.fromWei(balance, "ether");
      setBalance(mBal);
    };

    web3Api.contract && loadBalance();
  }, [web3Api, reload]);

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };

    web3Api.web3 && getAccount();
  }, [web3Api.web3]);

  const connectWallet = () => {
    web3Api.provider.request({ method: "eth_requestAccounts" });
  };

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api;
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether"),
    });

    //window.location.refresh();
    reloadEffect();
  }, [web3Api, account, reloadEffect]);

  const withdrawFunds = async () => {
    const { contract, web3 } = web3Api;
    const withdrawAmount = web3.utils.toWei("0.1", "ether");
    await contract.withdraw(withdrawAmount, { from: account });

    reloadEffect();
  };

  return (
    <>
      <div className="faucet-wrapper">
        <div className="faucet">
          {web3Api.isProviderLoaded ? (
            <div className="is-flex is-align-items-center">
              <span className="mr-2">
                <strong>Account: </strong>
              </span>
              <h1>
                {account ? (
                  <div>{account}</div>
                ) : !web3Api.provider ? (
                  <>
                    <div className="notification is-warning is-size-7 is-rounded">
                      Wallet is not detected!
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://docs.metamask.io"
                      >
                        {" "}
                        Install Metamask
                      </a>
                    </div>
                  </>
                ) : (
                  <button className="button is-small" onClick={connectWallet}>
                    Connect Wallet
                  </button>
                )}
              </h1>
            </div>
          ) : (
            <span>Looking for Web3...</span>
          )}
          <div className="balance-view is-size-2 my-5">
            Current Balance: <strong>{balance}</strong> ETH
          </div>
          {!canConnectToContract && (
            <i className="is-block">Connect to Ganache</i>
          )}
          {/* <button
            className="btn mr-2"
            onClick={async () => {
              const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
              });
              console.log(accounts);
            }}
          >
            Enable Ethereum
          </button> */}
          <button
            disabled={!canConnectToContract}
            className="button is-link mr-2"
            onClick={addFunds}
          >
            Donate 1 eth
          </button>
          <button
            disabled={!canConnectToContract}
            className="button is-primary"
            onClick={withdrawFunds}
          >
            Withdraw 0.1 eth
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
