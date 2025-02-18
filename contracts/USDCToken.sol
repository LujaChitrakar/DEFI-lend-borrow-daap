// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import {ERC20Burnable, ERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/*
 * @title USDC  Token
 *@author Luja Chitrakar
 *Minting : Algorithmic
 *Relative Stability: Pegged to USD
 *
 *This is the contract meant to be governed by DSCEngine. This contract is just ERC20 implementation for token to be provided to lenders.
 *
 */

contract USDCToken is ERC20Burnable, Ownable {
    // errors
    error USDCToken__MustBeMoreThanZero();
    error USDCToken__BurnAmountExceedsBalance();
    error USDCToken__AddressShouldNotBeZero();

    // events
    event tokenBurned(address indexed user, uint256 indexed amount);
    event tokenMinted(address indexed user, uint256 indexed amount);

    constructor() ERC20("USDC Token", "USDC") Ownable(msg.sender) {}

    function burn(uint256 _amount) public override onlyOwner {
        uint256 balance = balanceOf(msg.sender);
        if (_amount <= 0) {
            revert USDCToken__MustBeMoreThanZero();
        }
        if (balance < _amount) {
            revert USDCToken__BurnAmountExceedsBalance();
        }
        super.burn(_amount);
        emit tokenBurned(msg.sender, _amount);
    }

    function mint(
        address _to,
        uint256 _amount
    ) external onlyOwner returns (bool) {
        if (_to == address(0)) {
            revert USDCToken__AddressShouldNotBeZero();
        }
        if (_amount <= 0) {
            revert USDCToken__MustBeMoreThanZero();
        }
        _mint(_to, _amount);
        emit tokenMinted(_to, _amount);
        return true;
    }
}
