import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WalletTracker } from "../target/types/wallet_tracker";

describe("wallet-tracker", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.WalletTracker as Program<WalletTracker>;

  it("Is initialized!", async () => {
    const authority = anchor.web3.Keypair.generate();
    let airdrop = await anchor.getProvider().connection.requestAirdrop(authority.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop, "finalized");
    const wallet = anchor.web3.Keypair.generate();

    let recordPDA = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), wallet.publicKey.toBuffer()],
      program.programId
    );

    // Add your test here.
    try {
      const tx = await program.methods
        .initialize(wallet.publicKey, 1)
        .accounts({
          record: recordPDA[0],
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();
      console.log("Init signature:", tx);
    } catch (e) {
      console.log(e);
    }

    const account = await program.account.record.fetch(recordPDA[0]);
    console.log(account);

    try {
      const notAuthority = anchor.web3.Keypair.generate();
      const tx = await program.methods
        .close()
        .accounts({
          record: recordPDA[0],
          authority: notAuthority.publicKey,
        })
        .signers([notAuthority])
        .rpc();
      console.log("Close signature:", tx);
    } catch (e) {
      console.log("Expected failure");
    }

    try {
      const tx = await program.methods
        .close()
        .accounts({
          record: recordPDA[0],
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();
      console.log("Close signature:", tx);
    } catch (e) {
      console.log(e);
    }

    // const account2 = await program.account.record.fetch(recordPDA[0]);
    // console.log(account2);
  });
});
