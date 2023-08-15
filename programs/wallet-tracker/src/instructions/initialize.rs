use anchor_lang::prelude::*;

use crate::{Record, WalletTrackerError};

#[derive(Accounts)]
#[instruction(wallet: Pubkey)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 32 + 1 + 1, seeds = [b"record".as_ref(), authority.key.as_ref(), wallet.as_ref()], bump)]
    pub record: Account<'info, Record>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl Initialize<'_> {
    pub fn handler(ctx: Context<Initialize>, identifier: Pubkey, entries: u8) -> Result<()> {
        let record = &mut ctx.accounts.record;
        record.authority = *ctx.accounts.authority.key;
        record.identifier = identifier;
        record.entries = entries;
        record.bump = *ctx
            .bumps
            .get("record")
            .ok_or(WalletTrackerError::UnableToFindBump)?;
        Ok(())
    }
}
