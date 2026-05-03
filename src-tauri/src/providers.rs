use serde::{Deserialize, Serialize};

use crate::models::Brief;

pub const DEFAULT_OPENAI_MODEL: &str = "gpt-4.1-mini";

#[derive(Debug, Clone)]
pub struct ModelRequest {
    pub system: String,
    pub user: String,
}

#[derive(Debug, Clone)]
pub struct ModelResponse {
    pub text: String,
}

pub async fn run_openai_task(api_key: &str, model: &str, request: ModelRequest) -> Result<ModelResponse, String> {
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.openai.com/v1/responses")
        .bearer_auth(api_key)
        .json(&OpenAiRequest {
            model,
            input: vec![
                OpenAiInput {
                    role: "system",
                    content: request.system,
                },
                OpenAiInput {
                    role: "user",
                    content: request.user,
                },
            ],
        })
        .send()
        .await
        .map_err(|error| error.to_string())?;

    if !response.status().is_success() {
        return Err(format!("OpenAI request failed with status {}", response.status()));
    }

    let body = response
        .json::<serde_json::Value>()
        .await
        .map_err(|error| error.to_string())?;

    Ok(ModelResponse {
        text: extract_output_text(&body).unwrap_or_default(),
    })
}

pub fn brief_to_context(brief: &Brief) -> String {
    format!(
        "Project: {}\nArtifact: {}\nAudience: {}\nGoal: {}\nMust include: {}\nConstraints: {}\nTone: {}",
        brief.project_title,
        brief.artifact_type,
        brief.audience,
        brief.goal,
        brief.must_include,
        brief.constraints,
        brief.tone
    )
}

fn extract_output_text(value: &serde_json::Value) -> Option<String> {
    value
        .get("output_text")
        .and_then(|text| text.as_str())
        .map(ToString::to_string)
}

#[derive(Debug, Serialize)]
struct OpenAiRequest<'a> {
    model: &'a str,
    input: Vec<OpenAiInput<'a>>,
}

#[derive(Debug, Serialize)]
struct OpenAiInput<'a> {
    role: &'a str,
    content: String,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct OpenAiError {
    error: serde_json::Value,
}
