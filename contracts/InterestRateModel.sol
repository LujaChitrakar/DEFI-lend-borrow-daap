// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/access/Ownable.sol";

contract InterestRateModel is Ownable {
    /**ERRORS */
    error InterestRateModel__InvalidRate();

    /**STATE VARIABLES */
    uint256 public constant SECONDS_IN_YEAR = 365 * 24 * 60 * 60;
    uint256 public constant RATE_PRECISION = 1e4;
    uint256 private constant LENDER_INTEREST_RATE = 500;
    uint256 private constant BORROWER_INTEREST_RATE = 700;

    mapping(address => uint256) public s_accuredInterest;
    mapping(address => uint256) public s_lastInterestTimestamp;

    /**EVENTS */
    event InterestAccured(address indexed user, uint256 interestAmount);

    constructor() Ownable(msg.sender) {}

    /** FUNCTIONS **/

    /**
     * @notice Calculates accrued interest since the last calculation.
     * @param user Address of the borrower or lender.
     * @param principal Amount borrowed or lent.
     * @param isLending Boolean to determine whether interest is for lending or borrowing.
     * @return interestAccrued The total interest accrued.
     */
    function _calculateInterest(
        address user,
        uint256 principal,
        bool isLending
    ) internal view returns (uint256) {
        uint256 lastTimestamp = s_lastInterestTimestamp[user];
        // require(lastTimestamp > 0, "No prevvious timestamp");

        uint256 timeElapsed = block.timestamp - lastTimestamp;
        uint256 rate = isLending
            ? LENDER_INTEREST_RATE
            : BORROWER_INTEREST_RATE;

        return
            (principal * rate * timeElapsed) /
            (RATE_PRECISION * SECONDS_IN_YEAR);
    }

    /**
     * @notice accures interest
     * @param user Address of the borrower or lender.
     * @param principal Amount borrowed or lent.
     * @param isLending Boolean to determine whether interest is for lending or borrowing
     */
    function accureInterest(
        address user,
        uint256 principal,
        bool isLending
    ) public {
        require(principal > 0, "Principal must be greater than zero");
        uint256 interest = _calculateInterest(user, principal, isLending);
        s_accuredInterest[user] += interest;
        s_lastInterestTimestamp[user] = block.timestamp;
        emit InterestAccured(user, interest);
    }

    /**
     * @notice Reset interest after withdraw or repayment
     * @param user Address of the borrower or lender.
     */

    function resetInterest(address user) public {
        s_accuredInterest[user] = 0;
    }

    function testSetInitialTimestamp(address user) external {
        s_lastInterestTimestamp[user] = block.timestamp;
    }

    function callStatic_calculateInterest(
        address user,
        uint256 principal,
        bool isLending
    ) external view returns (uint256) {
        return _calculateInterest(user, principal, isLending);
    }
    /**VIEW FUNCTIONS */

    function getLastInterestTimeStamp(
        address user
    ) external view returns (uint256) {
        return s_lastInterestTimestamp[user];
    }

    function getAccuredInterest(address user) external view returns (uint256) {
        return s_accuredInterest[user];
    }
}
