use anchor_lang::prelude::*;

#[account]
pub struct Record {
    pub authority: Pubkey,
    pub identifier: Pubkey,
    pub entries: u8,
    pub bump: u8,
}
