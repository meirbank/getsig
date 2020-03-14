const ethUtils = require('ethereumjs-util')
const sigUtils = require('eth-sig-util')

module.exports = {
  getSig: function ({
    privateKey,
    spender,
    orderId,
    expiration,

    token1,
    amount1,
    token2,
    amount2
  }) {
    const orderData = Buffer.concat([
      ethUtils.toBuffer(orderId),
      ethUtils.toBuffer(token2),
      ethUtils.setLengthLeft(amount2, 32)
    ])
    const orderDataHash = ethUtils.keccak256(orderData)
    return this.getTransferSig({
      privateKey: privateKey,
      spender: spender,
      data: orderDataHash,
      tokenIdOrAmount: amount1,
      tokenAddress: token1,
      expiration: expiration
    })
  },

  getTransferSig: function(
    privateKey,
    spender,
    data,
    tokenAddress,
    tokenIdOrAmount,
    expiration
  ) {
    console.log("PRIV KEY", privateKey)
    const typedData = this.getTransferTypedData({
      tokenAddress,
      tokenIdOrAmount,
      spender,
      data,
      expiration
    })
    const sig = sigUtils.signTypedData(ethUtils.toBuffer(privateKey), {
      data: typedData
    })
    return {
      sig,
      tokenAddress,
      tokenIdOrAmount,
      spender,
      expiration,
      data: ethUtils.toBuffer(data)
    }
  },

  getTransferTypedData: function({
    tokenAddress,
    spender,
    tokenIdOrAmount,
    data,
    expiration
  }) {
    return {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "contract", type: "address" }
        ],
        TokenTransferOrder: [
          { name: "spender", type: "address" },
          { name: "tokenIdOrAmount", type: "uint256" },
          { name: "data", type: "bytes32" },
          { name: "expiration", type: "uint256" }
        ]
      },
      domain: {
        name: "Matic Network",
        version: "1",
        chainId: 15001,
        contract: tokenAddress
      },
      primaryType: "TokenTransferOrder",
      message: {
        spender,
        tokenIdOrAmount,
        data,
        expiration
      }
    }
  }
}