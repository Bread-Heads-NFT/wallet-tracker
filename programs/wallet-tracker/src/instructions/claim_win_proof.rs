use anchor_lang::{
    prelude::*,
    solana_program::{self, program::invoke},
};

use crate::{Record, WalletTrackerError, WinProof, BASE_FEE};

#[derive(Accounts)]
#[instruction(leaf_id: [u8; 32])]
pub struct ClaimWinProof<'info> {
    #[account(init, payer = authority, space = WinProof::len(), seeds = [b"proof".as_ref(), authority.key.as_ref(), wallet.key.as_ref(), leaf_id.as_ref()], bump)]
    pub win_proof: Account<'info, WinProof>,

    #[account(init_if_needed, payer = authority, space = Record::len(), seeds = [b"record".as_ref(), authority.key.as_ref(), wallet.key.as_ref()], bump)]
    pub wallet_record: Account<'info, Record>,

    #[account(init_if_needed, payer = authority, space = Record::len(), seeds = [b"record".as_ref(), authority.key.as_ref(), leaf_id.as_ref()], bump)]
    pub leaf_record: Account<'info, Record>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl ClaimWinProof<'_> {
    pub fn handler(ctx: Context<ClaimWinProof>, leaf_id: [u8; 32]) -> Result<()> {
        ctx.accounts.win_proof.authority = *ctx.accounts.authority.key;
        ctx.accounts.win_proof.winner_wallet = *ctx.accounts.wallet.key;
        ctx.accounts.win_proof.winner_leaf_id = leaf_id;
        ctx.accounts.win_proof.bump = *ctx
            .bumps
            .get("win_proof")
            .ok_or(WalletTrackerError::UnableToFindBump)?;

        ctx.accounts.wallet_record.authority = *ctx.accounts.authority.key;
        ctx.accounts.wallet_record.identifier = *ctx.accounts.wallet.key;
        ctx.accounts.wallet_record.entries += 1;
        ctx.accounts.wallet_record.bump = *ctx
            .bumps
            .get("wallet_record")
            .ok_or(WalletTrackerError::UnableToFindBump)?;

        ctx.accounts.leaf_record.authority = *ctx.accounts.authority.key;
        ctx.accounts.leaf_record.identifier = *ctx.accounts.wallet.key;
        ctx.accounts.leaf_record.entries += 1;
        ctx.accounts.leaf_record.bump = *ctx
            .bumps
            .get("leaf_record")
            .ok_or(WalletTrackerError::UnableToFindBump)?;
        // msg!("{:#?}", ctx.accounts.wallet_record);
        // msg!("{:#?}", ctx.accounts.leaf_record);
        let fee = BASE_FEE
            * (ctx.accounts.wallet_record.entries as u64 + ctx.accounts.leaf_record.entries as u64);

        let transfer_ix = solana_program::system_instruction::transfer(
            &ctx.accounts.wallet.key(),
            &ctx.accounts.authority.key(),
            fee,
        );

        invoke(
            &transfer_ix,
            &[
                ctx.accounts.wallet.to_account_info(),
                ctx.accounts.authority.to_account_info(),
            ],
        )?;

        Ok(())
    }
}
