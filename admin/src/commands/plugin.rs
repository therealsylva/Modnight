use anyhow::Result;
use inquire::{Confirm, Select, Text};
use indicatif::{ProgressBar, ProgressStyle};
use tabled::{Table, Tabled, settings::Style};

use crate::api::{ApiClient, Plugin, UploadOptions, UpdateOptions};

#[derive(Tabled)]
pub struct PluginRow {
    #[tabled(rename = "ID")]
    pub id: String,
    #[tabled(rename = "Title")]
    pub title: String,
    #[tabled(rename = "Author")]
    pub author: String,
    #[tabled(rename = "Version")]
    pub version: String,
    #[tabled(rename = "Category")]
    pub category: String,
    #[tabled(rename = "Downloads")]
    pub downloads: i32,
}

impl From<&Plugin> for PluginRow {
    fn from(p: &Plugin) -> Self {
        Self {
            id: p.id.chars().take(8).collect(),
            title: if p.title.len() > 30 { format!("{}...", &p.title[..27]) } else { p.title.clone() },
            author: if p.author.len() > 20 { format!("{}...", &p.author[..17]) } else { p.author.clone() },
            version: p.version.clone(),
            category: p.category.clone(),
            downloads: p.downloads,
        }
    }
}

pub async fn list_plugins(client: &ApiClient, category: Option<&str>) -> Result<()> {
    let plugins = client.list_plugins(category).await?;
    
    if plugins.is_empty() {
        println!("No plugins found.");
        return Ok(());
    }

    let rows: Vec<PluginRow> = plugins.iter().map(PluginRow::from).collect();
    let table = Table::new(rows).with(Style::rounded()).to_string();
    println!("{}", table);

    Ok(())
}

pub async fn get_plugin(client: &ApiClient, id: &str) -> Result<()> {
    let plugin = client.get_plugin(id).await?;
    
    println!("┌─ {} ─────────────────────────────", plugin.title);
    println!("│ ID: {}", plugin.id);
    println!("│ Author: {}", plugin.author);
    println!("│ Version: {}", plugin.version);
    println!("│ Category: {}", plugin.category);
    println!("│ Downloads: {}", plugin.downloads);
    println!("│ Likes: {}", plugin.likes);
    println!("│ Size: {}", plugin.file_size);
    println!("│ Compatibility: {}", plugin.compatibility);
    println!("├─ Description ────────────────────");
    for line in plugin.description.lines().take(10) {
        println!("│ {}", line);
    }
    println!("└──────────────────────────────────");

    Ok(())
}

pub async fn delete_plugin(client: &ApiClient, id: &str, force: bool) -> Result<()> {
    let plugin = client.get_plugin(id).await?;
    
    if !force {
        let confirm = Confirm::new(&format!("Delete '{}' by {}?", plugin.title, plugin.author))
            .with_default(false)
            .prompt()?;
        
        if !confirm {
            println!("Cancelled.");
            return Ok(());
        }
    }

    client.delete_plugin(id).await?;
    println!("Plugin '{}' deleted.", plugin.title);
    
    Ok(())
}

pub async fn upload_plugin_interactive(client: &ApiClient) -> Result<()> {
    let file_path = Text::new("Plugin file path:")
        .prompt()?;
    
    if !std::path::Path::new(&file_path).exists() {
        anyhow::bail!("File not found: {}", file_path);
    }

    let title = Text::new("Title:").prompt()?;
    let author = Text::new("Author:").prompt()?;
    let version = Text::new("Version:")
        .with_default("1.0.0")
        .prompt()?;
    let description = Text::new("Description:").prompt()?;
    
    let categories = vec!["Mods", "Plugins", "Maps", "Resource Packs", "Shaders", "Skins", "Tools", "Other"];
    let category = Select::new("Category:", categories)
        .prompt()?
        .to_string();
    
    let tags = Text::new("Tags (comma-separated):")
        .prompt_skippable()?;
    let compatibility = Text::new("Compatibility:").prompt()?;
    let preview_video = Text::new("Preview video URL:")
        .prompt_skippable()?;
    let changelog = Text::new("Changelog:")
        .prompt_skippable()?;
    let installation_instructions = Text::new("Installation instructions:")
        .prompt_skippable()?;
    
    let thumbnail_path = Text::new("Thumbnail path:")
        .prompt_skippable()?;
    let images_input = Text::new("Additional images (comma-separated paths):")
        .prompt_skippable()?;
    
    let images_paths: Vec<String> = images_input
        .map(|s| s.split(',').map(|p| p.trim().to_string()).collect())
        .unwrap_or_default();

    let options = UploadOptions {
        title,
        author,
        version,
        description,
        category,
        tags,
        compatibility,
        preview_video,
        changelog,
        installation_instructions,
        file_path,
        thumbnail_path,
        images_paths,
    };

    let pb = ProgressBar::new_spinner();
    pb.set_style(ProgressStyle::default_spinner().template("{spinner} Uploading plugin...")?);
    pb.enable_steady_tick(std::time::Duration::from_millis(100));

    let result = client.upload_plugin(&options).await;
    
    pb.finish_and_clear();
    
    match result {
        Ok(plugin) => {
            println!("✓ Plugin uploaded: {} (ID: {})", plugin.title, plugin.id);
        }
        Err(e) => {
            anyhow::bail!("Upload failed: {}", e);
        }
    }

    Ok(())
}

pub async fn upload_plugin_with_options(
    client: &ApiClient,
    file: &str,
    title: &str,
    author: &str,
    version: &str,
    description: &str,
    category: &str,
    compatibility: &str,
    thumbnail: Option<&str>,
) -> Result<()> {
    let options = UploadOptions {
        title: title.to_string(),
        author: author.to_string(),
        version: version.to_string(),
        description: description.to_string(),
        category: category.to_string(),
        compatibility: compatibility.to_string(),
        file_path: file.to_string(),
        thumbnail_path: thumbnail.map(String::from),
        ..Default::default()
    };

    let pb = ProgressBar::new_spinner();
    pb.set_style(ProgressStyle::default_spinner().template("{spinner} Uploading plugin...")?);
    pb.enable_steady_tick(std::time::Duration::from_millis(100));

    let result = client.upload_plugin(&options).await;
    
    pb.finish_and_clear();
    
    match result {
        Ok(plugin) => {
            println!("✓ Plugin uploaded: {} (ID: {})", plugin.title, plugin.id);
        }
        Err(e) => {
            anyhow::bail!("Upload failed: {}", e);
        }
    }

    Ok(())
}

pub async fn update_plugin(
    client: &ApiClient,
    id: &str,
    title: Option<&str>,
    author: Option<&str>,
    version: Option<&str>,
    description: Option<&str>,
    category: Option<&str>,
    compatibility: Option<&str>,
    file: Option<&str>,
    thumbnail: Option<&str>,
    changelog: Option<&str>,
    installation: Option<&str>,
    images: Option<Vec<String>>,
) -> Result<()> {
    let options = UpdateOptions {
        id: id.to_string(),
        title: title.map(String::from),
        author: author.map(String::from),
        version: version.map(String::from),
        description: description.map(String::from),
        category: category.map(String::from),
        compatibility: compatibility.map(String::from),
        file_path: file.map(String::from),
        thumbnail_path: thumbnail.map(String::from),
        changelog: changelog.map(String::from),
        installation: installation.map(String::from),
        images: images,
    };

    let pb = ProgressBar::new_spinner();
    pb.set_style(ProgressStyle::default_spinner().template("{spinner} Updating plugin...")?);
    pb.enable_steady_tick(std::time::Duration::from_millis(100));

    let result = client.update_plugin(&options).await;
    
    pb.finish_and_clear();
    
    match result {
        Ok(plugin) => {
            println!("✓ Plugin updated: {} (ID: {})", plugin.title, plugin.id);
        }
        Err(e) => {
            anyhow::bail!("Update failed: {}", e);
        }
    }

    Ok(())
}
