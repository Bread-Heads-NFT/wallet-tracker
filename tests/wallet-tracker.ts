import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WalletTracker } from "../target/types/wallet_tracker";
import { assert } from "chai";

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

  it("Can Claim Win", async () => {
    const authority = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(authority.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop0, "finalized");
    const wallet = anchor.web3.Keypair.generate();
    let airdrop1 = await anchor.getProvider().connection.requestAirdrop(wallet.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop1, "finalized");
    const leaf_id = anchor.web3.Keypair.generate().publicKey.toBuffer();

    let winProofPDA = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), authority.publicKey.toBuffer(), wallet.publicKey.toBuffer(), leaf_id],
      program.programId
    );

    let walletRecordPDA = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), wallet.publicKey.toBuffer()],
      program.programId
    );

    let leafRecordPDA = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), leaf_id],
      program.programId
    );

    // Add your test here.
    try {
      const tx = await program.methods
        .claimWinProof(Array.from(leaf_id))
        .accounts({
          winProof: winProofPDA[0],
          walletRecord: walletRecordPDA[0],
          leafRecord: leafRecordPDA[0],
          authority: authority.publicKey,
          wallet: wallet.publicKey,
        })
        .signers([authority, wallet])
        .rpc();
      console.log("Proof signature:", tx);
    } catch (e) {
      console.log(e);
    }

    const winProofAccount = await program.account.winProof.fetch(winProofPDA[0]);
    console.log(winProofAccount);

    const walletRecordAccount = await program.account.record.fetch(walletRecordPDA[0]);
    console.log(walletRecordAccount);

    const leafRecordAccount = await program.account.record.fetch(leafRecordPDA[0]);
    console.log(leafRecordAccount);
  });

  it("Two wallets can claim same leaf", async () => {
    const authority = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(authority.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop0, "finalized");
    const wallet0 = anchor.web3.Keypair.generate();
    let airdrop1 = await anchor.getProvider().connection.requestAirdrop(wallet0.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop1, "finalized");
    const wallet1 = anchor.web3.Keypair.generate();
    let airdrop2 = await anchor.getProvider().connection.requestAirdrop(wallet1.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop2, "finalized");
    const leaf_id = anchor.web3.Keypair.generate().publicKey.toBuffer();

    let winProofPDA0 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), authority.publicKey.toBuffer(), wallet0.publicKey.toBuffer(), leaf_id],
      program.programId
    );

    let winProofPDA1 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), authority.publicKey.toBuffer(), wallet1.publicKey.toBuffer(), leaf_id],
      program.programId
    );

    let walletRecordPDA0 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), wallet0.publicKey.toBuffer()],
      program.programId
    );

    let walletRecordPDA1 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), wallet1.publicKey.toBuffer()],
      program.programId
    );

    let leafRecordPDA = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), leaf_id],
      program.programId
    );

    // Add your test here.
    try {
      const tx = await program.methods
        .claimWinProof(Array.from(leaf_id))
        .accounts({
          winProof: winProofPDA0[0],
          walletRecord: walletRecordPDA0[0],
          leafRecord: leafRecordPDA[0],
          authority: authority.publicKey,
          wallet: wallet0.publicKey,
        })
        .signers([authority, wallet0])
        .rpc();
      console.log("Proof signature:", tx);
    } catch (e) {
      console.log(e);
    }

    try {
      const tx = await program.methods
        .claimWinProof(Array.from(leaf_id))
        .accounts({
          winProof: winProofPDA1[0],
          walletRecord: walletRecordPDA1[0],
          leafRecord: leafRecordPDA[0],
          authority: authority.publicKey,
          wallet: wallet1.publicKey,
        })
        .signers([authority, wallet1])
        .rpc();
      console.log("Proof signature:", tx);
    } catch (e) {
      console.log(e);
    }

    const winProofAccount0 = await program.account.winProof.fetch(winProofPDA0[0]);
    console.log("Proof 0:", winProofAccount0);

    const winProofAccount1 = await program.account.winProof.fetch(winProofPDA1[0]);
    console.log("Proof 1:", winProofAccount1);

    const walletRecordAccount0 = await program.account.record.fetch(walletRecordPDA0[0]);
    console.log("Wallet 0:", walletRecordAccount0);

    const walletRecordAccount1 = await program.account.record.fetch(walletRecordPDA1[0]);
    console.log("Wallet 1:", walletRecordAccount1);

    const leafRecordAccount = await program.account.record.fetch(leafRecordPDA[0]);
    console.log(leafRecordAccount);
  });

  it("Can Claim 2 Leaf IDs", async () => {
    const authority = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(authority.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop0, "finalized");
    const wallet = anchor.web3.Keypair.generate();
    let airdrop1 = await anchor.getProvider().connection.requestAirdrop(wallet.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop1, "finalized");
    const leaf_id_0 = anchor.web3.Keypair.generate().publicKey.toBuffer();
    const leaf_id_1 = anchor.web3.Keypair.generate().publicKey.toBuffer();

    let winProofPDA0 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), authority.publicKey.toBuffer(), wallet.publicKey.toBuffer(), leaf_id_0],
      program.programId
    );

    let winProofPDA1 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), authority.publicKey.toBuffer(), wallet.publicKey.toBuffer(), leaf_id_1],
      program.programId
    );

    let walletRecordPDA = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), wallet.publicKey.toBuffer()],
      program.programId
    );

    let leafRecordPDA0 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), leaf_id_0],
      program.programId
    );

    let leafRecordPDA1 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), leaf_id_1],
      program.programId
    );

    // Add your test here.
    try {
      const tx = await program.methods
        .claimWinProof(Array.from(leaf_id_0))
        .accounts({
          winProof: winProofPDA0[0],
          walletRecord: walletRecordPDA[0],
          leafRecord: leafRecordPDA0[0],
          authority: authority.publicKey,
          wallet: wallet.publicKey,
        })
        .signers([authority, wallet])
        .rpc();
      console.log("Proof signature:", tx);
    } catch (e) {
      console.log(e);
    }

    try {
      const tx = await program.methods
        .claimWinProof(Array.from(leaf_id_1))
        .accounts({
          winProof: winProofPDA1[0],
          walletRecord: walletRecordPDA[0],
          leafRecord: leafRecordPDA1[0],
          authority: authority.publicKey,
          wallet: wallet.publicKey,
        })
        .signers([authority, wallet])
        .rpc();
      console.log("Proof signature:", tx);
    } catch (e) {
      console.log(e);
    }

    const winProofAccount0 = await program.account.winProof.fetch(winProofPDA0[0]);
    console.log("Proof 0:", winProofAccount0);

    const winProofAccount1 = await program.account.winProof.fetch(winProofPDA0[0]);
    console.log("Proof 1:", winProofAccount1);

    const walletRecordAccount = await program.account.record.fetch(walletRecordPDA[0]);
    console.log(walletRecordAccount);
    assert.equal(walletRecordAccount.entries, 2);

    const leafRecordAccount0 = await program.account.record.fetch(leafRecordPDA0[0]);
    console.log("Leaf 0:", leafRecordAccount0);
    assert.equal(leafRecordAccount0.entries, 1);

    const leafRecordAccount1 = await program.account.record.fetch(leafRecordPDA1[0]);
    console.log("Leaf 1:", leafRecordAccount1);
    assert.equal(leafRecordAccount1.entries, 1);
  });

  it("Can't Double Claim", async () => {
    const authority = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(authority.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop0, "finalized");
    const wallet = anchor.web3.Keypair.generate();
    let airdrop1 = await anchor.getProvider().connection.requestAirdrop(wallet.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop1, "finalized");
    const leaf_id = anchor.web3.Keypair.generate().publicKey.toBuffer();

    let winProofPDA = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), authority.publicKey.toBuffer(), wallet.publicKey.toBuffer(), leaf_id],
      program.programId
    );

    let walletRecordPDA = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), wallet.publicKey.toBuffer()],
      program.programId
    );

    let leafRecordPDA = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("record"), authority.publicKey.toBuffer(), leaf_id],
      program.programId
    );

    // Add your test here.
    try {
      const tx = await program.methods
        .claimWinProof(Array.from(leaf_id))
        .accounts({
          winProof: winProofPDA[0],
          walletRecord: walletRecordPDA[0],
          leafRecord: leafRecordPDA[0],
          authority: authority.publicKey,
          wallet: wallet.publicKey,
        })
        .signers([authority, wallet])
        .rpc();
      console.log("Proof signature:", tx);
    } catch (e) {
      console.log(e);
    }

    const winProofAccount = await program.account.winProof.fetch(winProofPDA[0]);
    console.log(winProofAccount);

    const walletRecordAccount = await program.account.record.fetch(walletRecordPDA[0]);
    console.log(walletRecordAccount);

    const leafRecordAccount = await program.account.record.fetch(leafRecordPDA[0]);
    console.log(leafRecordAccount);

    // Add your test here.
    try {
      const tx = await program.methods
        .claimWinProof(Array.from(leaf_id))
        .accounts({
          winProof: winProofPDA[0],
          walletRecord: walletRecordPDA[0],
          leafRecord: leafRecordPDA[0],
          authority: authority.publicKey,
          wallet: wallet.publicKey,
        })
        .signers([authority, wallet])
        .rpc();
        assert.ok(false);
      console.log("Proof signature:", tx);
    } catch (e) {
      // console.log(e);
      assert.isTrue(e instanceof anchor.web3.SendTransactionError);
      const err: anchor.web3.SendTransactionError = e;
      for (const log of err.logs) {
        if (log.includes("already in use")){
          assert.ok(true);
          return;
        }
      }
      assert.ok(false);
    }
  });
});
