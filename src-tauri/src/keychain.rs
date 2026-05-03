use keyring::Entry;

const SERVICE: &str = "com.facet.workbench";

pub fn set_api_key(provider: &str, api_key: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE, provider).map_err(|error| error.to_string())?;
    entry
        .set_password(api_key)
        .map_err(|error| format!("failed to store provider key: {error}"))
}

pub fn get_api_key(provider: &str) -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE, provider).map_err(|error| error.to_string())?;
    match entry.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(error) => Err(format!("failed to read provider key: {error}")),
    }
}
