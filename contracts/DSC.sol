// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeFiLending {
    mapping(address => uint256) public lentAmount;
    mapping(address => uint256) public borrowedAmount;
    mapping(address => uint256) public depositCollateralAmount;

    uint256 public totalLent;
    uint256 public totalCollateral;
    uint256 public totalBorrowed;

    // Lend ETH to the contract
    function lend() external payable {
        require(msg.value > 0, "Must lend more than 0");
        lentAmount[msg.sender] += msg.value;
        totalLent += msg.value;
    }

    // Withdraw previously lent ETH
    function withdraw(uint256 amount) external {
        require(
            lentAmount[msg.sender] >= amount,
            "Not enough balance to withdraw"
        );

        lentAmount[msg.sender] -= amount;
        totalLent -= amount;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdrawal failed");
    }

    // deposit WETH to the contract
    function depositCollateral() external payable {
        require(msg.value > 0, "Must deposit more than 0");
        depositCollateralAmount[msg.sender] += msg.value;
    }
    // deposit WETH to the contract
    function withdrawCollateral(uint256 amount) external payable {
        require(amount > 0, "Must deposit more than 0");
        require(
            depositCollateralAmount[msg.sender] >= amount,
            "No enough collateral"
        );
        depositCollateralAmount[msg.sender] -= amount;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdrawal of collateral failed");
    }

    // Borrow ETH from the contract (from the totalLent pool)
    function borrow(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(
            address(this).balance - totalBorrowed >= amount,
            "Not enough liquidity"
        );
        require(
            depositCollateralAmount[msg.sender] > amount,
            "Not enough collateral"
        );
        borrowedAmount[msg.sender] += amount;
        totalBorrowed += amount;
        depositCollateralAmount[msg.sender] -= amount;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Borrow failed");
    }

    // Repay borrowed ETH
    function repay() external payable {
        require(msg.value > 0, "Repayment must be greater than 0");
        require(
            borrowedAmount[msg.sender] >= msg.value,
            "Repaying more than borrowed"
        );

        borrowedAmount[msg.sender] -= msg.value;
        totalBorrowed -= msg.value;
    }

    // View contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getUserCollateral() external view returns (uint256) {
        return depositCollateralAmount[msg.sender];
    }
    function getLendAmount() external view returns (uint256) {
        return lentAmount[msg.sender];
    }
    function getBorrowAmount() external view returns (uint256) {
        return borrowedAmount[msg.sender];
    }

    function getTotalLent() external view returns (uint256) {
        return totalLent;
    }
    function getTotalBorrowed() external view returns (uint256) {
        return totalBorrowed;
    }
}
