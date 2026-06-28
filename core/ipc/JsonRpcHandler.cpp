#include "JsonRpcHandler.h"

#include "JsonHelper.h"

namespace sentinel {

static Json makeErrorResponse(const Json& id, int code, const std::string& message)
{
    std::unordered_map<std::string, Json> errObj;
    errObj["code"] = code;
    errObj["message"] = message;

    std::unordered_map<std::string, Json> resp;
    resp["jsonrpc"] = "2.0";
    resp["error"] = Json(errObj);
    resp["id"] = id;
    return Json(resp);
}

static Json makeSuccessResponse(const Json& id, const Json& result)
{
    std::unordered_map<std::string, Json> resp;
    resp["jsonrpc"] = "2.0";
    resp["result"] = result;
    resp["id"] = id;
    return Json(resp);
}

JsonRpcHandler::JsonRpcHandler(IClientApi& api) : api_(api)
{
}

std::string JsonRpcHandler::handleRequest(const std::string& requestStr)
{
    Json req;
    try {
        req = Json::parse(requestStr);
    } catch (const std::exception& e) {
        return makeErrorResponse(nullptr, -32700, std::string("Parse error: ") + e.what())
            .serialize();
    }

    Json id = nullptr;
    if (req.is_object() && req.contains("id")) {
        id = req["id"];
    }

    if (!req.is_object() || !req.contains("jsonrpc") || req.get_string("jsonrpc") != "2.0" ||
        !req.contains("method")) {
        return makeErrorResponse(id, -32600, "Invalid Request").serialize();
    }

    std::string method = req["method"].as_string();
    Json params = req.contains("params") ? req["params"] : Json();

    try {
        if (method == "OpenProject") {
            if (!params.is_object() || !params.contains("path")) {
                return makeErrorResponse(id, -32602, "Invalid params: 'path' is required")
                    .serialize();
            }
            std::string path = params["path"].as_string();
            auto res = api_.OpenProject(path);
            if (res.has_value()) {
                return makeSuccessResponse(id, serialize(res.value())).serialize();
            } else {
                return makeErrorResponse(id, res.error().code, res.error().message).serialize();
            }
        } else if (method == "RunScan") {
            if (!params.is_object() || !params.contains("projectId")) {
                return makeErrorResponse(id, -32602, "Invalid params: 'projectId' is required")
                    .serialize();
            }
            ProjectId projectId(params["projectId"].as_string());
            auto res = api_.RunScan(projectId);
            if (res.has_value()) {
                return makeSuccessResponse(id, serialize(res.value())).serialize();
            } else {
                return makeErrorResponse(id, res.error().code, res.error().message).serialize();
            }
        } else if (method == "GetIssues") {
            if (!params.is_object() || !params.contains("projectId")) {
                return makeErrorResponse(id, -32602, "Invalid params: 'projectId' is required")
                    .serialize();
            }
            ProjectId projectId(params["projectId"].as_string());
            auto res = api_.GetIssues(projectId);
            if (res.has_value()) {
                std::vector<Json> issuesJson;
                for (const auto& issue : res.value()) {
                    issuesJson.push_back(serialize(issue));
                }
                return makeSuccessResponse(id, Json(issuesJson)).serialize();
            } else {
                return makeErrorResponse(id, res.error().code, res.error().message).serialize();
            }
        } else if (method == "ApplyAutofix") {
            if (!params.is_object() || !params.contains("issueId")) {
                return makeErrorResponse(id, -32602, "Invalid params: 'issueId' is required")
                    .serialize();
            }
            IssueId issueId(params["issueId"].as_string());
            auto res = api_.ApplyAutofix(issueId);
            if (res.has_value()) {
                return makeSuccessResponse(id, Json(res.value())).serialize();
            } else {
                return makeErrorResponse(id, res.error().code, res.error().message).serialize();
            }
        } else if (method == "GetProjectSummary") {
            if (!params.is_object() || !params.contains("projectId")) {
                return makeErrorResponse(id, -32602, "Invalid params: 'projectId' is required")
                    .serialize();
            }
            ProjectId projectId(params["projectId"].as_string());
            auto res = api_.GetProjectSummary(projectId);
            if (res.has_value()) {
                return makeSuccessResponse(id, serialize(res.value())).serialize();
            } else {
                return makeErrorResponse(id, res.error().code, res.error().message).serialize();
            }
        } else if (method == "GetProjects") {
            auto res = api_.GetProjects();
            if (res.has_value()) {
                std::vector<Json> projsJson;
                projsJson.reserve(res.value().size());
                for (const auto& proj : res.value()) {
                    projsJson.push_back(serialize(proj));
                }
                return makeSuccessResponse(id, Json(projsJson)).serialize();
            } else {
                return makeErrorResponse(id, res.error().code, res.error().message).serialize();
            }
        } else {
            return makeErrorResponse(id, -32601, "Method not found").serialize();
        }
    } catch (const std::exception& e) {
        return makeErrorResponse(id, -32603, std::string("Internal error: ") + e.what())
            .serialize();
    }
}

}  // namespace sentinel
