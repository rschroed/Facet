mod commands;
mod keychain;
mod models;
mod providers;
mod storage;

use std::sync::Mutex;

use storage::Storage;

pub struct AppState {
    storage: Mutex<Storage>,
}

impl AppState {
    fn new() -> Result<Self, String> {
        Ok(Self {
            storage: Mutex::new(Storage::open()?),
        })
    }
}

pub fn run() {
    let state = AppState::new().expect("failed to initialize Facets storage");

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::get_provider_settings,
            commands::set_provider_api_key,
            commands::create_project,
            commands::list_projects,
            commands::save_brief,
            commands::improve_brief,
            commands::generate_directions,
            commands::generate_prompt,
            commands::generate_prompt_sequence
        ])
        .run(tauri::generate_context!())
        .expect("error while running Facets");
}
