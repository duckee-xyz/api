export const LIST_ART_TO_MARKET = `
import DuckeeArtNFT from 0xDuckeeArtNFT
import PromptMarket from 0xPromptMarket
import FlowToken from 0xFlowToken

transaction (tokenID: UInt64, priceInUSDC: UFix64, royaltyFee: UFix64) {
    let storefront: &PromptMarket.Storefront

    prepare(acct: AuthAccount) {
        self.storefront = acct.borrow<&PromptMarket.Storefront>(from: PromptMarket.StorefrontStoragePath)
            ?? panic("please run prompt-market/setup-account first")
    }

    execute {
        self.storefront.list(tokenID: tokenID, priceInUSDC: priceInUSDC, royaltyFee: royaltyFee)
    }
}
`;
