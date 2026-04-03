# ModNight Admin CLI

A command-line tool for managing plugins, settings, and configurations on ModNight.

## Installation

```bash
cd admin-cli
cargo build --release
# Binary will be at target/release/stubbed
```

## Configuration

The CLI requires an admin API key to authenticate with the backend.

### Option 1: Via Command Line Flag
```bash
stubbed --admin-key YOUR_API_KEY plugin list
```

### Option 2: Via Environment Variable
```bash
export STUBBED_ADMIN_KEY=YOUR_API_KEY
stubbed plugin list
```

### Option 3: Via Config Command
```bash
stubbed config set --admin-key YOUR_API_KEY
```

## Usage

### Global Options

| Option | Env Variable | Description |
|--------|--------------|-------------|
| `--api-url` | `STUBBED_API_URL` | API URL (default: http://localhost:8080) |
| `--admin-key` | `STUBBED_ADMIN_KEY` | Admin API key for authentication |

---

## Commands

### Plugin Management

#### List Plugins
```bash
stubbed plugin list                    # List all plugins
stubbed plugin list --category Tools  # Filter by category
stubbed plugins list                   # Alias
```

#### Get Plugin Details
```bash
stubbed plugin get PLUGIN_ID
stubbed plugin get cc7143b2-f22b-412e-b8fb-d2facf411c74
```

#### Upload Plugin
```bash
# Basic upload
stubbed plugin upload \
  --file ./my-plugin.zip \
  --title "My Plugin" \
  --author "YourName" \
  --description "Plugin description" \
  --category "Mods"

# With optional fields
stubbed plugin upload \
  --file ./my-plugin.zip \
  --title "My Plugin" \
  --author "YourName" \
  --description "Plugin description" \
  --category "Mods" \
  --version "1.0.0" \
  --compatibility "Universal" \
  --thumbnail ./thumbnail.png
```

**Required Flags:**
| Flag | Description |
|------|-------------|
| `--file` | Path to plugin ZIP file |
| `--title` | Plugin title |
| `--author` | Plugin author |

**Optional Flags:**
| Flag | Short | Description |
|------|-------|-------------|
| `--version` | `-V` | Plugin version (default: "1.0.0") |
| `--description` | | Plugin description |
| `--category` | | Category (Mods, Tools, Other) |
| `--compatibility` | | Compatibility (Universal, Windows, Linux, Mac) |
| `--thumbnail` | | Path to thumbnail image |

#### Update Plugin
```bash
# Update specific fields
stubbed plugin update PLUGIN_ID --title "New Title"
stubbed plugin update PLUGIN_ID --version "2.0.0" --description "New description"

# Full update example
stubbed plugin update cc7143b2-f22b-412e-b8fb-d2facf411c74 \
  --title "Updated Title" \
  --author "New Author" \
  --version "1.1.0" \
  --description "Updated description" \
  --category "Tools" \
  --compatibility "Linux" \
  --file ./new-version.zip \
  --thumbnail ./new-thumb.png
```

#### Delete Plugin
```bash
stubbed plugin delete PLUGIN_ID
stubbed plugin delete cc7143b2-f22b-412e-b8fb-d2facf411c74

# Skip confirmation
stubbed plugin delete PLUGIN_ID --force
```

#### Interactive Upload
```bash
stubbed plugin upload-interactive
# Opens interactive prompts for plugin details
```

---

### Statistics

#### View Stats
```bash
stubbed stats
stubbed stat
```
Shows total plugins, downloads, and category breakdown.

---

### Settings

#### View Donate Settings
```bash
stubbed settings donate
```

#### Set Donate Addresses
```bash
# Set single address
stubbed settings set-donate --btc bc1q...

# Set multiple addresses
stubbed settings set-donate \
  --btc bc1q... \
  --eth 0x... \
  --ltc ltc1... \
  --sol sol1...
```

#### View Announcement
```bash
stubbed settings announcement
```

#### Set Announcement
```bash
stubbed settings set-announcement \
  --title "New Feature!" \
  --body "Check out our latest updates" \
  --active

# With link
stubbed settings set-announcement \
  --title "Maintenance" \
  --body "Server maintenance scheduled" \
  --link "https://stubbed.io/status" \
  --active

# Turn off announcement
stubbed settings set-announcement \
  --title "" \
  --body "" \
  --link "" \
  --active false
```

---

### Configuration

#### Show Current Config
```bash
stubbed config show
```

#### Set Config Values
```bash
stubbed config set --api-url http://localhost:8080
stubbed config set --admin-key YOUR_KEY
stubbed config set --api-url http://localhost:8080 --admin-key YOUR_KEY
```

---

### REPL Mode

Interactive shell for running multiple commands:
```bash
stubbed repl
```

---

## Examples

### Full Workflow Example

```bash
# 1. Configure admin key
stubbed config set --admin-key 49cfcf6e21578b4c8cae9ad84cd4fadc

# 2. Check current stats
stubbed stats

# 3. Upload a new plugin
stubbed plugin upload \
  --file ./spotifi.zip \
  --title "Spotifi" \
  --author "zealben" \
  --description "A Spotify controller for Linux" \
  --category "Tools" \
  --version "1.0.0"

# 4. Check plugin was uploaded
stubbed plugin list

# 5. Update plugin thumbnail
stubbed plugin update PLUGIN_ID --thumbnail ./spotifi.png

# 6. Set donation addresses
stubbed settings set-donate --btc bc1q...
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `STUBBED_API_URL` | Backend API URL |
| `STUBBED_ADMIN_KEY` | Admin API key |

---

## Troubleshooting

### "Rate limit exceeded"
Wait 60 seconds or increase rate limit on backend.

### "Admin key required"
Make sure to provide `--admin-key` or set `STUBBED_ADMIN_KEY` env variable.

### "Connection refused"
Ensure backend is running at the specified API URL.
