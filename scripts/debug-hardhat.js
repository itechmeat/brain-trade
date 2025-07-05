import hre from "hardhat";

console.log('Hardhat runtime environment:', Object.keys(hre));
console.log('hre.ethers:', hre.ethers);
console.log('hre.ethers keys:', hre.ethers ? Object.keys(hre.ethers) : 'undefined');