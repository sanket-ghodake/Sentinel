#include <cassert>
#include <iostream>

#include "core/ipc/Json.h"
#include "core/ipc/JsonHelper.h"
#include "core/ipc/JsonRpcHandler.h"

// Define a simple mock API implementation for testing
class MockClientApi : public sentinel::IClientApi
{
public:
    sentinel::Expected<sentinel::Project, sentinel::Error> OpenProject(
        const std::string& path) override
    {
        if (path == "/invalid") {
            return sentinel::Unexpected<sentinel::Error>(
                sentinel::Error{.message = "Project path does not exist", .code = 404});
        }
        sentinel::Project proj{.id = sentinel::ProjectId("proj-1"),
                               .name = "Mock Project",
                               .path = path,
                               .language = "C++"};
        return proj;
    }

    sentinel::Expected<sentinel::Scan, sentinel::Error> RunScan(
        const sentinel::ProjectId& projectId) override
    {
        sentinel::Scan scan{.id = sentinel::ScanId("scan-1"),
                            .projectId = projectId,
                            .profileId = sentinel::ProfileId("default"),
                            .status = "completed"};
        return scan;
    }

    sentinel::Expected<std::vector<sentinel::Issue>, sentinel::Error> GetIssues(
        const sentinel::ProjectId& projectId) override
    {
        sentinel::Issue issue{.id = sentinel::IssueId("issue-1"),
                              .title = "Unused variable",
                              .description = "Variable 'x' is not used",
                              .severity = sentinel::Severity::Low,
                              .category = "Style"};
        return std::vector<sentinel::Issue>{issue};
    }

    sentinel::Expected<bool, sentinel::Error> ApplyAutofix(
        const sentinel::IssueId& issueId) override
    {
        if (issueId == sentinel::IssueId("fail-fix")) {
            return sentinel::Unexpected<sentinel::Error>(
                sentinel::Error{.message = "Failed to apply fix", .code = 500});
        }
        return true;
    }

    sentinel::Expected<sentinel::Project, sentinel::Error> GetProjectSummary(
        const sentinel::ProjectId& projectId) override
    {
        sentinel::Project proj{.id = projectId,
                               .name = "Mock Summary Project",
                               .path = "/workspace/mock",
                               .language = "TypeScript"};
        return proj;
    }
};

void TestJsonParser()
{
    std::cout << "[Test] Running JSON Parser tests..." << std::endl;

    // Test primitives
    auto j1 = sentinel::Json::parse("null");
    assert(j1.is_null());

    auto j2 = sentinel::Json::parse("true");
    assert(j2.is_bool());
    assert(j2.as_bool() == true);

    auto j3 = sentinel::Json::parse("false");
    assert(j3.is_bool());
    assert(j3.as_bool() == false);

    auto j4 = sentinel::Json::parse("123.45");
    assert(j4.is_number());
    assert(j4.as_number() == 123.45);

    auto j5 = sentinel::Json::parse("\"hello \\\"world\\\"\"");
    assert(j5.is_string());
    assert(j5.as_string() == "hello \"world\"");

    // Test arrays
    auto j6 = sentinel::Json::parse("[1, true, \"abc\"]");
    assert(j6.is_array());
    assert(j6.as_array().size() == 3);
    assert(j6[0].as_number() == 1.0);
    assert(j6[1].as_bool() == true);
    assert(j6[2].as_string() == "abc");

    // Test objects
    auto j7 =
        sentinel::Json::parse("{\"name\": \"sentinel\", \"active\": true, \"scores\": [0.9, 0.8]}");
    assert(j7.is_object());
    assert(j7.contains("name"));
    assert(j7.get_string("name") == "sentinel");
    assert(j7.get_bool("active") == true);
    assert(j7["scores"].is_array());
    assert(j7["scores"][0].as_number() == 0.9);

    std::cout << "Successfully verified JSON parsing!" << std::endl;
}

void TestJsonSerializer()
{
    std::cout << "[Test] Running JSON Serializer tests..." << std::endl;

    std::unordered_map<std::string, sentinel::Json> obj;
    obj["id"] = "proj-a";
    obj["value"] = 42.0;
    obj["flags"] = std::vector<sentinel::Json>{true, false};

    sentinel::Json j(obj);
    std::string s = j.serialize();

    // Parse it back to verify
    auto parsed = sentinel::Json::parse(s);
    assert(parsed.is_object());
    assert(parsed.get_string("id") == "proj-a");
    assert(parsed.get_number("value") == 42.0);
    assert(parsed["flags"].as_array().size() == 2);
    assert(parsed["flags"][0].as_bool() == true);

    std::cout << "Successfully verified JSON serialization!" << std::endl;
}

void TestJsonRpcHandler()
{
    std::cout << "[Test] Running JSON-RPC Handler tests..." << std::endl;

    MockClientApi api;
    sentinel::JsonRpcHandler handler(api);

    // Test OpenProject success
    std::string req1 =
        "{\"jsonrpc\": \"2.0\", \"method\": \"OpenProject\", \"params\": {\"path\": "
        "\"/workspace/test\"}, \"id\": 1}";
    std::string resp1 = handler.handleRequest(req1);
    auto res1 = sentinel::Json::parse(resp1);
    assert(res1.contains("result"));
    assert(res1["result"].get_string("path") == "/workspace/test");
    assert(res1["id"].as_number() == 1.0);

    // Test OpenProject error
    std::string req2 =
        "{\"jsonrpc\": \"2.0\", \"method\": \"OpenProject\", \"params\": {\"path\": \"/invalid\"}, "
        "\"id\": 2}";
    std::string resp2 = handler.handleRequest(req2);
    auto res2 = sentinel::Json::parse(resp2);
    assert(res2.contains("error"));
    assert(res2["error"].get_number("code") == 404.0);
    assert(res2["error"].get_string("message") == "Project path does not exist");
    assert(res2["id"].as_number() == 2.0);

    // Test invalid method
    std::string req3 = "{\"jsonrpc\": \"2.0\", \"method\": \"UnknownMethod\", \"id\": 3}";
    std::string resp3 = handler.handleRequest(req3);
    auto res3 = sentinel::Json::parse(resp3);
    assert(res3.contains("error"));
    assert(res3["error"].get_number("code") == -32601.0);  // Method not found

    // Test parsing invalid request format
    std::string req4 = "{\"jsonrpc\": \"1.0\", \"method\": \"OpenProject\", \"id\": 4}";
    std::string resp4 = handler.handleRequest(req4);
    auto res4 = sentinel::Json::parse(resp4);
    assert(res4.contains("error"));
    assert(res4["error"].get_number("code") == -32600.0);  // Invalid request

    std::cout << "Successfully verified JSON-RPC Handler routing and formatting!" << std::endl;
}

int main()
{
    std::cout << "========================================" << std::endl;
    std::cout << "Starting Sentinel JSON Unit Test Suite" << std::endl;
    std::cout << "========================================" << std::endl;

    TestJsonParser();
    TestJsonSerializer();
    TestJsonRpcHandler();

    std::cout << "========================================" << std::endl;
    std::cout << "All JSON Unit Tests Passed Successfully!" << std::endl;
    std::cout << "========================================" << std::endl;
    return 0;
}
