#include "core/storage/Database.h"

#include <chrono>
#include <iostream>

#include "core/ipc/Json.h"

namespace sentinel {

Database::Database(const std::string& dbPath)
{
    int rc = sqlite3_open(dbPath.c_str(), &db_);
    if (rc != SQLITE_OK) {
        std::cerr << "[Database] Failed to open SQLite database at: " << dbPath
                  << " Error: " << sqlite3_errmsg(db_) << std::endl;
    }
}

Database::~Database()
{
    if (eventBus_ && !subscriptions_.empty()) {
        for (const auto& subId : subscriptions_) {
            eventBus_->unsubscribe(subId);
        }
    }
    if (db_) {
        sqlite3_close(db_);
        db_ = nullptr;
    }
}

Expected<void, Error> Database::executeQuery(const std::string& sql)
{
    char* errMessage = nullptr;
    int rc = sqlite3_exec(db_, sql.c_str(), nullptr, nullptr, &errMessage);
    if (rc != SQLITE_OK) {
        std::string errStr = errMessage ? errMessage : "Unknown sqlite3_exec error";
        if (errMessage) {
            sqlite3_free(errMessage);
        }
        return Unexpected<Error>({.message = errStr, .code = rc});
    }
    return {};
}

Expected<void, Error> Database::InitializeSchema()
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* pSql =
        "CREATE TABLE IF NOT EXISTS projects ("
        "id TEXT PRIMARY KEY, "
        "name TEXT NOT NULL, "
        "path TEXT NOT NULL UNIQUE, "
        "language TEXT NOT NULL, "
        "git_status TEXT, "
        "branch TEXT, "
        "quality REAL DEFAULT 100.0, "
        "status TEXT DEFAULT 'active', "
        "total_files INTEGER DEFAULT 0, "
        "total_lines INTEGER DEFAULT 0, "
        "total_issues INTEGER DEFAULT 0);";
    auto res = executeQuery(pSql);
    if (!res) {
        return res;
    }

    const char* sSql =
        "CREATE TABLE IF NOT EXISTS scans ("
        "id TEXT PRIMARY KEY, "
        "project_id TEXT NOT NULL, "
        "status TEXT NOT NULL, "
        "start_time INTEGER DEFAULT 0, "
        "end_time INTEGER DEFAULT 0, "
        "total_issues_found INTEGER DEFAULT 0, "
        "FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE);";
    res = executeQuery(sSql);
    if (!res) {
        return res;
    }

    const char* iSql =
        "CREATE TABLE IF NOT EXISTS issues ("
        "id TEXT PRIMARY KEY, "
        "scan_id TEXT NOT NULL, "
        "project_id TEXT NOT NULL, "
        "title TEXT NOT NULL, "
        "description TEXT NOT NULL, "
        "severity INTEGER NOT NULL, "
        "confidence INTEGER NOT NULL, "
        "category TEXT NOT NULL, "
        "analyzer_id TEXT NOT NULL, "
        "rule_id TEXT NOT NULL, "
        "file_path TEXT NOT NULL, "
        "line_number INTEGER NOT NULL, "
        "column_number INTEGER NOT NULL, "
        "length INTEGER NOT NULL, "
        "impact TEXT, "
        "status INTEGER NOT NULL, "
        "owner TEXT, "
        "fix_id TEXT, "
        "fix_description TEXT, "
        "fix_actions_json TEXT, "
        "FOREIGN KEY(scan_id) REFERENCES scans(id) ON DELETE CASCADE, "
        "FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE);";
    res = executeQuery(iSql);
    if (!res) {
        return res;
    }

    const char* qSql =
        "CREATE TABLE IF NOT EXISTS quality_snapshots ("
        "id TEXT PRIMARY KEY, "
        "project_id TEXT NOT NULL, "
        "scan_id TEXT NOT NULL, "
        "overall REAL DEFAULT 100.0, "
        "performance REAL DEFAULT 100.0, "
        "memory REAL DEFAULT 100.0, "
        "security REAL DEFAULT 100.0, "
        "architecture REAL DEFAULT 100.0, "
        "maintainability REAL DEFAULT 100.0, "
        "readability REAL DEFAULT 100.0, "
        "compliance REAL DEFAULT 100.0, "
        "confidence REAL DEFAULT 100.0, "
        "recorded_at INTEGER DEFAULT 0, "
        "FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE, "
        "FOREIGN KEY(scan_id) REFERENCES scans(id) ON DELETE CASCADE);";
    res = executeQuery(qSql);
    if (!res) {
        return res;
    }

    const char* rSql =
        "CREATE TABLE IF NOT EXISTS recommendations ("
        "id TEXT PRIMARY KEY, "
        "project_id TEXT NOT NULL, "
        "title TEXT NOT NULL, "
        "description TEXT NOT NULL, "
        "origin TEXT NOT NULL, "
        "file_id TEXT NOT NULL, "
        "line_number INTEGER NOT NULL, "
        "matched_pattern TEXT, "
        "explanation_simple TEXT, "
        "explanation_technical TEXT, "
        "explanation_expert TEXT, "
        "confidence_score REAL DEFAULT 0.0, "
        "confidence_level TEXT, "
        "safe_automation_level TEXT, "
        "preview_current_code TEXT, "
        "preview_suggested_code TEXT, "
        "preview_diff TEXT, "
        "rollback_support INTEGER DEFAULT 0, "
        "why_now_reasons_json TEXT, "
        "blast_radius_files INTEGER DEFAULT 0, "
        "blast_radius_module TEXT, "
        "blast_radius_public_api_changed INTEGER DEFAULT 0, "
        "blast_radius_tests_impacted INTEGER DEFAULT 0, "
        "blast_radius_binary_compatibility TEXT, "
        "learning_concept TEXT, "
        "learning_rationale TEXT, "
        "learning_best_practice TEXT, "
        "learning_references_json TEXT, "
        "FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE);";
    res = executeQuery(rSql);
    if (!res) {
        return res;
    }

    return {};
}

Expected<void, Error> Database::SaveProject(const Project& project)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "INSERT OR REPLACE INTO projects (id, name, path, language, git_status, branch, quality, "
        "status, total_files, total_lines, total_issues) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    sqlite3_bind_text(stmt, 1, project.id.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, project.name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, project.path.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, project.language.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, project.gitStatus.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 6, project.branch.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_double(stmt, 7, project.quality);
    sqlite3_bind_text(stmt, 8, project.status.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 9, project.totalFiles);
    sqlite3_bind_int(stmt, 10, project.totalLines);
    sqlite3_bind_int(stmt, 11, project.totalIssues);

    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc != SQLITE_DONE) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }
    return {};
}

Expected<Project, Error> Database::GetProject(const ProjectId& projectId)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "SELECT id, name, path, language, git_status, branch, quality, status, total_files, "
        "total_lines, total_issues FROM projects WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    sqlite3_bind_text(stmt, 1, projectId.value().c_str(), -1, SQLITE_TRANSIENT);

    rc = sqlite3_step(stmt);
    if (rc == SQLITE_ROW) {
        Project project;
        project.id = ProjectId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0)));
        project.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        project.path = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        project.language = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));

        auto git_status_raw = sqlite3_column_text(stmt, 4);
        project.gitStatus = git_status_raw ? reinterpret_cast<const char*>(git_status_raw) : "";

        auto branch_raw = sqlite3_column_text(stmt, 5);
        project.branch = branch_raw ? reinterpret_cast<const char*>(branch_raw) : "";

        project.quality = sqlite3_column_double(stmt, 6);
        project.status = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7));
        project.totalFiles = sqlite3_column_int(stmt, 8);
        project.totalLines = sqlite3_column_int(stmt, 9);
        project.totalIssues = sqlite3_column_int(stmt, 10);

        sqlite3_finalize(stmt);
        return project;
    }

    sqlite3_finalize(stmt);
    return Unexpected<Error>({.message = "Project not found", .code = 404});
}

Expected<std::vector<Project>, Error> Database::GetProjects()
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "SELECT id, name, path, language, git_status, branch, quality, status, total_files, "
        "total_lines, total_issues FROM projects;";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    std::vector<Project> projects;
    while ((rc = sqlite3_step(stmt)) == SQLITE_ROW) {
        Project project;
        project.id = ProjectId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0)));
        project.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        project.path = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        project.language = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));

        auto git_status_raw = sqlite3_column_text(stmt, 4);
        project.gitStatus = git_status_raw ? reinterpret_cast<const char*>(git_status_raw) : "";

        auto branch_raw = sqlite3_column_text(stmt, 5);
        project.branch = branch_raw ? reinterpret_cast<const char*>(branch_raw) : "";

        project.quality = sqlite3_column_double(stmt, 6);
        project.status = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7));
        project.totalFiles = sqlite3_column_int(stmt, 8);
        project.totalLines = sqlite3_column_int(stmt, 9);
        project.totalIssues = sqlite3_column_int(stmt, 10);
        projects.push_back(project);
    }

    sqlite3_finalize(stmt);
    return projects;
}

Expected<void, Error> Database::SaveScan(const Scan& scan)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "INSERT OR REPLACE INTO scans (id, project_id, status, start_time, end_time) VALUES (?, ?, "
        "?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    sqlite3_bind_text(stmt, 1, scan.id.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, scan.projectId.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, scan.status.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int64(stmt, 4, scan.startTime);
    sqlite3_bind_int64(stmt, 5, scan.endTime);

    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc != SQLITE_DONE) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }
    return {};
}

Expected<Scan, Error> Database::GetScan(const ScanId& scanId)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "SELECT id, project_id, status, start_time, end_time FROM scans WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    sqlite3_bind_text(stmt, 1, scanId.value().c_str(), -1, SQLITE_TRANSIENT);

    rc = sqlite3_step(stmt);
    if (rc == SQLITE_ROW) {
        Scan scan;
        scan.id = ScanId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0)));
        scan.projectId = ProjectId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1)));
        scan.status = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        scan.startTime = sqlite3_column_int64(stmt, 3);
        scan.endTime = sqlite3_column_int64(stmt, 4);

        sqlite3_finalize(stmt);
        return scan;
    }

    sqlite3_finalize(stmt);
    return Unexpected<Error>({.message = "Scan not found", .code = 404});
}

Expected<void, Error> Database::SaveIssue(const ProjectId& projectId,
                                          const ScanId& scanId,
                                          const Issue& issue)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "INSERT OR REPLACE INTO issues (id, scan_id, project_id, title, description, severity, "
        "confidence, category, analyzer_id, rule_id, file_path, line_number, column_number, "
        "length, impact, status, owner, fix_id, fix_description, fix_actions_json) VALUES (?, ?, "
        "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    std::vector<Json> jsonActions;
    for (const auto& action : issue.fix.actions) {
        std::unordered_map<std::string, Json> actionObj;
        actionObj["type"] = action.type;
        actionObj["estimatedTime"] = action.estimatedTime;
        actionObj["risk"] = static_cast<int>(action.risk);
        actionObj["safe"] = action.safe;
        actionObj["impact"] = action.impact;
        actionObj["description"] = action.description;
        actionObj["preview"] = action.preview;
        actionObj["undoStrategy"] = action.undoStrategy;
        jsonActions.push_back(Json(actionObj));
    }
    std::string actionsJsonStr = Json(jsonActions).serialize();

    sqlite3_bind_text(stmt, 1, issue.id.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, scanId.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, projectId.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, issue.title.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, issue.description.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 6, static_cast<int>(issue.severity));
    sqlite3_bind_int(stmt, 7, static_cast<int>(issue.confidence));
    sqlite3_bind_text(stmt, 8, issue.category.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 9, issue.analyzerId.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 10, issue.ruleId.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 11, issue.location.fileId.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 12, issue.location.line);
    sqlite3_bind_int(stmt, 13, issue.location.column);
    sqlite3_bind_int(stmt, 14, issue.location.length);
    sqlite3_bind_text(stmt, 15, issue.impact.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 16, static_cast<int>(issue.status));
    sqlite3_bind_text(stmt, 17, issue.owner.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 18, issue.fix.id.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 19, issue.fix.description.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 20, actionsJsonStr.c_str(), -1, SQLITE_TRANSIENT);

    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc != SQLITE_DONE) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }
    return {};
}

Expected<std::vector<Issue>, Error> Database::GetIssues(const ProjectId& projectId)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "SELECT id, title, description, severity, confidence, category, analyzer_id, rule_id, "
        "file_path, line_number, column_number, length, impact, status, owner, fix_id, "
        "fix_description, fix_actions_json FROM issues WHERE project_id = ?;";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    sqlite3_bind_text(stmt, 1, projectId.value().c_str(), -1, SQLITE_TRANSIENT);

    std::vector<Issue> issues;
    while ((rc = sqlite3_step(stmt)) == SQLITE_ROW) {
        Issue issue;
        issue.id = IssueId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0)));
        issue.title = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        issue.description = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        issue.severity = static_cast<Severity>(sqlite3_column_int(stmt, 3));
        issue.confidence = static_cast<Confidence>(sqlite3_column_int(stmt, 4));
        issue.category = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
        issue.analyzerId = AnalyzerId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6)));
        issue.ruleId = RuleId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7)));

        Location loc;
        loc.fileId = FileId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8)));
        loc.line = sqlite3_column_int(stmt, 9);
        loc.column = sqlite3_column_int(stmt, 10);
        loc.length = sqlite3_column_int(stmt, 11);
        issue.location = loc;

        auto impact_raw = sqlite3_column_text(stmt, 12);
        issue.impact = impact_raw ? reinterpret_cast<const char*>(impact_raw) : "";

        issue.status = static_cast<IssueStatus>(sqlite3_column_int(stmt, 13));

        auto owner_raw = sqlite3_column_text(stmt, 14);
        issue.owner = owner_raw ? reinterpret_cast<const char*>(owner_raw) : "";

        Fix fix;
        auto fix_id_raw = sqlite3_column_text(stmt, 15);
        fix.id = FixId(fix_id_raw ? reinterpret_cast<const char*>(fix_id_raw) : "");
        fix.issueId = issue.id;

        auto fix_desc_raw = sqlite3_column_text(stmt, 16);
        fix.description = fix_desc_raw ? reinterpret_cast<const char*>(fix_desc_raw) : "";

        auto actions_json_raw = sqlite3_column_text(stmt, 17);
        std::string actionsJsonStr =
            actions_json_raw ? reinterpret_cast<const char*>(actions_json_raw) : "";

        std::vector<Action> actions;
        if (!actionsJsonStr.empty()) {
            try {
                Json parsed = Json::parse(actionsJsonStr);
                if (parsed.is_array()) {
                    for (const auto& actionJson : parsed.as_array()) {
                        if (actionJson.is_object()) {
                            Action action;
                            action.type = actionJson.get_string("type");
                            action.estimatedTime = actionJson.get_number("estimatedTime");
                            action.risk = static_cast<Severity>(
                                static_cast<int>(actionJson.get_number("risk")));
                            action.safe = actionJson.get_bool("safe");
                            action.impact = actionJson.get_number("impact");
                            action.description = actionJson.get_string("description");
                            action.preview = actionJson.get_string("preview");
                            action.undoStrategy = actionJson.get_string("undoStrategy");
                            actions.push_back(action);
                        }
                    }
                }
            } catch (...) {
            }
        }
        fix.actions = actions;
        issue.fix = fix;

        issues.push_back(issue);
    }

    sqlite3_finalize(stmt);
    return issues;
}

Expected<void, Error> Database::ResolveIssue(const IssueId& issueId)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql = "UPDATE issues SET status = ? WHERE id = ?;";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    sqlite3_bind_int(stmt, 1, static_cast<int>(IssueStatus::Resolved));
    sqlite3_bind_text(stmt, 2, issueId.value().c_str(), -1, SQLITE_TRANSIENT);

    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc != SQLITE_DONE) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }
    return {};
}

Expected<void, Error> Database::SaveQualitySnapshot(const QualitySnapshot& snapshot)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "INSERT OR REPLACE INTO quality_snapshots (id, project_id, scan_id, overall, performance, "
        "memory, security, architecture, maintainability, readability, compliance, confidence, "
        "recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    uint64_t now = std::chrono::duration_cast<std::chrono::milliseconds>(
                       std::chrono::system_clock::now().time_since_epoch())
                       .count();

    sqlite3_bind_text(stmt, 1, snapshot.id.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, snapshot.projectId.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, "n/a", -1, SQLITE_TRANSIENT);
    sqlite3_bind_double(stmt, 4, snapshot.overall);
    sqlite3_bind_double(stmt, 5, snapshot.performance);
    sqlite3_bind_double(stmt, 6, snapshot.memory);
    sqlite3_bind_double(stmt, 7, snapshot.security);
    sqlite3_bind_double(stmt, 8, snapshot.architecture);
    sqlite3_bind_double(stmt, 9, snapshot.maintainability);
    sqlite3_bind_double(stmt, 10, snapshot.readability);
    sqlite3_bind_double(stmt, 11, snapshot.compliance);
    sqlite3_bind_double(stmt, 12, snapshot.confidence);
    sqlite3_bind_int64(stmt, 13, now);

    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc != SQLITE_DONE) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }
    return {};
}

Expected<std::vector<QualitySnapshot>, Error> Database::GetQualityHistory(
    const ProjectId& projectId)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "SELECT id, project_id, overall, performance, memory, security, architecture, "
        "maintainability, readability, compliance, confidence FROM quality_snapshots WHERE "
        "project_id = ? ORDER BY recorded_at ASC;";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    sqlite3_bind_text(stmt, 1, projectId.value().c_str(), -1, SQLITE_TRANSIENT);

    std::vector<QualitySnapshot> history;
    while ((rc = sqlite3_step(stmt)) == SQLITE_ROW) {
        QualitySnapshot snapshot;
        snapshot.id =
            QualitySnapshotId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0)));
        snapshot.projectId = ProjectId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1)));
        snapshot.overall = sqlite3_column_double(stmt, 2);
        snapshot.performance = sqlite3_column_double(stmt, 3);
        snapshot.memory = sqlite3_column_double(stmt, 4);
        snapshot.security = sqlite3_column_double(stmt, 5);
        snapshot.architecture = sqlite3_column_double(stmt, 6);
        snapshot.maintainability = sqlite3_column_double(stmt, 7);
        snapshot.readability = sqlite3_column_double(stmt, 8);
        snapshot.compliance = sqlite3_column_double(stmt, 9);
        snapshot.confidence = sqlite3_column_double(stmt, 10);
        history.push_back(snapshot);
    }

    sqlite3_finalize(stmt);
    return history;
}

Expected<void, Error> Database::SaveRecommendation(const ProjectId& projectId,
                                                   const Recommendation& rec)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "INSERT OR REPLACE INTO recommendations (id, project_id, title, description, origin, "
        "file_id, line_number, matched_pattern, explanation_simple, explanation_technical, "
        "explanation_expert, confidence_score, confidence_level, safe_automation_level, "
        "preview_current_code, preview_suggested_code, preview_diff, rollback_support, "
        "why_now_reasons_json, blast_radius_files, blast_radius_module, "
        "blast_radius_public_api_changed, blast_radius_tests_impacted, "
        "blast_radius_binary_compatibility, learning_concept, learning_rationale, "
        "learning_best_practice, learning_references_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "
        "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    std::vector<Json> reasonsJson;
    for (const auto& r : rec.whyNowReasons) {
        reasonsJson.push_back(Json(r));
    }
    std::string reasonsJsonStr = Json(reasonsJson).serialize();

    std::vector<Json> refsJson;
    for (const auto& r : rec.learningReferences) {
        refsJson.push_back(Json(r));
    }
    std::string refsJsonStr = Json(refsJson).serialize();

    sqlite3_bind_text(stmt, 1, rec.id.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, projectId.value().c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, rec.title.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, rec.description.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, rec.origin.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 6, rec.fileId.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 7, rec.line);
    sqlite3_bind_text(stmt, 8, rec.matchedPattern.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 9, rec.explanationSimple.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 10, rec.explanationTechnical.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 11, rec.explanationExpert.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_double(stmt, 12, rec.confidenceScore);
    sqlite3_bind_text(stmt, 13, rec.confidenceLevel.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 14, rec.safeAutomationLevel.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 15, rec.previewCurrentCode.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 16, rec.previewSuggestedCode.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 17, rec.previewDiff.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 18, rec.rollbackSupport ? 1 : 0);
    sqlite3_bind_text(stmt, 19, reasonsJsonStr.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 20, rec.blastRadiusAffectedFiles);
    sqlite3_bind_text(stmt, 21, rec.blastRadiusAffectedModule.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 22, rec.blastRadiusPublicApiChanged ? 1 : 0);
    sqlite3_bind_int(stmt, 23, rec.blastRadiusTestsImpacted);
    sqlite3_bind_text(stmt, 24, rec.blastRadiusBinaryCompatibility.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 25, rec.learningConcept.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 26, rec.learningRationale.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 27, rec.learningBestPractice.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 28, refsJsonStr.c_str(), -1, SQLITE_TRANSIENT);

    rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (rc != SQLITE_DONE) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }
    return {};
}

Expected<std::vector<Recommendation>, Error> Database::GetRecommendations(
    const ProjectId& projectId)
{
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) {
        return Unexpected<Error>({.message = "Database not open", .code = 500});
    }

    const char* sql =
        "SELECT id, title, description, origin, file_id, line_number, matched_pattern, "
        "explanation_simple, explanation_technical, explanation_expert, confidence_score, "
        "confidence_level, safe_automation_level, preview_current_code, preview_suggested_code, "
        "preview_diff, rollback_support, why_now_reasons_json, blast_radius_files, "
        "blast_radius_module, blast_radius_public_api_changed, blast_radius_tests_impacted, "
        "blast_radius_binary_compatibility, learning_concept, learning_rationale, "
        "learning_best_practice, learning_references_json FROM recommendations WHERE project_id = "
        "?;";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }

    sqlite3_bind_text(stmt, 1, projectId.value().c_str(), -1, SQLITE_TRANSIENT);

    std::vector<Recommendation> recs;
    while ((rc = sqlite3_step(stmt)) == SQLITE_ROW) {
        Recommendation rec;
        rec.id = RecommendationId(reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0)));
        rec.title = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        rec.description = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        rec.origin = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        rec.fileId = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        rec.line = sqlite3_column_int(stmt, 5);
        rec.matchedPattern = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6));
        rec.explanationSimple = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7));
        rec.explanationTechnical = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8));
        rec.explanationExpert = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 9));
        rec.confidenceScore = sqlite3_column_double(stmt, 10);
        rec.confidenceLevel = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 11));
        rec.safeAutomationLevel = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 12));
        rec.previewCurrentCode = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 13));
        rec.previewSuggestedCode = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 14));
        rec.previewDiff = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 15));
        rec.rollbackSupport = sqlite3_column_int(stmt, 16) != 0;

        auto reasons_json_raw = sqlite3_column_text(stmt, 17);
        std::string reasonsJsonStr =
            reasons_json_raw ? reinterpret_cast<const char*>(reasons_json_raw) : "";
        std::vector<std::string> reasons;
        if (!reasonsJsonStr.empty()) {
            try {
                Json parsed = Json::parse(reasonsJsonStr);
                if (parsed.is_array()) {
                    for (const auto& item : parsed.as_array()) {
                        if (item.is_string()) {
                            reasons.push_back(item.as_string());
                        }
                    }
                }
            } catch (...) {
            }
        }
        rec.whyNowReasons = reasons;

        rec.blastRadiusAffectedFiles = sqlite3_column_int(stmt, 18);
        rec.blastRadiusAffectedModule =
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 19));
        rec.blastRadiusPublicApiChanged = sqlite3_column_int(stmt, 20) != 0;
        rec.blastRadiusTestsImpacted = sqlite3_column_int(stmt, 21);
        rec.blastRadiusBinaryCompatibility =
            reinterpret_cast<const char*>(sqlite3_column_text(stmt, 22));
        rec.learningConcept = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 23));
        rec.learningRationale = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 24));
        rec.learningBestPractice = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 25));

        auto refs_json_raw = sqlite3_column_text(stmt, 26);
        std::string refsJsonStr = refs_json_raw ? reinterpret_cast<const char*>(refs_json_raw) : "";
        std::vector<std::string> refs;
        if (!refsJsonStr.empty()) {
            try {
                Json parsed = Json::parse(refsJsonStr);
                if (parsed.is_array()) {
                    for (const auto& item : parsed.as_array()) {
                        if (item.is_string()) {
                            refs.push_back(item.as_string());
                        }
                    }
                }
            } catch (...) {
            }
        }
        rec.learningReferences = refs;

        recs.push_back(rec);
    }

    sqlite3_finalize(stmt);
    return recs;
}

Expected<void, Error> Database::RecalculateQuality(const ProjectId& projectId, const ScanId& scanId)
{
    const char* sql = "SELECT severity, category FROM issues WHERE project_id = ? AND status = 0;";
    sqlite3_stmt* stmt = nullptr;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        return Unexpected<Error>({.message = sqlite3_errmsg(db_), .code = rc});
    }
    sqlite3_bind_text(stmt, 1, projectId.value().c_str(), -1, SQLITE_TRANSIENT);

    double overall = 100.0;
    double performance = 100.0;
    double memory = 100.0;
    double security = 100.0;
    double architecture = 100.0;
    double maintainability = 100.0;
    double readability = 100.0;
    double compliance = 100.0;
    double confidence = 100.0;

    int totalOpenIssues = 0;

    while ((rc = sqlite3_step(stmt)) == SQLITE_ROW) {
        int severity = sqlite3_column_int(stmt, 0);
        std::string category = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        totalOpenIssues++;

        double deduction = 0.0;
        if (severity == 4) {
            deduction = 15.0;
        } else if (severity == 3) {
            deduction = 8.0;
        } else if (severity == 2) {
            deduction = 4.0;
        } else if (severity == 1) {
            deduction = 1.0;
        }

        overall -= deduction;

        if (category == "Performance") {
            performance -= deduction;
        } else if (category == "Memory") {
            memory -= deduction;
        } else if (category == "Security") {
            security -= deduction;
        } else if (category == "Architecture") {
            architecture -= deduction;
        } else if (category == "Maintainability") {
            maintainability -= deduction;
        } else if (category == "Readability") {
            readability -= deduction;
        } else if (category == "Compliance") {
            compliance -= deduction;
        }
    }
    sqlite3_finalize(stmt);

    auto clamp = [](double v) {
        if (v < 0.0)
            return 0.0;
        if (v > 100.0)
            return 100.0;
        return v;
    };

    overall = clamp(overall);
    performance = clamp(performance);
    memory = clamp(memory);
    security = clamp(security);
    architecture = clamp(architecture);
    maintainability = clamp(maintainability);
    readability = clamp(readability);
    compliance = clamp(compliance);
    confidence = clamp(confidence);

    QualitySnapshot snapshot;
    snapshot.id = QualitySnapshotId(projectId.value() + "-" + scanId.value());
    snapshot.projectId = projectId;
    snapshot.overall = overall;
    snapshot.performance = performance;
    snapshot.memory = memory;
    snapshot.security = security;
    snapshot.architecture = architecture;
    snapshot.maintainability = maintainability;
    snapshot.readability = readability;
    snapshot.compliance = compliance;
    snapshot.confidence = confidence;

    const char* snapSql =
        "INSERT OR REPLACE INTO quality_snapshots (id, project_id, scan_id, overall, performance, "
        "memory, security, architecture, maintainability, readability, compliance, confidence, "
        "recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    sqlite3_stmt* snapStmt = nullptr;
    rc = sqlite3_prepare_v2(db_, snapSql, -1, &snapStmt, nullptr);
    if (rc == SQLITE_OK) {
        uint64_t now = std::chrono::duration_cast<std::chrono::milliseconds>(
                           std::chrono::system_clock::now().time_since_epoch())
                           .count();
        sqlite3_bind_text(snapStmt, 1, snapshot.id.value().c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(snapStmt, 2, projectId.value().c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(snapStmt, 3, scanId.value().c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_double(snapStmt, 4, overall);
        sqlite3_bind_double(snapStmt, 5, performance);
        sqlite3_bind_double(snapStmt, 6, memory);
        sqlite3_bind_double(snapStmt, 7, security);
        sqlite3_bind_double(snapStmt, 8, architecture);
        sqlite3_bind_double(snapStmt, 9, maintainability);
        sqlite3_bind_double(snapStmt, 10, readability);
        sqlite3_bind_double(snapStmt, 11, compliance);
        sqlite3_bind_double(snapStmt, 12, confidence);
        sqlite3_bind_int64(snapStmt, 13, now);
        sqlite3_step(snapStmt);
        sqlite3_finalize(snapStmt);
    }

    const char* projSql = "UPDATE projects SET quality = ?, total_issues = ? WHERE id = ?;";
    sqlite3_stmt* projStmt = nullptr;
    rc = sqlite3_prepare_v2(db_, projSql, -1, &projStmt, nullptr);
    if (rc == SQLITE_OK) {
        sqlite3_bind_double(projStmt, 1, overall);
        sqlite3_bind_int(projStmt, 2, totalOpenIssues);
        sqlite3_bind_text(projStmt, 3, projectId.value().c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_step(projStmt);
        sqlite3_finalize(projStmt);
    }

    return {};
}

void Database::BindToEventBus(EventBus& eventBus)
{
    eventBus_ = &eventBus;

    auto subStarted = eventBus.subscribe<ScanStarted>([this](const ScanStarted& ev) {
        {
            std::lock_guard<std::mutex> lock(dbMutex_);
            if (db_) {
                const char* projSql = "UPDATE projects SET status = 'scanning' WHERE id = ?;";
                sqlite3_stmt* projStmt = nullptr;
                if (sqlite3_prepare_v2(db_, projSql, -1, &projStmt, nullptr) == SQLITE_OK) {
                    sqlite3_bind_text(
                        projStmt, 1, ev.projectId.value().c_str(), -1, SQLITE_TRANSIENT);
                    sqlite3_step(projStmt);
                    sqlite3_finalize(projStmt);
                }
            }
        }

        Scan scan;
        scan.id = ev.scanId;
        scan.projectId = ev.projectId;
        scan.startTime = ev.timestamp;
        scan.status = "scanning";
        (void)SaveScan(scan);
    });
    subscriptions_.push_back(subStarted);

    auto subIssue = eventBus.subscribe<IssueFound>(
        [this](const IssueFound& ev) { (void)SaveIssue(ev.projectId, ev.scanId, ev.issue); });
    subscriptions_.push_back(subIssue);

    auto subCompleted = eventBus.subscribe<ScanCompleted>([this](const ScanCompleted& ev) {
        {
            std::lock_guard<std::mutex> lock(dbMutex_);
            if (db_) {
                const char* scanSql =
                    "UPDATE scans SET status = ?, end_time = ?, total_issues_found = ? WHERE id = "
                    "?;";
                sqlite3_stmt* scanStmt = nullptr;
                if (sqlite3_prepare_v2(db_, scanSql, -1, &scanStmt, nullptr) == SQLITE_OK) {
                    sqlite3_bind_text(
                        scanStmt, 1, ev.success ? "completed" : "failed", -1, SQLITE_TRANSIENT);
                    sqlite3_bind_int64(scanStmt, 2, ev.timestamp);
                    sqlite3_bind_int(scanStmt, 3, ev.totalIssuesFound);
                    sqlite3_bind_text(scanStmt, 4, ev.scanId.value().c_str(), -1, SQLITE_TRANSIENT);
                    sqlite3_step(scanStmt);
                    sqlite3_finalize(scanStmt);
                }

                const char* projSql = "UPDATE projects SET status = ? WHERE id = ?;";
                sqlite3_stmt* projStmt = nullptr;
                if (sqlite3_prepare_v2(db_, projSql, -1, &projStmt, nullptr) == SQLITE_OK) {
                    sqlite3_bind_text(
                        projStmt, 1, ev.success ? "active" : "error", -1, SQLITE_TRANSIENT);
                    sqlite3_bind_text(
                        projStmt, 2, ev.projectId.value().c_str(), -1, SQLITE_TRANSIENT);
                    sqlite3_step(projStmt);
                    sqlite3_finalize(projStmt);
                }
            }
        }

        (void)RecalculateQuality(ev.projectId, ev.scanId);
    });
    subscriptions_.push_back(subCompleted);
}

}  // namespace sentinel
