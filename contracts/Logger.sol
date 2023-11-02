pragma solidity >=0.4.22 <0.9.0;

// it's a way for developer to say that 
// any child of the abstract contract 
// has to implement specified method

abstract contract Logger{

    uint public num;

    constructor() {
        num = 100;
    }

    function emitLog() public pure virtual returns(bytes32);

    function test3() external pure returns(uint){
        return 100;
    }
}