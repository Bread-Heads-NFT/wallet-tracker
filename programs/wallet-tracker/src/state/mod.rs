use anchor_lang::{prelude::*, solana_program::native_token::LAMPORTS_PER_SOL};

#[account]
#[derive(Debug)]
pub struct Record {
    pub authority: Pubkey,
    pub identifier: Pubkey,
    pub entries: u16,
    pub bump: u8,
}

impl Record {
    pub fn len() -> usize {
        8 + 32 + 32 + 2 + 1 + 25
    }
}

#[account]
#[derive(Debug)]
pub struct WinProof {
    pub authority: Pubkey,
    pub winner_wallet: Pubkey,
    pub winner_tree: Pubkey,
    pub winner_leaf_id: [u8; 32],
    pub bump: u8,
}

impl WinProof {
    pub fn len() -> usize {
        8 + 32 + 32 + 32 + 32 + 1 + 25
    }
}

pub const BASE_FEE: u64 = ((LAMPORTS_PER_SOL as f64) * 0.005f64) as u64;
