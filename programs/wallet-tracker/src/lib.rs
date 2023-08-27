#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

declare_id!("TRCKTiWtWCzCopm4mnR47n4v2vEvjRQ1q6rsDxRUbVR");

#[program]
pub mod wallet_tracker {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, identifier: Pubkey, entries: u8) -> Result<()> {
        Initialize::handler(ctx, identifier, entries)
    }

    pub fn close(_ctx: Context<Close>) -> Result<()> {
        Ok(())
    }

    pub fn claim_win_proof(ctx: Context<ClaimWinProof>, leaf_id: [u8; 32]) -> Result<()> {
        ClaimWinProof::handler(ctx, leaf_id)
    }
}

#[error_code]
pub enum WalletTrackerError {
    #[msg("Unable to find bump.")]
    UnableToFindBump,
}
