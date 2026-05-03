use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Brief {
    pub project_title: String,
    pub artifact_type: String,
    pub audience: String,
    pub goal: String,
    pub must_include: String,
    pub constraints: String,
    pub tone: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Direction {
    pub id: String,
    pub title: String,
    pub summary: String,
    pub layout_idea: String,
    pub why_it_works: String,
    pub risks: String,
    pub figma_notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratedPrompt {
    pub id: String,
    pub target: String,
    pub title: String,
    pub body: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderSettings {
    pub provider: String,
    pub model: String,
    pub has_api_key: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSummary {
    pub id: String,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
}
