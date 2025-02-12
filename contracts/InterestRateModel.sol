// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/access/Ownable.sol";

contract InterestRateModel {
    /**STATE VARIABLES */
    uint256 public constant SECONDS_IN_YEAR = 365 * 24 * 60 * 60;
    uint256 public constant RATE_PRECISION = 1e4;

    mapping(address => uint256) public lendingRates;
    mapping(address => uint256) public borrowingRates;
    mapping(address => mapping(address => uint256))
        public lastInterestTimestamp;

    /** FUNCTIONS **/

    /**
     * @notice Sets the fixed interest rate for a token.
     * @param tokenAddress Address of the token (e.g., USDT, USDC).
     * @param rate Interest rate in basis points (e.g., 5% = 500).
     */

    function setLendingInterestRate(
        address tokenAddress,
        uint256 rate
    ) external {
        require(rate < RATE_PRECISION, "Invalid Rate");
        lendingRates[tokenAddress] = rate;
        // emit InterestRateSet(token, rate);
    }

    /**
     * @notice Sets the fixed borrowing interest rate for a token.
     * @param tokenAddress Address of the token (e.g., USDT, USDC).
     * @param rate Borrowing interest rate in basis points (e.g., 7% = 700).
     */
    function setBorrowingRate(address tokenAddress, uint256 rate) external {
        require(rate < RATE_PRECISION, "Invalid Rate");
        borrowingRates[tokenAddress] = rate;
    }

    /**
     * @notice Calculates accrued interest since the last calculation.
     * @param user Address of the borrower or lender.
     * @param tokenAddress Address of the token.
     * @param principal Amount borrowed or lent.
     * @param isLending Boolean to determine whether interest is for lending or borrowing.
     * @return interestAccrued The total interest accrued.
     */
    function calculateAccuredInterest(
        address user,
        address tokenAddress,
        uint256 principal,
        bool isLending
    ) external returns (uint256) {
        uint256 lastTimestamp = lastInterestTimestamp[user][tokenAddress];
        require(lastTimestamp > 0, "No prevvious timestamp");
        uint256 timeElapsed = block.timestamp - lastTimestamp;
        uint256 rate = isLending
            ? lendingRates[tokenAddress]
            : borrowingRates[tokenAddress];
        uint256 interestAccured = (principal * rate * timeElapsed) /
            (RATE_PRECISION * SECONDS_IN_YEAR);
        lastInterestTimestamp[user][tokenAddress] = block.timestamp;
        return interestAccured;
    }

    /**
     * @notice Starts interest tracking for a user.
     * @param user Address of the borrower or lender.
     * @param tokenAddress Address of the token.
     */

    function startInterestTracking(
        address user,
        address tokenAddress
    ) external {
        lastInterestTimestamp[user][tokenAddress] = block.timestamp;
    }

    /**VIEW FUNCTIONS */
    function getLendingRate(
        address tokenAddress
    ) external view returns (uint256) {
        return lendingRates[tokenAddress];
    }

    function getBorrowingRate(
        address tokenAddress
    ) external view returns (uint256) {
        return borrowingRates[tokenAddress];
    }

    function getLastInterestTimeStamp(
        address user,
        address tokenAddress
    ) external view returns (uint256) {
        return lastInterestTimestamp[user][tokenAddress];
    }
}
