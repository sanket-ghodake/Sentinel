#pragma once

#include <cstdint>
#include <string>
#include <typeindex>
#include <utility>

#include "sentinel/Quality.h"
#include "sentinel/TypedId.h"

namespace sentinel {

class EventBase
{
public:
    virtual ~EventBase() = default;
    virtual std::string name() const = 0;
    virtual uint64_t timestamp() const = 0;
    virtual std::type_index payloadType() const = 0;
};

template <typename T>
class EventEnvelope : public EventBase
{
public:
    EventEnvelope(T data, uint64_t timestamp) : data_{std::move(data)}, timestamp_{timestamp} {}

    std::string name() const override { return T::eventName(); }
    uint64_t timestamp() const override { return timestamp_; }
    std::type_index payloadType() const override { return typeid(T); }

    const T& data() const { return data_; }

private:
    T data_;
    uint64_t timestamp_;
};

struct ScanStarted
{
    ScanId scanId;
    ProjectId projectId;
    uint64_t timestamp = 0;

    static std::string eventName() { return "ScanStarted"; }
};

struct IssueFound
{
    ScanId scanId;
    ProjectId projectId;
    Issue issue;
    uint64_t timestamp = 0;

    static std::string eventName() { return "IssueFound"; }
};

struct ScanCompleted
{
    ScanId scanId;
    ProjectId projectId;
    uint64_t timestamp = 0;
    int totalIssuesFound = 0;
    bool success = false;

    static std::string eventName() { return "ScanCompleted"; }
};

}  // namespace sentinel
