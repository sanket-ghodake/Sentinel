#include "core/analyzer/PluginLoader.h"

#include <dlfcn.h>
#include <iostream>

namespace sentinel {

LoadedPlugin::LoadedPlugin(void* handle, IAnalyzer* analyzer, void (*destroyFunc)(IAnalyzer*))
    : handle_(handle), analyzer_(analyzer), destroyFunc_(destroyFunc)
{
}

LoadedPlugin::~LoadedPlugin()
{
    if (analyzer_ && destroyFunc_) {
        destroyFunc_(analyzer_);
        analyzer_ = nullptr;
    }
    if (handle_) {
        dlclose(handle_);
        handle_ = nullptr;
    }
}

LoadedPlugin::LoadedPlugin(LoadedPlugin&& other) noexcept
    : handle_(other.handle_), analyzer_(other.analyzer_), destroyFunc_(other.destroyFunc_)
{
    other.handle_ = nullptr;
    other.analyzer_ = nullptr;
    other.destroyFunc_ = nullptr;
}

LoadedPlugin& LoadedPlugin::operator=(LoadedPlugin&& other) noexcept
{
    if (this != &other) {
        if (analyzer_ && destroyFunc_) {
            destroyFunc_(analyzer_);
        }
        if (handle_) {
            dlclose(handle_);
        }
        handle_ = other.handle_;
        analyzer_ = other.analyzer_;
        destroyFunc_ = other.destroyFunc_;

        other.handle_ = nullptr;
        other.analyzer_ = nullptr;
        other.destroyFunc_ = nullptr;
    }
    return *this;
}

IAnalyzer* LoadedPlugin::GetAnalyzer() const
{
    return analyzer_;
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
    auto createFunc = reinterpret_cast<IAnalyzer* (*)()>(dlsym(handle, "CreateAnalyzer"));
    const char* dlsymErr = dlerror();
    if (dlsymErr || !createFunc) {
        dlclose(handle);
        std::string errStr = dlsymErr ? dlsymErr : "CreateAnalyzer symbol not found";
        return Unexpected<Error>(
            {.message = "Failed to load CreateAnalyzer symbol: " + errStr, .code = 500});
    }

    auto destroyFunc = reinterpret_cast<void (*)(IAnalyzer*)>(dlsym(handle, "DestroyAnalyzer"));
    dlsymErr = dlerror();
    if (dlsymErr || !destroyFunc) {
        dlclose(handle);
        std::string errStr = dlsymErr ? dlsymErr : "DestroyAnalyzer symbol not found";
        return Unexpected<Error>(
            {.message = "Failed to load DestroyAnalyzer symbol: " + errStr, .code = 500});
    }

    IAnalyzer* analyzer = createFunc();
    if (!analyzer) {
        dlclose(handle);
        return Unexpected<Error>({.message = "CreateAnalyzer returned nullptr", .code = 500});
    }

    return std::make_unique<LoadedPlugin>(handle, analyzer, destroyFunc);
}

}  // namespace sentinel
