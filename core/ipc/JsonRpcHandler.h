#pragma once

#include <string>

#include "sentinel/ClientApi.h"

namespace sentinel {

class JsonRpcHandler
{
public:
    explicit JsonRpcHandler(IClientApi& api);
    ~JsonRpcHandler() = default;

    std::string handleRequest(const std::string& requestStr);

private:
    IClientApi& api_;
};

}  // namespace sentinel
