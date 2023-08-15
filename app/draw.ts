import {
    Program,
    Wallet,
    AnchorProvider,
    Idl,
} from '@coral-xyz/anchor'
import {
    Connection,
    PublicKey,
    Keypair
} from '@solana/web3.js'
import fs from 'fs'
import idl from '../target/idl/wallet_tracker.json'

const RPC_URL = process.argv[2];
const WALLET_FILE = process.argv[3];
const WALLET = process.argv[4];

async function main() {
    const programID = new PublicKey("TRCKTiWtWCzCopm4mnR47n4v2vEvjRQ1q6rsDxRUbVR");
    const connection = new Connection(RPC_URL, 'confirmed');
    const authority = loadKeypairFromFile(WALLET_FILE);

    const provider = new AnchorProvider(connection, new Wallet(authority), { skipPreflight: true, commitment: 'finalized', maxRetries: 100 });
    const program = new Program(idl as Idl, programID, provider);

    // let wallet = new PublicKey(WALLET);

    // let recordPDA = PublicKey.findProgramAddressSync(
    //     [Buffer.from("record"), authority.publicKey.toBuffer(), wallet.toBuffer()],
    //     program.programId
    // );

    // await init(program, wallet, 1, recordPDA[0], authority);

    // const account = await program.account.record.fetch(recordPDA[0]);
    // console.log(account);

    // await close(program, recordPDA[0], authority);
    const instances = await program.account.record.all();
    console.log(instances);
    console.log(instances.length);

    for (let instance of instances) {
        await close(program, instance.publicKey, authority);
    }

    // let ids = [];
    // for (let instance of instances) {
    //     if (instance.account.entries === 1) {
    //         ids.push(instance.account.identifier.toString());
    //     } else if (instance.account.entries === 2) {
    //         ids.push(instance.account.identifier.toString());
    //         ids.push(instance.account.identifier.toString());
    //     }
    // }
    // console.log(ids);
    // console.log(ids.length);

    // let winner = ids[Math.floor(Math.random() * ids.length)];
    // console.log(winner);
}


async function init(program: Program, wallet: PublicKey, entries: number, recordPDA: PublicKey, authority: Keypair) {
    // Add your test here.
    try {
        const tx = await program.methods
            .initialize(wallet, entries)
            .accounts({
                record: recordPDA,
                authority: authority.publicKey,
            })
            .signers([authority])
            .rpc();
        console.log("Init signature:", tx);
    } catch (e) {
        console.log(e);
    }
}

async function close(program: Program, recordPDA: PublicKey, authority: Keypair) {
    try {
        const tx = await program.methods
            .close()
            .accounts({
                record: recordPDA,
                authority: authority.publicKey,
            })
            .signers([authority])
            .rpc();
        console.log("Close signature:", tx);
    } catch (e) {
        console.log(e);
    }
}

function loadKeypairFromFile(filename: string): Keypair {

    const secret = JSON.parse(fs.readFileSync(filename).toString()) as number[];
    const secretKey = Uint8Array.from(secret);
    return Keypair.fromSecretKey(secretKey);
}

main().then(() => process.exit());