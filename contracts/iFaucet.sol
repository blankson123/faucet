pragma solidity >=0.4.22 <0.9.0;

// they cannot inherit from other smart contracts
// they can only inherit from other interfaces
// interfaces cannot declare a constructor
// they cannot declare state variables

interface IFaucet {
    // all interface function has to be external
    function addFunds() external payable;
    function withdraw(uint withdrawAmount) external;
}