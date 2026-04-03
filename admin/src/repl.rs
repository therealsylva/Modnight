use anyhow::Result;
use inquire::{Select, Text, Confirm};
use crate::api::ApiClient;
use crate::config::Config;
use crate::commands;

pub async fn run(config: &Config) -> Result<()> {
    let client = ApiClient::new(config)?;
    
    println!("Stubbed.io Admin REPL");
    println!("Type 'help' for commands, 'exit' to quit\n");
    
    loop {
        let action = Select::new(
            "Action:",
            vec!["List Plugins", "Get Plugin", "Upload Plugin", "Delete Plugin", "Stats", "Settings", "Exit"],
        ).prompt()?;
        
        match action {
            "List Plugins" => {
                let category = Text::new("Category (leave empty for all):")
                    .prompt_skippable()?;
                if let Err(e) = commands::list_plugins(&client, category.as_deref()).await {
                    println!("Error: {}", e);
                }
            }
            "Get Plugin" => {
                let id = Text::new("Plugin ID:").prompt()?;
                if let Err(e) = commands::get_plugin(&client, &id).await {
                    println!("Error: {}", e);
                }
            }
            "Upload Plugin" => {
                if let Err(e) = commands::upload_plugin_interactive(&client).await {
                    println!("Error: {}", e);
                }
            }
            "Delete Plugin" => {
                let id = Text::new("Plugin ID:").prompt()?;
                if let Err(e) = commands::delete_plugin(&client, &id, false).await {
                    println!("Error: {}", e);
                }
            }
            "Stats" => {
                if let Err(e) = commands::show_stats(&client).await {
                    println!("Error: {}", e);
                }
            }
            "Settings" => {
                let setting = Select::new(
                    "Setting:",
                    vec!["Donate", "Announcement", "Back"],
                ).prompt()?;
                
                match setting {
                    "Donate" => {
                        if let Err(e) = commands::show_donate_settings(&client).await {
                            println!("Error: {}", e);
                        }
                    }
                    "Announcement" => {
                        if let Err(e) = commands::show_announcement(&client).await {
                            println!("Error: {}", e);
                        }
                    }
                    _ => {}
                }
            }
            "Exit" => {
                let confirm = Confirm::new("Exit?")
                    .with_default(true)
                    .prompt()?;
                if confirm {
                    break;
                }
            }
            _ => {}
        }
        println!();
    }
    
    Ok(())
}
