export const MINT_ART = `
import DuckeeArtNFT from 0xDuckeeArtNFT
import PromptMarket from 0xPromptMarket
import FlowToken from 0xFlowToken
import NonFungibleToken from 0xNonFungibleToken

transaction (recipient: Address, id: UInt64, description: String, thumbnail: String, parentTokenID: UInt64?) {
    let recipientCollection: &{NonFungibleToken.CollectionPublic}
    let minter: &DuckeeArtNFT.Minter

    prepare(acct: AuthAccount) {
        let collectionCapability = getAccount(recipient).getCapability<&{NonFungibleToken.CollectionPublic}>(DuckeeArtNFT.CollectionPublicPath)
        self.recipientCollection = collectionCapability.borrow() ?? panic("cannot borrow collection cap")
        self.minter = acct.borrow<&DuckeeArtNFT.Minter>(from: DuckeeArtNFT.MinterStoragePath) ?? panic("cannot borrow minter")
    }

    execute {
        self.minter.mintNFT(recipient: self.recipientCollection, id: id, description: description, thumbnail: thumbnail, parentTokenID: parentTokenID)
    }
}
`;
