pragma solidity >=0.4.22 <0.9.0;

import './Owned.sol';
import './Logger.sol';
import './IFaucet.sol';

contract Faucet is Owned, Logger, IFaucet{

    // address is a special type that holds the value of your address
    // address[] public funders;
    uint public numOfFunders;

    mapping(address => bool) private funders;
    mapping(uint => address) private lutFunders;

    modifier limitWithdraw(uint withdrawAmount){
        require(
            withdrawAmount <= 100000000000000000,
            'Cannot withdraw more than 0.1 ether' 
        );
        _;
    }

    function emitLog() public override pure returns(bytes32){
        return "Hello world";
    }


    // sometimes we want a function to be only called by the administrator's address
    function test1() external onlyOwner{
        // some 
    }

    // private -> can be accessible only within the smart contract
    // internal -> can be accessible within the smart contract and also derived contract
    

    // this is a special function 
    // it's called when you make a tx that doesn't specify
    // function name to call

    // external functions are part of the contract interface
    // which means they can be called via contracts and other txs
    receive() external payable{

    }

    function addFunds() external payable override{
        // uint index = numOfFunders++;
        // funders[index] = msg.sender;
        address funder = msg.sender;
        if(!funders[funder]){
            uint index = numOfFunders++;
           funders[funder] = true;
           lutFunders[index] = funder;
        }
    }
    // when you mark a function external, you cannot call the function inside your smart contract
    // if public is used, then it can be called both inside and outside the smart contract 
    // We can use the this keyword to access external functions inside our smart contract
    // however this can cause higher gas consumption

    function withdraw(uint withdrawAmount) override external limitWithdraw(withdrawAmount){     
        payable(msg.sender).transfer(withdrawAmount);
    }

    function getAllFunders() external view returns (address[] memory){
        address[] memory _funders = new address[](numOfFunders);
        for(uint i = 0; i < numOfFunders; i++){
            _funders[i] = lutFunders[i];
        }

        return _funders;
    }

    function getFunderAtIndex(uint8 index) external view returns(address){
        return lutFunders[index];
    }

    // function justTesting() external pure returns(uint){
    //     return 2 + 2;
    // }

    // pure, view - readonly call, no gas fee
    // view - it indicates that the function will not alter the storage state in any way
    // pure - even more strict, indicating that it won't even read the storage state

    // Transactions (can generate state changes) and require gas fee

    // to talk to the node on the network, you can make JSON-RPC http calls
}

// const instance = await Faucet.deployed();

// Block info
// Nonce - a hash that when combined with the minHash proofs that
// the block has gone through proof of work (POW)
// 8 bytes => 64 bits


// const instance = await Faucet.deployed();
// instance.addFunds({from: accounts[0], value: '2000000000000000000'});
// instance.addFunds({from: accounts[1], value: '2000000000000000000'});
// instance.getFunderAtIndex(0);
// instance.getAllFunders();
// instance.withdraw("10000000000000000", {from: accounts[1]})