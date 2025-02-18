// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import {ERC20Burnable, ERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/*
 * @title USDT Token
 *@author Luja Chitrakar
 *Minting : Algorithmic
 *Relative Stability: Pegged to USD
 *This is the contract meant to be governed by DSCEngine. This contract is just ERC20 implementation for token to be provided to lenders.
 *
 */

contract USDTToken is ERC20Burnable, Ownable {
    // errors
    error USDTToken__MustBeMoreThanZero();
    error USDTToken__BurnAmountExceedsBalance();
    error USDTToken__AddressShouldNotBeZero();

    // events
    event tokenBurned(address indexed user, uint256 indexed amount);
    event tokenMinted(address indexed user, uint256 indexed amount);

    constructor() ERC20("USDT Token", "USDT") Ownable(msg.sender) {}

    function burn(uint256 _amount) public override onlyOwner {
        uint256 balance = balanceOf(msg.sender);
        if (_amount <= 0) {
            revert USDTToken__MustBeMoreThanZero();
        }
        if (balance < _amount) {
            revert USDTToken__BurnAmountExceedsBalance();
        }
        super.burn(_amount);
        emit tokenBurned(msg.sender, _amount);
    }

    function mint(
        address _to,
        uint256 _amount
    ) external onlyOwner returns (bool) {
        if (_to == address(0)) {
            revert USDTToken__AddressShouldNotBeZero();
        }
        if (_amount <= 0) {
            revert USDTToken__MustBeMoreThanZero();
        }
        _mint(_to, _amount);
        emit tokenMinted(_to, _amount);
        return true;
    }
}
