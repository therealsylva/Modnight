use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "stubbed")]
#[command(about = "Stubbed.io Admin CLI", long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
    
    #[arg(long, env = "STUBBED_API_URL", global = true)]
    pub api_url: Option<String>,
    
    #[arg(long, env = "STUBBED_ADMIN_KEY", global = true)]
    pub admin_key: Option<String>,
}

#[derive(Subcommand)]
pub enum Commands {
    #[command(alias = "plugins")]
    Plugin {
        #[command(subcommand)]
        command: PluginCommands,
    },
    
    #[command(alias = "stat")]
    Stats,
    
    #[command(alias = "setting")]
    Settings {
        #[command(subcommand)]
        command: SettingsCommands,
    },
    
    Config {
        #[command(subcommand)]
        command: ConfigCommands,
    },

    Repl,

    Reports {
        #[command(subcommand)]
        command: ReportsCommands,
    },

    Applications {
        #[command(subcommand)]
        command: ApplicationsCommands,
    },
}

#[derive(Subcommand)]
pub enum PluginCommands {
    List {
        #[arg(short, long)]
        category: Option<String>,
    },
    
    Get {
        id: String,
    },
    
    Upload {
        #[arg(short, long)]
        file: String,
        #[arg(short, long)]
        title: String,
        #[arg(short, long)]
        author: String,
        #[arg(short = 'V', long)]
        version: Option<String>,
        #[arg(short, long)]
        description: Option<String>,
        #[arg(short, long)]
        category: Option<String>,
        #[arg(long)]
        compatibility: Option<String>,
        #[arg(long)]
        thumbnail: Option<String>,
    },
    
    Delete {
        id: String,
        #[arg(short, long)]
        force: bool,
    },
    
    Update {
        id: String,
        #[arg(short, long)]
        title: Option<String>,
        #[arg(short, long)]
        author: Option<String>,
        #[arg(short = 'V', long)]
        version: Option<String>,
        #[arg(short, long)]
        description: Option<String>,
        #[arg(long)]
        category: Option<String>,
        #[arg(long)]
        compatibility: Option<String>,
        #[arg(short, long)]
        file: Option<String>,
        #[arg(long)]
        thumbnail: Option<String>,
        #[arg(long)]
        changelog: Option<String>,
        #[arg(long)]
        installation: Option<String>,
        #[arg(long, num_args = 1..)]
        images: Option<Vec<String>>,
    },
    
    #[command(name = "upload-interactive")]
    UploadInteractive,

    Freeze {
        id: String,
        /// Pass --unfreeze to lift the freeze
        #[arg(long)]
        unfreeze: bool,
    },
}

#[derive(Subcommand)]
pub enum ReportsCommands {
    List,
}

#[derive(Subcommand)]
pub enum ApplicationsCommands {
    List,
    Approve { id: String },
    Reject { id: String },
}

#[derive(Subcommand)]
pub enum SettingsCommands {
    Donate,
    SetDonate {
        #[arg(long)]
        btc: Option<String>,
        #[arg(long)]
        eth: Option<String>,
        #[arg(long)]
        ltc: Option<String>,
        #[arg(long)]
        sol: Option<String>,
    },
    Announcement,
    SetAnnouncement {
        #[arg(long)]
        title: String,
        #[arg(long)]
        body: String,
        #[arg(long)]
        link: Option<String>,
        #[arg(long)]
        active: bool,
    },
}

#[derive(Subcommand)]
pub enum ConfigCommands {
    Show,
    Set {
        #[arg(short, long)]
        api_url: Option<String>,
        #[arg(short, long)]
        admin_key: Option<String>,
    },
}
