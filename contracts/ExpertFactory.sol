// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ExpertToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ExpertFactory
 * @dev Factory contract for creating and managing expert tokens
 * 
 * This contract automatically deploys new ExpertToken contracts for each expert
 * and maintains a registry of all experts on the platform. It reads configuration
 * from the frontend JSON and creates tokens accordingly.
 * 
 * Key functions:
 * - Deploy new expert tokens with proper configuration
 * - Maintain registry of all experts
 * - Provide discovery mechanism for frontend
 * - Handle expert onboarding process
 */
contract ExpertFactory is Ownable {
    // Expert registry
    struct ExpertInfo {
        address tokenAddress;      // Address of expert's ERC-20 token
        string name;              // Human readable name (e.g. "Peter Thiel")
        string symbol;            // Token symbol (e.g. "btTHIEL")
        string category;          // Expert category (e.g. "Venture Capital")
        uint256 tokensPerQuery;   // Cost per consultation in tokens
        address expertAddress;    // Expert's wallet for revenue
        bool isActive;           // Whether expert is active
        uint256 totalConsultations; // Total consultations across all experts
        uint256 totalRevenue;     // Total revenue generated
    }
    
    // State variables
    mapping(string => ExpertInfo) public experts;        // symbol => ExpertInfo
    mapping(address => string) public tokenToSymbol;     // token address => symbol
    string[] public expertSymbols;                       // Array of all expert symbols
    address public platformAddress;                      // Platform wallet for fees
    
    // Events for tracking expert lifecycle
    event ExpertCreated(
        string indexed symbol,
        address indexed tokenAddress,
        address indexed expertAddress,
        string name,
        uint256 tokensPerQuery
    );
    event ExpertUpdated(string indexed symbol, uint256 newTokensPerQuery);
    event ExpertActivated(string indexed symbol);
    event ExpertDeactivated(string indexed symbol);
    
    /**
     * @dev Initialize factory with platform address
     * @param _platformAddress Platform wallet for receiving fees
     */
    constructor(address _platformAddress) Ownable(msg.sender) {
        require(_platformAddress != address(0), "Platform address cannot be zero");
        platformAddress = _platformAddress;
    }
    
    /**
     * @dev Create new expert token from JSON configuration
     * This function is called by backend when new expert is onboarded
     * @param _name Expert name (e.g. "Peter Thiel")
     * @param _symbol Token symbol (e.g. "btTHIEL")
     * @param _category Expert category (e.g. "Venture Capital") 
     * @param _tokensPerQuery Cost per consultation in expert tokens
     * @param _expertAddress Expert's wallet address for revenue
     * @return tokenAddress Address of deployed ExpertToken contract
     */
    function createExpert(
        string memory _name,
        string memory _symbol,
        string memory _category,
        uint256 _tokensPerQuery,
        address _expertAddress
    ) external onlyOwner returns (address) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        require(_tokensPerQuery > 0, "Tokens per query must be greater than 0");
        require(_expertAddress != address(0), "Expert address cannot be zero");
        require(experts[_symbol].tokenAddress == address(0), "Expert already exists");
        
        // Create token name in format "BrainTrade {Expert Name} Token"
        string memory tokenName = string(abi.encodePacked("BrainTrade ", _name, " Token"));
        
        // Deploy new ExpertToken contract
        ExpertToken expertToken = new ExpertToken(
            tokenName,
            _symbol,
            _name,
            _category,
            _tokensPerQuery,
            _expertAddress,
            platformAddress
        );
        
        address tokenAddress = address(expertToken);
        
        // Register expert in our registry
        experts[_symbol] = ExpertInfo({
            tokenAddress: tokenAddress,
            name: _name,
            symbol: _symbol,
            category: _category,
            tokensPerQuery: _tokensPerQuery,
            expertAddress: _expertAddress,
            isActive: true,
            totalConsultations: 0,
            totalRevenue: 0
        });
        
        // Update mappings
        tokenToSymbol[tokenAddress] = _symbol;
        expertSymbols.push(_symbol);
        
        emit ExpertCreated(_symbol, tokenAddress, _expertAddress, _name, _tokensPerQuery);
        
        return tokenAddress;
    }
    
    /**
     * @dev Get all expert information for frontend discovery
     * @return symbols_ Array of expert symbols
     * @return tokenAddresses_ Array of corresponding token addresses
     * @return names_ Array of expert names
     * @return categories_ Array of expert categories
     * @return tokensPerQuery_ Array of consultation costs
     * @return isActive_ Array of activity status
     */
    function getAllExperts() external view returns (
        string[] memory symbols_,
        address[] memory tokenAddresses_,
        string[] memory names_,
        string[] memory categories_,
        uint256[] memory tokensPerQuery_,
        bool[] memory isActive_
    ) {
        uint256 length = expertSymbols.length;
        
        symbols_ = new string[](length);
        tokenAddresses_ = new address[](length);
        names_ = new string[](length);
        categories_ = new string[](length);
        tokensPerQuery_ = new uint256[](length);
        isActive_ = new bool[](length);
        
        for (uint256 i = 0; i < length; i++) {
            string memory symbol = expertSymbols[i];
            ExpertInfo memory expert = experts[symbol];
            
            symbols_[i] = symbol;
            tokenAddresses_[i] = expert.tokenAddress;
            names_[i] = expert.name;
            categories_[i] = expert.category;
            tokensPerQuery_[i] = expert.tokensPerQuery;
            isActive_[i] = expert.isActive;
        }
    }
    
    /**
     * @dev Get specific expert information by symbol
     * @param _symbol Expert symbol (e.g. "btTHIEL")
     * @return expert_ Complete expert information
     */
    function getExpert(string memory _symbol) external view returns (ExpertInfo memory) {
        require(experts[_symbol].tokenAddress != address(0), "Expert does not exist");
        return experts[_symbol];
    }
    
    /**
     * @dev Get expert information by token address
     * @param _tokenAddress Expert token address
     * @return expert_ Complete expert information
     */
    function getExpertByToken(address _tokenAddress) external view returns (ExpertInfo memory) {
        string memory symbol = tokenToSymbol[_tokenAddress];
        require(bytes(symbol).length > 0, "Token not found");
        return experts[symbol];
    }
    
    /**
     * @dev Update expert consultation cost (only expert or owner)
     * @param _symbol Expert symbol
     * @param _newTokensPerQuery New cost per consultation
     */
    function updateExpertCost(string memory _symbol, uint256 _newTokensPerQuery) external {
        require(experts[_symbol].tokenAddress != address(0), "Expert does not exist");
        require(_newTokensPerQuery > 0, "Cost must be greater than 0");
        
        ExpertInfo storage expert = experts[_symbol];
        require(
            msg.sender == expert.expertAddress || msg.sender == owner(),
            "Only expert or owner can update cost"
        );
        
        expert.tokensPerQuery = _newTokensPerQuery;
        
        // Also update the token contract
        ExpertToken(expert.tokenAddress).updateConsultationCost(_newTokensPerQuery);
        
        emit ExpertUpdated(_symbol, _newTokensPerQuery);
    }
    
    /**
     * @dev Activate/deactivate expert (only owner)
     * @param _symbol Expert symbol
     * @param _isActive New activity status
     */
    function setExpertActive(string memory _symbol, bool _isActive) external onlyOwner {
        require(experts[_symbol].tokenAddress != address(0), "Expert does not exist");
        
        experts[_symbol].isActive = _isActive;
        
        if (_isActive) {
            emit ExpertActivated(_symbol);
        } else {
            emit ExpertDeactivated(_symbol);
        }
    }
    
    /**
     * @dev Update platform address (only owner)
     * @param _newPlatformAddress New platform wallet address
     */
    function updatePlatformAddress(address _newPlatformAddress) external onlyOwner {
        require(_newPlatformAddress != address(0), "Platform address cannot be zero");
        platformAddress = _newPlatformAddress;
    }
    
    /**
     * @dev Get total number of experts
     * @return count Total expert count
     */
    function getExpertCount() external view returns (uint256) {
        return expertSymbols.length;
    }
    
    /**
     * @dev Batch create experts from JSON data (for initial setup)
     * @param _names Array of expert names
     * @param _symbols Array of expert symbols  
     * @param _categories Array of expert categories
     * @param _tokensPerQuery Array of consultation costs
     * @param _expertAddresses Array of expert wallet addresses
     */
    function batchCreateExperts(
        string[] memory _names,
        string[] memory _symbols,
        string[] memory _categories,
        uint256[] memory _tokensPerQuery,
        address[] memory _expertAddresses
    ) external onlyOwner {
        require(_names.length == _symbols.length, "Array length mismatch");
        require(_names.length == _categories.length, "Array length mismatch");
        require(_names.length == _tokensPerQuery.length, "Array length mismatch");
        require(_names.length == _expertAddresses.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _names.length; i++) {
            // Skip if expert already exists
            if (experts[_symbols[i]].tokenAddress == address(0)) {
                // Call internal create function
                _createExpertInternal(
                    _names[i],
                    _symbols[i],
                    _categories[i],
                    _tokensPerQuery[i],
                    _expertAddresses[i]
                );
            }
        }
    }
    
    /**
     * @dev Internal function to create expert (shared logic)
     */
    function _createExpertInternal(
        string memory _name,
        string memory _symbol,
        string memory _category,
        uint256 _tokensPerQuery,
        address _expertAddress
    ) internal returns (address) {
        // Create token name in format "BrainTrade {Expert Name} Token"
        string memory tokenName = string(abi.encodePacked("BrainTrade ", _name, " Token"));
        
        // Deploy new ExpertToken contract
        ExpertToken expertToken = new ExpertToken(
            tokenName,
            _symbol,
            _name,
            _category,
            _tokensPerQuery,
            _expertAddress,
            platformAddress
        );
        
        address tokenAddress = address(expertToken);
        
        // Register expert in our registry
        experts[_symbol] = ExpertInfo({
            tokenAddress: tokenAddress,
            name: _name,
            symbol: _symbol,
            category: _category,
            tokensPerQuery: _tokensPerQuery,
            expertAddress: _expertAddress,
            isActive: true,
            totalConsultations: 0,
            totalRevenue: 0
        });
        
        // Update mappings
        tokenToSymbol[tokenAddress] = _symbol;
        expertSymbols.push(_symbol);
        
        emit ExpertCreated(_symbol, tokenAddress, _expertAddress, _name, _tokensPerQuery);
        
        return tokenAddress;
    }
}
