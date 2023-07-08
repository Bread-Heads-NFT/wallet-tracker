use anchor_lang::prelude::*;

declare_id!("TRCKTiWtWCzCopm4mnR47n4v2vEvjRQ1q6rsDxRUbVR");

#[program]
pub mod wallet_tracker {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, identifier: Pubkey, entries: u8) -> Result<()> {
        let record = &mut ctx.accounts.record;
        record.authority = *ctx.accounts.authority.key;
        record.identifier = identifier;
        record.entries = entries;
        record.bump = *ctx.bumps.get("record").ok_or(ErrorCode::UnableToFindBump)?;
        Ok(())
    }

    pub fn close(_ctx: Context<Close>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(wallet: Pubkey)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 32 + 1 + 1, seeds = [b"record".as_ref(), authority.key.as_ref(), wallet.as_ref()], bump)]
    pub record: Account<'info, Record>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub record: Account<'info, Record>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct Record {
    pub authority: Pubkey,
    pub identifier: Pubkey,
    pub entries: u8,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unable to find bump.")]
    UnableToFindBump,
}
