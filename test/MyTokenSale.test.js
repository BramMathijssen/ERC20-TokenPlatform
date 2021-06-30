const Token = artifacts.require("MyToken");
const TokenSale = artifacts.require("MyTokenSale");
const KycContract = artifacts.require("KycContract");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;
const tokenAmount = process.env.INITIAL_TOKENS;

contract("TokenSale Test", async function (accounts) {

    // manier om accounts netjes te definen, javascript zorgt automatisch dat
    // deployerAccount = account 0, recipient = account 1, anotherAccount =2 ..etc.
    const [deployerAccount, recipient, anotherAccount] = accounts;

    it("should not have any tokens in my deployerAccount", async () => {
        let instance = await Token.deployed();

        return expect(instance.balanceOf.call(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN(0))
    });

    it("all coins should be in the tokensale smart contract", async () => {
        let instance = await Token.deployed();
        let balance = await instance.balanceOf.call(TokenSale.address);
        let totalSupply = await instance.totalSupply.call();
        return expect(balance).to.be.a.bignumber.equal(totalSupply);
    });

    it("should be possible to buy one token by simply sending ether to the smart contract", async () => {
        let tokenInstance = await Token.deployed();
        let tokenSaleInstance = await TokenSale.deployed();
        let balanceBeforeAccount = await tokenInstance.balanceOf.call(recipient);
        await expect(tokenSaleInstance.sendTransaction({ from: recipient, value: web3.utils.toWei("1", "wei") })).to.be.rejected;
        await expect(balanceBeforeAccount).to.be.bignumber.equal(await tokenInstance.balanceOf.call(recipient));

        let kycInstance = await KycContract.deployed();
        await kycInstance.setKycCompleted(recipient);
        await expect(tokenSaleInstance.sendTransaction({ from: recipient, value: web3.utils.toWei("1", "wei") })).to.be.fulfilled;
        return expect(balanceBeforeAccount + 1).to.be.bignumber.equal(await tokenInstance.balanceOf.call(recipient));
    });

});