// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateContract is Ownable {
    string public propertyAddress;
    uint256 public propertyPrice;
    address payable public seller;
    address public buyer;
    bool public isSold;

    event PropertyPurchased(address indexed buyer, uint256 price);
    event CheckBalance(string text, uint amount);

    constructor(string memory _address, uint256 _price) {
        propertyAddress = _address;
        propertyPrice = _price;
        seller = payable(msg.sender);
    }

    function purchaseProperty() external payable {
        require(!isSold, "Property is already sold");
        require(msg.sender != seller, "Seller cannot buy their own property");
        require(msg.value == propertyPrice, "Incorrect payment amount");

        seller.transfer(propertyPrice); // Transfer funds to the seller
        buyer = msg.sender;
        isSold = true;

        emit PropertyPurchased(msg.sender, propertyPrice);
    }

    function cancelSale() external onlyOwner {
        require(!isSold, "Property is already sold");
        selfdestruct(payable(owner())); // Return funds to the owner (seller)
    }

    function withdrawFunds() external onlyOwner {
        require(isSold, "Property must be sold to withdraw funds");
        selfdestruct(payable(owner())); // Transfer remaining funds to the owner
    }
    
    function getBalance(address user_account) external returns (uint){
    
       string memory data = "User Balance is : ";
       uint user_bal = user_account.balance;
       emit CheckBalance(data, user_bal );
       return (user_bal);

    }
}
