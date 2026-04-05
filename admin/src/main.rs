mod api;
mod cli;
mod commands;
mod config;
mod repl;

use clap::Parser;
use cli::{Cli, Commands, PluginCommands, SettingsCommands, ConfigCommands, ReportsCommands, ApplicationsCommands};
use config::Config;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let args = Cli::parse();
    
    let mut config = Config::load()?;
    
    if let Some(api_url) = args.api_url {
        config.api_url = api_url;
    }
    if let Some(admin_key) = args.admin_key {
        config.admin_key = admin_key;
    }
    
    match args.command {
        Commands::Plugin { command } => {
            let client = api::ApiClient::new(&config)?;
            handle_plugin_command(client, command).await?;
        }
        Commands::Stats => {
            let client = api::ApiClient::new(&config)?;
            commands::show_stats(&client).await?;
        }
        Commands::Settings { command } => {
            let client = api::ApiClient::new(&config)?;
            handle_settings_command(&client, command).await?;
        }
        Commands::Config { command } => {
            handle_config_command(&config, command)?;
        }
        Commands::Repl => {
            repl::run(&config).await?;
        }
        Commands::Reports { command } => {
            let client = api::ApiClient::new(&config)?;
            match command {
                ReportsCommands::List => {
                    commands::list_reports(&client).await?;
                }
            }
        }
        Commands::Applications { command } => {
            let client = api::ApiClient::new(&config)?;
            match command {
                ApplicationsCommands::List => {
                    commands::list_applications(&client).await?;
                }
                ApplicationsCommands::Approve { id } => {
                    commands::approve_application(&client, &id).await?;
                }
                ApplicationsCommands::Reject { id } => {
                    commands::reject_application(&client, &id).await?;
                }
            }
        }
    }
    
    Ok(())
}

async fn handle_plugin_command(client: api::ApiClient, command: PluginCommands) -> anyhow::Result<()> {
    match command {
        PluginCommands::List { category } => {
            commands::list_plugins(&client, category.as_deref()).await?;
        }
        PluginCommands::Get { id } => {
            commands::get_plugin(&client, &id).await?;
        }
        PluginCommands::Upload {
            file,
            title,
            author,
            version,
            description,
            category,
            compatibility,
            thumbnail,
        } => {
            let desc = description.unwrap_or_else(|| title.clone());
            let cat = category.unwrap_or_else(|| "Other".to_string());
            let ver = version.unwrap_or_else(|| "1.0.0".to_string());
            let comp = compatibility.unwrap_or_else(|| "Universal".to_string());
            
            commands::upload_plugin_with_options(
                &client,
                &file,
                &title,
                &author,
                &ver,
                &desc,
                &cat,
                &comp,
                thumbnail.as_deref(),
            ).await?;
        }
        PluginCommands::Delete { id, force } => {
            commands::delete_plugin(&client, &id, force).await?;
        }
        PluginCommands::Update {
            id,
            title,
            author,
            version,
            description,
            category,
            compatibility,
            file,
            thumbnail,
            changelog,
            installation,
            images,
        } => {
            commands::update_plugin(
                &client,
                &id,
                title.as_deref(),
                author.as_deref(),
                version.as_deref(),
                description.as_deref(),
                category.as_deref(),
                compatibility.as_deref(),
                file.as_deref(),
                thumbnail.as_deref(),
                changelog.as_deref(),
                installation.as_deref(),
                images,
            ).await?;
        }
        PluginCommands::UploadInteractive => {
            commands::upload_plugin_interactive(&client).await?;
        }
        PluginCommands::Freeze { id, unfreeze } => {
            commands::freeze_plugin(&client, &id, unfreeze).await?;
        }
    }
    Ok(())
}

async fn handle_settings_command(client: &api::ApiClient, command: SettingsCommands) -> anyhow::Result<()> {
    match command {
        SettingsCommands::Donate => {
            commands::show_donate_settings(client).await?;
        }
        SettingsCommands::SetDonate { btc, eth, ltc, sol } => {
            commands::set_donate_settings(
                client,
                btc.as_deref(),
                eth.as_deref(),
                ltc.as_deref(),
                sol.as_deref(),
            ).await?;
        }
        SettingsCommands::Announcement => {
            commands::show_announcement(client).await?;
        }
        SettingsCommands::SetAnnouncement { title, body, link, active } => {
            commands::set_announcement(
                client,
                &title,
                &body,
                link.as_deref(),
                active,
            ).await?;
        }
    }
    Ok(())
}

fn handle_config_command(config: &Config, command: ConfigCommands) -> anyhow::Result<()> {
    match command {
        ConfigCommands::Show => {
            println!("API URL: {}", config.api_url);
            println!("Admin Key: {}...", &config.admin_key.chars().take(8).collect::<String>());
        }
        ConfigCommands::Set { api_url, admin_key } => {
            let mut new_config = config.clone();
            if let Some(url) = api_url {
                new_config.api_url = url;
            }
            if let Some(key) = admin_key {
                new_config.admin_key = key;
            }
            new_config.save()?;
            println!("Config saved to ~/.stubbed/config.toml");
        }
    }
    Ok(())
}
