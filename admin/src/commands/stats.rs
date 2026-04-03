use anyhow::Result;
use tabled::{Table, Tabled, settings::Style};

use crate::api::ApiClient;

#[derive(Tabled)]
struct StatsRow {
    #[tabled(rename = "Metric")]
    metric: String,
    #[tabled(rename = "Value")]
    value: String,
}

pub async fn show_stats(client: &ApiClient) -> Result<()> {
    let stats = client.get_stats().await?;
    
    let rows = vec![
        StatsRow { metric: "Total Plugins".to_string(), value: stats.total_plugins.to_string() },
        StatsRow { metric: "Total Downloads".to_string(), value: stats.total_downloads.to_string() },
        StatsRow { metric: "Total Likes".to_string(), value: stats.total_likes.to_string() },
    ];
    
    let table = Table::new(rows).with(Style::rounded()).to_string();
    println!("{}", table);

    Ok(())
}
