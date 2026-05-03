use std::{fs, path::PathBuf};

use rusqlite::{params, Connection};
use time::OffsetDateTime;
use uuid::Uuid;

use crate::models::{Brief, ProjectSummary};

pub struct Storage {
    conn: Connection,
}

impl Storage {
    pub fn open() -> Result<Self, String> {
        let db_path = database_path()?;
        if let Some(parent) = db_path.parent() {
            fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        }

        let conn = Connection::open(db_path).map_err(|error| error.to_string())?;
        let storage = Self { conn };
        storage.migrate()?;
        Ok(storage)
    }

    fn migrate(&self) -> Result<(), String> {
        self.conn
            .execute_batch(
                "
                create table if not exists projects (
                    id text primary key,
                    title text not null,
                    created_at text not null,
                    updated_at text not null
                );

                create table if not exists briefs (
                    project_id text primary key,
                    payload text not null,
                    updated_at text not null,
                    foreign key(project_id) references projects(id) on delete cascade
                );

                create table if not exists directions (
                    id text primary key,
                    project_id text not null,
                    payload text not null,
                    created_at text not null,
                    foreign key(project_id) references projects(id) on delete cascade
                );

                create table if not exists generated_prompts (
                    id text primary key,
                    project_id text,
                    target text not null,
                    payload text not null,
                    created_at text not null,
                    foreign key(project_id) references projects(id) on delete cascade
                );

                create table if not exists settings (
                    key text primary key,
                    value text not null
                );
                ",
            )
            .map_err(|error| error.to_string())
    }

    pub fn create_project(&self, title: &str) -> Result<ProjectSummary, String> {
        let now = now_string();
        let id = Uuid::new_v4().to_string();

        self.conn
            .execute(
                "insert into projects (id, title, created_at, updated_at) values (?1, ?2, ?3, ?4)",
                params![id, title, now, now],
            )
            .map_err(|error| error.to_string())?;

        Ok(ProjectSummary {
            id,
            title: title.to_string(),
            created_at: now,
            updated_at: now,
        })
    }

    pub fn list_projects(&self) -> Result<Vec<ProjectSummary>, String> {
        let mut statement = self
            .conn
            .prepare("select id, title, created_at, updated_at from projects order by updated_at desc")
            .map_err(|error| error.to_string())?;

        let rows = statement
            .query_map([], |row| {
                Ok(ProjectSummary {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    created_at: row.get(2)?,
                    updated_at: row.get(3)?,
                })
            })
            .map_err(|error| error.to_string())?;

        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|error| error.to_string())
    }

    pub fn save_brief(&self, project_id: &str, brief: &Brief) -> Result<(), String> {
        let payload = serde_json::to_string(brief).map_err(|error| error.to_string())?;
        let now = now_string();

        self.conn
            .execute(
                "
                insert into briefs (project_id, payload, updated_at) values (?1, ?2, ?3)
                on conflict(project_id) do update set payload = excluded.payload, updated_at = excluded.updated_at
                ",
                params![project_id, payload, now],
            )
            .map_err(|error| error.to_string())?;

        self.conn
            .execute(
                "update projects set title = ?1, updated_at = ?2 where id = ?3",
                params![brief.project_title, now, project_id],
            )
            .map_err(|error| error.to_string())?;

        Ok(())
    }
}

fn database_path() -> Result<PathBuf, String> {
    let base = dirs::data_local_dir().ok_or_else(|| "could not resolve local data directory".to_string())?;
    Ok(base.join("Facets").join("facets.sqlite3"))
}

fn now_string() -> String {
    OffsetDateTime::now_utc()
        .format(&time::format_description::well_known::Rfc3339)
        .unwrap_or_else(|_| "1970-01-01T00:00:00Z".to_string())
}
