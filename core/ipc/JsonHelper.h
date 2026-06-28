#pragma once

#include "Json.h"
#include "sentinel/Expected.h"
#include "sentinel/Insights.h"
#include "sentinel/Quality.h"
#include "sentinel/Workspace.h"

namespace sentinel {

// String conversions for enums
inline std::string severityToString(Severity s)
{
    switch (s) {
        case Severity::Info:
            return "Info";
        case Severity::Low:
            return "Low";
        case Severity::Medium:
            return "Medium";
        case Severity::High:
            return "High";
        case Severity::Critical:
            return "Critical";
    }
    return "Medium";
}

inline Severity stringToSeverity(const std::string& s)
{
    if (s == "Info")
        return Severity::Info;
    if (s == "Low")
        return Severity::Low;
    if (s == "Medium")
        return Severity::Medium;
    if (s == "High")
        return Severity::High;
    if (s == "Critical")
        return Severity::Critical;
    return Severity::Medium;
}

inline std::string confidenceToString(Confidence c)
{
    switch (c) {
        case Confidence::Low:
            return "Low";
        case Confidence::Medium:
            return "Medium";
        case Confidence::High:
            return "High";
    }
    return "Medium";
}

inline Confidence stringToConfidence(const std::string& s)
{
    if (s == "Low")
        return Confidence::Low;
    if (s == "Medium")
        return Confidence::Medium;
    if (s == "High")
        return Confidence::High;
    return Confidence::Medium;
}

inline std::string issueStatusToString(IssueStatus s)
{
    switch (s) {
        case IssueStatus::Open:
            return "Open";
        case IssueStatus::Resolved:
            return "Resolved";
        case IssueStatus::Ignored:
            return "Ignored";
    }
    return "Open";
}

inline IssueStatus stringToIssueStatus(const std::string& s)
{
    if (s == "Open")
        return IssueStatus::Open;
    if (s == "Resolved")
        return IssueStatus::Resolved;
    if (s == "Ignored")
        return IssueStatus::Ignored;
    return IssueStatus::Open;
}

// Serialization helpers
inline Json serialize(const Location& loc)
{
    std::unordered_map<std::string, Json> obj;
    obj["fileId"] = loc.fileId.value();
    obj["line"] = loc.line;
    obj["column"] = loc.column;
    obj["length"] = loc.length;
    return Json(obj);
}

inline Json serialize(const Action& action)
{
    std::unordered_map<std::string, Json> obj;
    obj["type"] = action.type;
    obj["estimatedTime"] = action.estimatedTime;
    obj["risk"] = severityToString(action.risk);
    obj["safe"] = action.safe;
    obj["impact"] = action.impact;
    obj["description"] = action.description;
    obj["preview"] = action.preview;
    obj["undoStrategy"] = action.undoStrategy;
    return Json(obj);
}

inline Json serialize(const Fix& fix)
{
    std::unordered_map<std::string, Json> obj;
    obj["id"] = fix.id.value();
    obj["issueId"] = fix.issueId.value();
    obj["description"] = fix.description;
    std::vector<Json> actions;
    for (const auto& action : fix.actions) {
        actions.push_back(serialize(action));
    }
    obj["actions"] = Json(actions);
    return Json(obj);
}

inline Json serialize(const Issue& issue)
{
    std::unordered_map<std::string, Json> obj;
    obj["id"] = issue.id.value();
    obj["title"] = issue.title;
    obj["description"] = issue.description;
    obj["severity"] = severityToString(issue.severity);
    obj["confidence"] = confidenceToString(issue.confidence);
    obj["category"] = issue.category;
    obj["analyzerId"] = issue.analyzerId.value();
    obj["ruleId"] = issue.ruleId.value();
    obj["location"] = serialize(issue.location);
    obj["impact"] = issue.impact;
    obj["fix"] = serialize(issue.fix);
    obj["status"] = issueStatusToString(issue.status);
    obj["owner"] = issue.owner;
    return Json(obj);
}

inline Json serialize(const Recommendation& rec)
{
    std::unordered_map<std::string, Json> obj;
    obj["id"] = rec.id.value();
    obj["title"] = rec.title;
    obj["description"] = rec.description;
    obj["origin"] = rec.origin;

    // Evidence
    std::unordered_map<std::string, Json> evidence;
    evidence["fileId"] = rec.fileId;
    evidence["line"] = rec.line;
    evidence["matchedPattern"] = rec.matchedPattern;
    obj["evidence"] = Json(evidence);

    // Explanation
    std::unordered_map<std::string, Json> explanation;
    explanation["simple"] = rec.explanationSimple;
    explanation["technical"] = rec.explanationTechnical;
    explanation["expert"] = rec.explanationExpert;
    obj["explanation"] = Json(explanation);

    // Confidence
    std::unordered_map<std::string, Json> confidence;
    confidence["score"] = rec.confidenceScore;
    confidence["level"] = rec.confidenceLevel;
    std::vector<Json> confidenceSignals;
    for (const auto& sig : rec.confidenceSignals) {
        confidenceSignals.push_back(Json(sig));
    }
    confidence["signals"] = Json(confidenceSignals);
    obj["confidence"] = Json(confidence);

    obj["safeAutomationLevel"] = rec.safeAutomationLevel;

    // Add estimatedEffort and estimatedImpact
    obj["estimatedEffort"] = "2 minutes";
    obj["estimatedImpact"] = "High";

    // Preview
    std::unordered_map<std::string, Json> preview;
    preview["currentCode"] = rec.previewCurrentCode;
    preview["suggestedCode"] = rec.previewSuggestedCode;
    preview["diff"] = rec.previewDiff;
    obj["preview"] = Json(preview);

    obj["rollbackSupport"] = rec.rollbackSupport;

    // Why Now
    std::vector<Json> whyNow;
    for (const auto& reason : rec.whyNowReasons) {
        whyNow.push_back(Json(reason));
    }
    obj["whyNow"] = Json(whyNow);

    // Blast Radius
    std::unordered_map<std::string, Json> blastRadius;
    blastRadius["affectedFiles"] = rec.blastRadiusAffectedFiles;
    blastRadius["affectedModule"] = rec.blastRadiusAffectedModule;
    blastRadius["publicApiChanged"] = rec.blastRadiusPublicApiChanged;
    blastRadius["testsImpacted"] = rec.blastRadiusTestsImpacted;
    blastRadius["binaryCompatibility"] = rec.blastRadiusBinaryCompatibility;
    obj["blastRadius"] = Json(blastRadius);

    // Learning Mode
    std::unordered_map<std::string, Json> learningMode;
    learningMode["concept"] = rec.learningConcept;
    learningMode["rationale"] = rec.learningRationale;
    learningMode["bestPractice"] = rec.learningBestPractice;
    std::vector<Json> refs;
    for (const auto& ref : rec.learningReferences) {
        refs.push_back(Json(ref));
    }
    learningMode["references"] = Json(refs);
    obj["learningMode"] = Json(learningMode);

    return Json(obj);
}

inline Json serialize(const Project& proj)
{
    std::unordered_map<std::string, Json> obj;
    obj["id"] = proj.id.value();
    obj["name"] = proj.name;
    obj["path"] = proj.path;
    obj["language"] = proj.language;
    obj["gitStatus"] = proj.gitStatus;
    obj["branch"] = proj.branch;
    obj["quality"] = proj.quality;
    std::vector<Json> rules;
    for (const auto& r : proj.rules)
        rules.push_back(Json(r.value()));
    obj["rules"] = Json(rules);
    std::vector<Json> plugins;
    for (const auto& p : proj.plugins)
        plugins.push_back(Json(p.value()));
    obj["plugins"] = Json(plugins);
    std::vector<Json> history;
    for (const auto& h : proj.history)
        history.push_back(Json(h.value()));
    obj["history"] = Json(history);
    obj["owner"] = proj.owner;
    std::vector<Json> tags;
    for (const auto& t : proj.tags)
        tags.push_back(Json(t));
    obj["tags"] = Json(tags);
    obj["status"] = proj.status;
    obj["totalFiles"] = proj.totalFiles;
    obj["totalLines"] = proj.totalLines;
    obj["totalIssues"] = proj.totalIssues;
    return Json(obj);
}

inline Json serialize(const Scan& scan)
{
    std::unordered_map<std::string, Json> obj;
    obj["id"] = scan.id.value();
    obj["projectId"] = scan.projectId.value();
    obj["profileId"] = scan.profileId.value();
    std::vector<Json> rules;
    for (const auto& r : scan.rules)
        rules.push_back(Json(r.value()));
    obj["rules"] = Json(rules);
    std::vector<Json> plugins;
    for (const auto& p : scan.plugins)
        plugins.push_back(Json(p.value()));
    obj["plugins"] = Json(plugins);
    std::vector<Json> analyzers;
    for (const auto& a : scan.analyzers)
        analyzers.push_back(Json(a.value()));
    obj["analyzers"] = Json(analyzers);
    obj["startTime"] = static_cast<double>(scan.startTime);
    obj["endTime"] = static_cast<double>(scan.endTime);
    obj["status"] = scan.status;
    return Json(obj);
}

inline Json serialize(const Error& err)
{
    std::unordered_map<std::string, Json> obj;
    obj["message"] = err.message;
    obj["code"] = err.code;
    return Json(obj);
}

}  // namespace sentinel
