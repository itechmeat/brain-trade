// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ExpertToken
 * @dev ERC-20 token representing access to a specific expert's knowledge
 * 
 * Each expert gets their own token with format bt{NAME} (e.g. btTHIEL, btMUSK)
 * Users buy these tokens to access AI consultations with the expert
 * 
 * Key mechanics:
 * - Initial price: 1 USDT = 1000 expert tokens
 * - Tokens are spent when asking questions
 * - Tokens are returned to pool after AI response
 * - Expert receives revenue share from token usage
 */
contract ExpertToken is ERC20, Ownable {
    // Expert info
    string public expertName;          // Human-readable name (e.g. "Peter Thiel")
    string public expertCategory;      // Category (e.g. "Venture Capital")
    uint256 public consultationCost;   // Cost per consultation in tokens
    address public expertAddress;      // Expert's wallet for revenue
    
    // Platform settings
    address public platformAddress;    // Platform wallet for fees
    uint256 public platformFeePercent = 10;  // 10% platform fee
    
    // Token economics
    uint256 public constant INITIAL_PRICE = 1000;  // 1000 tokens per 1 USDT
    uint256 public totalConsultations;              // Total consultations count
    uint256 public totalRevenue;                    // Total revenue generated
    
    // Events for tracking usage
    event ConsultationStarted(address indexed user, uint256 tokenAmount, uint256 consultationId);
    event ConsultationCompleted(address indexed user, uint256 consultationId);
    event RevenueDistributed(address indexed expert, uint256 expertAmount, uint256 platformAmount);
    
    /**
     * @dev Initialize expert token with basic info
     * @param _name Token name (e.g. "BrainTrade Peter Thiel Token")
     * @param _symbol Token symbol (e.g. "btTHIEL") 
     * @param _expertName Human readable expert name
     * @param _expertCategory Expert category
     * @param _tokensPerQuery Cost per query in expert tokens (from JSON config)
     * @param _expertAddress Expert's wallet address
     * @param _platformAddress Platform's wallet address
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _expertName,
        string memory _expertCategory,
        uint256 _tokensPerQuery,
        address _expertAddress,
        address _platformAddress
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        expertName = _expertName;
        expertCategory = _expertCategory;
        consultationCost = _tokensPerQuery;
        expertAddress = _expertAddress;
        platformAddress = _platformAddress;
        
        // Mint initial supply to contract for sales
        // 1M tokens = 1000 USDT worth at initial price
        _mint(address(this), 1000000 * 10**decimals());
    }
    
    /**
     * @dev Purchase expert tokens with USDT (simplified for hackathon)
     * In production this would integrate with DEX or payment system
     * @param _amount Amount of tokens to purchase
     */
    function purchaseTokens(uint256 _amount) external payable {
        require(_amount > 0, "Amount must be greater than 0");
        require(balanceOf(address(this)) >= _amount, "Not enough tokens available");
        
        // For hackathon: simplified purchase without USDT integration
        // In production: calculate USDT amount and transfer from user
        
        // Transfer tokens from contract to user
        _transfer(address(this), msg.sender, _amount);
    }
    
    /**
     * @dev Start consultation - spend tokens for AI chat access
     * @param _consultationId Unique ID for this consultation session
     * @return success Whether consultation was started successfully
     */
    function startConsultation(uint256 _consultationId) external returns (bool) {
        require(balanceOf(msg.sender) >= consultationCost, "Insufficient token balance");
        
        // Transfer tokens from user back to contract (temporary hold)
        _transfer(msg.sender, address(this), consultationCost);
        
        totalConsultations++;
        
        emit ConsultationStarted(msg.sender, consultationCost, _consultationId);
        return true;
    }
    
    /**
     * @dev Complete consultation and distribute revenue
     * Called by platform after AI response is generated
     * @param _user User who had the consultation
     * @param _consultationId Consultation ID
     */
    function completeConsultation(address _user, uint256 _consultationId) external onlyOwner {
        // Calculate revenue distribution
        uint256 platformFee = (consultationCost * platformFeePercent) / 100;
        uint256 expertRevenue = consultationCost - platformFee;
        
        // Distribute revenue (simplified - tokens instead of USDT for hackathon)
        if (expertRevenue > 0) {
            _transfer(address(this), expertAddress, expertRevenue);
        }
        if (platformFee > 0) {
            _transfer(address(this), platformAddress, platformFee);
        }
        
        totalRevenue += consultationCost;
        
        emit ConsultationCompleted(_user, _consultationId);
        emit RevenueDistributed(expertAddress, expertRevenue, platformFee);
    }
    
    /**
     * @dev Update consultation cost (only expert can change)
     * @param _newCost New cost per consultation in tokens
     */
    function updateConsultationCost(uint256 _newCost) external {
        require(msg.sender == expertAddress || msg.sender == owner(), "Only expert or owner");
        require(_newCost > 0, "Cost must be greater than 0");
        
        consultationCost = _newCost;
    }
    
    /**
     * @dev Get expert token info for frontend
     * @return name_ Expert name
     * @return category_ Expert category  
     * @return cost_ Consultation cost
     * @return consultations_ Total consultations
     * @return revenue_ Total revenue
     */
    function getExpertInfo() external view returns (
        string memory name_,
        string memory category_,
        uint256 cost_,
        uint256 consultations_,
        uint256 revenue_
    ) {
        return (expertName, expertCategory, consultationCost, totalConsultations, totalRevenue);
    }
    
    /**
     * @dev Check if user has enough tokens for consultation
     * @param _user User address to check
     * @return hasEnough Whether user can afford consultation
     */
    function canAffordConsultation(address _user) external view returns (bool) {
        return balanceOf(_user) >= consultationCost;
    }
}
