// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DSCEngine is ReentrancyGuard {
    /**ERRORS */
    error DSCEngine__TransferFailed();
    error DSCEngine__NotAllowedToken();
    error DSCEngine__NeedsMoreThanZero();

    /**STATE VARIABLES */
    mapping(address => mapping(address => uint256)) s_stableCoinDeposit;
    mapping(address => address) private s_priceFeed;

    /**EVENTS */
    event StableCoinDeposited(
        address indexed from,
        address indexed token,
        uint256 indexed amount
    );

    /**MODIFIERS */
    modifier isTokenAllowed(address token) {
        if (s_priceFeed[token] == address(0)) {
            revert DSCEngine__NotAllowedToken();
        }
        _;
    }
    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert DSCEngine__NeedsMoreThanZero();
        }
        _;
    }

    function depositStableCoins(
        address tokenAddress,
        uint256 amount
    ) public isTokenAllowed(tokenAddress) moreThanZero(amount) nonReentrant {
        bool success = IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (!success) {
            revert DSCEngine__TransferFailed();
        }
        s_stableCoinDeposit[msg.sender][tokenAddress] += amount;

        emit StableCoinDeposited(msg.sender, tokenAddress, amount);
    }

    /**ADMIN FUNCTIONS */
    function addAllowedToken(address token, address priceFeed) external {
        s_priceFeed[token] = priceFeed;
    }

    /**VIEW FUNCTIONS */
    function getStableCoinBalance(
        address user,
        address token
    ) external view returns (uint256) {
        return s_stableCoinDeposit[user][token];
    }
}
