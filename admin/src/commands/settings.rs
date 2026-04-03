use anyhow::Result;

use crate::api::ApiClient;

pub async fn show_donate_settings(client: &ApiClient) -> Result<()> {
    let settings = client.get_donate_settings().await?;
    
    println!("┌─ Donation Settings ───────────────");
    if let Some(btc) = &settings.btc {
        println!("│ BTC: {}", btc);
    }
    if let Some(eth) = &settings.eth {
        println!("│ ETH: {}", eth);
    }
    if let Some(ltc) = &settings.ltc {
        println!("│ LTC: {}", ltc);
    }
    if let Some(sol) = &settings.sol {
        println!("│ SOL: {}", sol);
    }
    if let Some(xmr) = &settings.xmr {
        println!("│ XMR: {}", xmr);
    }
    println!("└───────────────────────────────────");

    Ok(())
}

pub async fn set_donate_settings(
    client: &ApiClient,
    btc: Option<&str>,
    eth: Option<&str>,
    ltc: Option<&str>,
    sol: Option<&str>,
) -> Result<()> {
    if btc.is_none() && eth.is_none() && ltc.is_none() && sol.is_none() {
        anyhow::bail!("At least one address must be provided");
    }

    if let Some(addr) = btc {
        client.set_donate_address("btc_address", addr).await?;
        println!("✓ BTC address updated");
    }
    if let Some(addr) = eth {
        client.set_donate_address("eth_address", addr).await?;
        println!("✓ ETH address updated");
    }
    if let Some(addr) = ltc {
        client.set_donate_address("ltc_address", addr).await?;
        println!("✓ LTC address updated");
    }
    if let Some(addr) = sol {
        client.set_donate_address("sol_address", addr).await?;
        println!("✓ SOL address updated");
    }

    Ok(())
}

pub async fn show_announcement(client: &ApiClient) -> Result<()> {
    let announcement = client.get_announcement().await?;
    
    if announcement.active {
        println!("┌─ Announcement ──────────────────────");
        println!("│ Title: {}", announcement.title);
        println!("│ Body: {}", announcement.body);
        if let Some(link) = &announcement.link {
            println!("│ Link: {}", link);
        }
        println!("│ Active: {}", announcement.active);
        println!("└───────────────────────────────────");
    } else {
        println!("No active announcement.");
    }

    Ok(())
}

pub async fn set_announcement(
    client: &ApiClient,
    title: &str,
    body: &str,
    link: Option<&str>,
    active: bool,
) -> Result<()> {
    client.set_announcement_setting("announcement_title", title).await?;
    client.set_announcement_setting("announcement_body", body).await?;
    
    if let Some(link) = link {
        client.set_announcement_setting("announcement_link", link).await?;
    }
    
    client.set_announcement_setting("announcement_active", if active { "true" } else { "false" }).await?;

    println!("✓ Announcement updated");
    Ok(())
}
