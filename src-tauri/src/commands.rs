use tauri::State;
use uuid::Uuid;

use crate::{
    keychain,
    models::{Brief, Direction, GeneratedPrompt, ProjectSummary, ProviderSettings},
    providers::{self, DEFAULT_OPENAI_MODEL},
    AppState,
};

#[tauri::command]
pub fn get_provider_settings() -> Result<ProviderSettings, String> {
    Ok(ProviderSettings {
        provider: "openai".to_string(),
        model: DEFAULT_OPENAI_MODEL.to_string(),
        has_api_key: keychain::get_api_key("openai")?.is_some(),
    })
}

#[tauri::command]
pub fn set_provider_api_key(provider: String, api_key: String) -> Result<(), String> {
    keychain::set_api_key(&provider, &api_key)
}

#[tauri::command]
pub fn create_project(state: State<AppState>, title: String) -> Result<ProjectSummary, String> {
    let storage = state.storage.lock().map_err(|error| error.to_string())?;
    storage.create_project(&title)
}

#[tauri::command]
pub fn list_projects(state: State<AppState>) -> Result<Vec<ProjectSummary>, String> {
    let storage = state.storage.lock().map_err(|error| error.to_string())?;
    storage.list_projects()
}

#[tauri::command]
pub fn save_brief(state: State<AppState>, project_id: String, brief: Brief) -> Result<(), String> {
    let storage = state.storage.lock().map_err(|error| error.to_string())?;
    storage.save_brief(&project_id, &brief)
}

#[tauri::command]
pub async fn improve_brief(brief: Brief) -> Result<Brief, String> {
    if let Some(api_key) = keychain::get_api_key("openai")? {
        let request = providers::ModelRequest {
            system: "You improve early design briefs. Return concise JSON matching the input fields.".to_string(),
            user: providers::brief_to_context(&brief),
        };

        let response = providers::run_openai_task(&api_key, DEFAULT_OPENAI_MODEL, request).await?;
        if let Ok(improved) = serde_json::from_str::<Brief>(&response.text) {
            return Ok(improved);
        }
    }

    Ok(Brief {
        goal: normalize_sentence(&brief.goal, "Clarify the design problem and produce a strong next action."),
        constraints: append_if_missing(
            &brief.constraints,
            "Keep each prompt scoped to one external agent step."
        ),
        ..brief
    })
}

#[tauri::command]
pub async fn generate_directions(brief: Brief) -> Result<Vec<Direction>, String> {
    Ok(vec![
        Direction {
            id: Uuid::new_v4().to_string(),
            title: "Quiet System".to_string(),
            summary: format!(
                "A restrained {} direction for {} that emphasizes clarity, comparison, and practical next steps.",
                brief.artifact_type, brief.audience
            ),
            layout_idea: "Use a compact workbench with the brief on one side and comparable direction panels on the other.".to_string(),
            why_it_works: "It keeps the designer focused on intent and tradeoffs before asking an agent to create UI in Figma.".to_string(),
            risks: "The interface can feel too operational if visual expression is under-specified.".to_string(),
            figma_notes: "Ask the external agent to create a desktop frame first, then derive smaller responsive states after the hierarchy is approved.".to_string(),
        },
        Direction {
            id: Uuid::new_v4().to_string(),
            title: "Editorial Studio".to_string(),
            summary: "A more expressive angle that frames each design concept as an editorial point of view.".to_string(),
            layout_idea: "Use strong titles, disciplined sections, and a review-like rhythm across concept blocks.".to_string(),
            why_it_works: "It gives fuzzy design assignments enough taste and narrative to produce stronger visual exploration.".to_string(),
            risks: "It can drift into a landing page if the execution prompt does not require real working UI states.".to_string(),
            figma_notes: "Tell the external agent to include the actual product surface in the first viewport, not just a hero treatment.".to_string(),
        },
        Direction {
            id: Uuid::new_v4().to_string(),
            title: "Prompt Console".to_string(),
            summary: "A focused command surface centered on prompt quality, sequencing, and copy handoff.".to_string(),
            layout_idea: "Prioritize a selected direction summary, target-specific prompt output, and a numbered refinement sequence.".to_string(),
            why_it_works: "It reinforces the v1 boundary: Facets prepares instructions while external tools execute them.".to_string(),
            risks: "It may move too quickly into execution before the concept options have been compared.".to_string(),
            figma_notes: "Have the external agent work in a sequence: explore, critique, refine, adapt, annotate, then hand off rationale.".to_string(),
        },
    ])
}

#[tauri::command]
pub async fn generate_prompt(
    brief: Brief,
    direction: Option<Direction>,
    target: String,
) -> Result<GeneratedPrompt, String> {
    let title = direction
        .as_ref()
        .map(|direction| format!("{} execution prompt", direction.title))
        .unwrap_or_else(|| "Design exploration prompt".to_string());

    Ok(GeneratedPrompt {
        id: Uuid::new_v4().to_string(),
        target: target.clone(),
        title,
        body: build_prompt(&brief, direction.as_ref(), &target),
    })
}

#[tauri::command]
pub async fn generate_prompt_sequence(
    brief: Brief,
    direction: Option<Direction>,
    target: String,
) -> Result<Vec<GeneratedPrompt>, String> {
    let steps = [
        "Explore three concept directions in Figma.",
        "Critique the generated concepts against the brief.",
        "Refine the strongest direction.",
        "Create a mobile variation.",
        "Add annotations.",
        "Write rationale and handoff notes.",
    ];

    Ok(steps
        .iter()
        .map(|step| GeneratedPrompt {
            id: Uuid::new_v4().to_string(),
            target: target.clone(),
            title: step.to_string(),
            body: build_sequence_prompt(&brief, direction.as_ref(), &target, step),
        })
        .collect())
}

fn build_prompt(brief: &Brief, direction: Option<&Direction>, target: &str) -> String {
    let direction_block = direction
        .map(|direction| {
            format!(
                "{}\nSummary: {}\nLayout or interaction idea: {}\nWhy it works: {}\nRisks: {}\nFigma notes: {}",
                direction.title,
                direction.summary,
                direction.layout_idea,
                direction.why_it_works,
                direction.risks,
                direction.figma_notes
            )
        })
        .unwrap_or_else(|| "Explore three distinct concept directions before choosing one.".to_string());

    format!(
        "You are helping execute a design exploration in Figma using an MCP-enabled environment.\n\nImportant boundary: Facets prepared this prompt, but Facets does not have direct Figma access. Use your own Figma MCP tools if they are available in {target}.\n\nProject: {project}\nArtifact Type: {artifact}\nAudience: {audience}\nGoal: {goal}\n\nMust include:\n{must_include}\n\nConstraints:\n{constraints}\n\nTone and editorial direction:\n{tone}\n\nSelected concept direction:\n{direction_block}\n\nExecution context:\nThe user will paste this prompt into a separate MCP-enabled tool that can access Figma.\n\nWork in steps:\n1. Inspect or establish the relevant Figma frame context.\n2. Create the first design pass for the selected direction.\n3. Check the result against the brief.\n4. List the strongest elements, weak spots, and the next refinement prompt.",
        target = target,
        project = brief.project_title,
        artifact = brief.artifact_type,
        audience = brief.audience,
        goal = brief.goal,
        must_include = brief.must_include,
        constraints = brief.constraints,
        tone = brief.tone,
        direction_block = direction_block
    )
}

fn build_sequence_prompt(brief: &Brief, direction: Option<&Direction>, target: &str, step: &str) -> String {
    format!(
        "{}\n\nCurrent step: {}\n\nKeep this step scoped. Do not try to complete the full design process in one response.",
        build_prompt(brief, direction, target),
        step
    )
}

fn normalize_sentence(value: &str, fallback: &str) -> String {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        fallback.to_string()
    } else {
        trimmed.to_string()
    }
}

fn append_if_missing(value: &str, addition: &str) -> String {
    if value.contains(addition) {
        value.to_string()
    } else if value.trim().is_empty() {
        addition.to_string()
    } else {
        format!("{}\n{}", value.trim(), addition)
    }
}
