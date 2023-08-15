use anchor_lang::prelude::*;

use crate::Record;

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub record: Account<'info, Record>,

    #[account(mut)]
    pub authority: Signer<'info>,
}
