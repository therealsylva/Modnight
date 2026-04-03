use anyhow::Result;
use serde::Deserialize;

use super::ApiClient;

#[derive(Debug, Clone, Deserialize)]
pub struct DonateSettings {
    pub btc: Option<String>,
    pub eth: Option<String>,
    pub ltc: Option<String>,
    pub sol: Option<String>,
    pub xmr: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Announcement {
    pub active: bool,
    pub title: String,
    pub body: String,
    pub link: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SetDonateRequest {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SetAnnouncementRequest {
    pub key: String,
    pub value: String,
}

impl ApiClient {
    pub async fn get_donate_settings(&self) -> Result<DonateSettings> {
        let response: crate::api::ApiResponse<DonateSettings> = self.get("/api/settings/donate").await?;
        Ok(response.data)
    }

    pub async fn get_announcement(&self) -> Result<Announcement> {
        let response: crate::api::ApiResponse<Announcement> = self.get("/api/announcements").await?;
        Ok(response.data)
    }

    pub async fn set_donate_address(&self, key: &str, value: &str) -> Result<()> {
        let payload = serde_json::json!({
            "key": key,
            "value": value
        });
        self.post::<serde_json::Value>("/api/admin/settings", payload).await?;
        Ok(())
    }

    pub async fn set_announcement_setting(&self, key: &str, value: &str) -> Result<()> {
        let payload = serde_json::json!({
            "key": key,
            "value": value
        });
        self.post::<serde_json::Value>("/api/admin/settings", payload).await?;
        Ok(())
    }
}
