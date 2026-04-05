use anyhow::Result;
use tabled::{Table, Tabled, settings::Style};

use crate::api::ApiClient;

#[derive(Tabled)]
struct ReportRow {
    #[tabled(rename = "ID")]
    id: String,
    #[tabled(rename = "Plugin ID")]
    plugin_id: String,
    #[tabled(rename = "Reason")]
    reason: String,
    #[tabled(rename = "Submitted")]
    created_at: String,
}

#[derive(Tabled)]
struct ApplicationRow {
    #[tabled(rename = "ID")]
    id: String,
    #[tabled(rename = "Email")]
    email: String,
    #[tabled(rename = "GitHub")]
    github: String,
    #[tabled(rename = "Status")]
    status: String,
    #[tabled(rename = "Applied")]
    created_at: String,
}

pub async fn list_reports(client: &ApiClient) -> Result<()> {
    let reports = client.list_reports().await?;

    if reports.is_empty() {
        println!("No reports found.");
        return Ok(());
    }

    let rows: Vec<ReportRow> = reports
        .iter()
        .map(|r| ReportRow {
            id: r.id.chars().take(8).collect(),
            plugin_id: r.plugin_id.chars().take(8).collect(),
            reason: if r.reason.len() > 40 {
                format!("{}...", &r.reason[..37])
            } else {
                r.reason.clone()
            },
            created_at: r.created_at.chars().take(10).collect(),
        })
        .collect();

    let table = Table::new(rows).with(Style::rounded()).to_string();
    println!("{}", table);
    println!("{} report(s) total.", reports.len());

    Ok(())
}

pub async fn freeze_plugin(client: &ApiClient, id: &str, unfreeze: bool) -> Result<()> {
    let frozen = !unfreeze;
    client.freeze_plugin(id, frozen).await?;

    if frozen {
        println!("Plugin {} is now frozen (Under Investigation).", id);
    } else {
        println!("Plugin {} has been unfrozen.", id);
    }

    Ok(())
}

pub async fn list_applications(client: &ApiClient) -> Result<()> {
    let apps = client.list_applications().await?;

    if apps.is_empty() {
        println!("No creator applications found.");
        return Ok(());
    }

    let rows: Vec<ApplicationRow> = apps
        .iter()
        .map(|a| ApplicationRow {
            id: a.id.chars().take(8).collect(),
            email: a.email.clone(),
            github: a.github.clone(),
            status: a.status.clone(),
            created_at: a.created_at.chars().take(10).collect(),
        })
        .collect();

    let table = Table::new(rows).with(Style::rounded()).to_string();
    println!("{}", table);
    println!("{} application(s) total.", apps.len());

    Ok(())
}

pub async fn approve_application(client: &ApiClient, id: &str) -> Result<()> {
    client.update_application(id, "approved").await?;
    println!("Application {} approved.", id);
    Ok(())
}

pub async fn reject_application(client: &ApiClient, id: &str) -> Result<()> {
    client.update_application(id, "rejected").await?;
    println!("Application {} rejected.", id);
    Ok(())
}
