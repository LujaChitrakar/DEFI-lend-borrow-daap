// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import {ERC20Burnable, ERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/*
 * @title Decentralized Token
 *@author Luja Chitrakar
 *Collateral:Exogenous (ETH &BTC)
 *Minting : Algorithmic
 *Relative Stability: Pegged to USD
 *
 *This is the contract meant to be governed by DSCEngine. This contract is just ERC20 implementation for token to be provided to lenders.
 *
 */

contract LendingToken is ERC20Burnable, Ownable {
    // errors
    error LendingToken__MustBeMoreThanZero();
    error LendingToken__BurnAmountExceedsBalance();
    error LendingToken__AddressShouldNotBeZero();

    // events
    event tokenBurned(address indexed user, uint256 indexed amount);
    event tokenMinted(address indexed user, uint256 indexed amount);

    constructor() ERC20("DecentralizedToken", "DT") Ownable(msg.sender) {}

    function burn(uint256 _amount) public override onlyOwner {
        uint256 balance = balanceOf(msg.sender);
        if (_amount <= 0) {
            revert LendingToken__MustBeMoreThanZero();
        }
        if (balance < _amount) {
            revert LendingToken__BurnAmountExceedsBalance();
        }
        super.burn(_amount);
        emit tokenBurned(msg.sender, _amount);
    }

    function mint(
        address _to,
        uint256 _amount
    ) external onlyOwner returns (bool) {
        if (_to == address(0)) {
            revert LendingToken__AddressShouldNotBeZero();
        }
        if (_amount <= 0) {
            revert LendingToken__MustBeMoreThanZero();
        }
        _mint(_to, _amount);
        emit tokenMinted(_to, _amount);
        return true;
    }
}
