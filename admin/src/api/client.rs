use anyhow::{Context, Result};
use reqwest::{multipart, Client, Response};
use serde::de::DeserializeOwned;
use std::time::Duration;

use crate::config::Config;

pub struct ApiClient {
    client: Client,
    upload_client: Client,
    base_url: String,
    admin_key: String,
}

impl ApiClient {
    pub fn new(config: &Config) -> Result<Self> {
        let client = Client::builder()
            .timeout(Duration::from_secs(60))
            .build()
            .context("Failed to create HTTP client")?;

        let upload_client = Client::builder()
            .timeout(Duration::from_secs(300))
            .pool_max_idle_per_host(0)
            .build()
            .context("Failed to create upload HTTP client")?;

        Ok(Self {
            client,
            upload_client,
            base_url: config.api_url.trim_end_matches('/').to_string(),
            admin_key: config.admin_key.clone(),
        })
    }

    fn admin_header(&self) -> (&str, &str) {
        ("X-Admin-Key", &self.admin_key)
    }

    pub async fn get<T: DeserializeOwned>(&self, path: &str) -> Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let response = self.client
            .get(&url)
            .header(self.admin_header().0, self.admin_header().1)
            .send()
            .await
            .context("Failed to send GET request")?;

        self.handle_response(response).await
    }

    pub async fn post<T: DeserializeOwned>(&self, path: &str, body: impl serde::Serialize) -> Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let response = self.client
            .post(&url)
            .header(self.admin_header().0, self.admin_header().1)
            .json(&body)
            .send()
            .await
            .context("Failed to send POST request")?;

        self.handle_response(response).await
    }

    pub async fn post_multipart<T: DeserializeOwned>(&self, path: &str, form: multipart::Form) -> Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let response = self.upload_client
            .post(&url)
            .header(self.admin_header().0, self.admin_header().1)
            .multipart(form)
            .send()
            .await
            .context("Failed to send multipart POST request")?;

        self.handle_response(response).await
    }

    pub async fn put_multipart<T: DeserializeOwned>(&self, path: &str, form: multipart::Form) -> Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let response = self.upload_client
            .put(&url)
            .header(self.admin_header().0, self.admin_header().1)
            .multipart(form)
            .send()
            .await
            .context("Failed to send multipart PUT request")?;

        self.handle_response(response).await
    }

    pub async fn delete(&self, path: &str) -> Result<()> {
        let url = format!("{}{}", self.base_url, path);
        let response = self.client
            .delete(&url)
            .header(self.admin_header().0, self.admin_header().1)
            .send()
            .await
            .context("Failed to send DELETE request")?;

        if response.status().is_success() {
            Ok(())
        } else {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("Request failed with status {}: {}", status, body);
        }
    }

    async fn handle_response<T: DeserializeOwned>(&self, response: Response) -> Result<T> {
        let status = response.status();
        
        if status.is_success() {
            response.json::<T>().await
                .context("Failed to parse JSON response")
        } else {
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("Request failed with status {}: {}", status, body);
        }
    }
}
