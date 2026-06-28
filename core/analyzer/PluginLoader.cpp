#include "core/analyzer/PluginLoader.h"

#include <dlfcn.h>
#include <iostream>

namespace sentinel {

LoadedPlugin::LoadedPlugin(void* handle, IPlugin* plugin, void (*destroyFunc)(IPlugin*))
    : handle_(handle), plugin_(plugin), destroyFunc_(destroyFunc)
{
}

LoadedPlugin::~LoadedPlugin()
{
    if (plugin_ && destroyFunc_) {
        destroyFunc_(plugin_);
        plugin_ = nullptr;
    }
    if (handle_) {
        dlclose(handle_);
        handle_ = nullptr;
    }
}

LoadedPlugin::LoadedPlugin(LoadedPlugin&& other) noexcept
    : handle_(other.handle_), plugin_(other.plugin_), destroyFunc_(other.destroyFunc_)
{
    other.handle_ = nullptr;
    other.plugin_ = nullptr;
    other.destroyFunc_ = nullptr;
}

LoadedPlugin& LoadedPlugin::operator=(LoadedPlugin&& other) noexcept
{
    if (this != &other) {
        if (plugin_ && destroyFunc_) {
            destroyFunc_(plugin_);
        }
        if (handle_) {
            dlclose(handle_);
        }
        handle_ = other.handle_;
        plugin_ = other.plugin_;
        destroyFunc_ = other.destroyFunc_;

        other.handle_ = nullptr;
        other.plugin_ = nullptr;
        other.destroyFunc_ = nullptr;
    }
    return *this;
}

IPlugin* LoadedPlugin::GetPlugin() const
{
    return plugin_;
}

Expected<std::unique_ptr<LoadedPlugin>, Error> PluginLoader::LoadPlugin(const std::string& soPath)
{
    // Clear any existing dynamic loading errors
    (void)dlerror();

    void* handle = dlopen(soPath.c_str(), RTLD_LAZY | RTLD_LOCAL);
    if (!handle) {
        const char* err = dlerror();
        std::string errStr = err ? err : "Unknown dlopen error";
        return Unexpected<Error>(
            {.message = "Failed to load shared library: " + errStr, .code = 500});
    }

    // Load factory functions
    auto createFunc = reinterpret_cast<IPlugin* (*)()>(dlsym(handle, "CreatePlugin"));
    const char* dlsymErr = dlerror();
    if (dlsymErr || !createFunc) {
        dlclose(handle);
        std::string errStr = dlsymErr ? dlsymErr : "CreatePlugin symbol not found";
        return Unexpected<Error>(
            {.message = "Failed to load CreatePlugin symbol: " + errStr, .code = 500});
    }

    auto destroyFunc = reinterpret_cast<void (*)(IPlugin*)>(dlsym(handle, "DestroyPlugin"));
    dlsymErr = dlerror();
    if (dlsymErr || !destroyFunc) {
        dlclose(handle);
        std::string errStr = dlsymErr ? dlsymErr : "DestroyPlugin symbol not found";
        return Unexpected<Error>(
            {.message = "Failed to load DestroyPlugin symbol: " + errStr, .code = 500});
    }

    IPlugin* plugin = createFunc();
    if (!plugin) {
        dlclose(handle);
        return Unexpected<Error>({.message = "CreatePlugin returned nullptr", .code = 500});
    }

    return std::make_unique<LoadedPlugin>(handle, plugin, destroyFunc);
}

}  // namespace sentinel
