#pragma once

#include <memory>
#include <string>

#include "sentinel/Expected.h"
#include "sentinel/IAnalyzer.h"

namespace sentinel {

class LoadedPlugin
{
public:
    LoadedPlugin(void* handle, IAnalyzer* analyzer, void (*destroyFunc)(IAnalyzer*));
    ~LoadedPlugin();

    // Disable copy
    LoadedPlugin(const LoadedPlugin&) = delete;
    LoadedPlugin& operator=(const LoadedPlugin&) = delete;

    // Enable move
    LoadedPlugin(LoadedPlugin&& other) noexcept;
    LoadedPlugin& operator=(LoadedPlugin&& other) noexcept;

    IAnalyzer* GetAnalyzer() const;

private:
    void* handle_{nullptr};
    IAnalyzer* analyzer_{nullptr};
    void (*destroyFunc_)(IAnalyzer*){nullptr};
};

class PluginLoader
{
public:
    static Expected<std::unique_ptr<LoadedPlugin>, Error> LoadPlugin(const std::string& soPath);
};

}  // namespace sentinel
