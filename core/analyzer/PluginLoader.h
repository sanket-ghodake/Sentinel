#pragma once

#include <memory>
#include <string>

#include "sentinel/Expected.h"
#include "sentinel/IPlugin.h"

namespace sentinel {

class LoadedPlugin
{
public:
    LoadedPlugin(void* handle, IPlugin* plugin, void (*destroyFunc)(IPlugin*));
    ~LoadedPlugin();

    // Disable copy
    LoadedPlugin(const LoadedPlugin&) = delete;
    LoadedPlugin& operator=(const LoadedPlugin&) = delete;

    // Enable move
    LoadedPlugin(LoadedPlugin&& other) noexcept;
    LoadedPlugin& operator=(LoadedPlugin&& other) noexcept;

    IPlugin* GetPlugin() const;

private:
    void* handle_{nullptr};
    IPlugin* plugin_{nullptr};
    void (*destroyFunc_)(IPlugin*){nullptr};
};

class PluginLoader
{
public:
    static Expected<std::unique_ptr<LoadedPlugin>, Error> LoadPlugin(const std::string& soPath);
};

}  // namespace sentinel
