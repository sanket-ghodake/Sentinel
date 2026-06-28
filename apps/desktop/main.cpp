#include <QApplication>
#include <QDir>
#include <QUrl>
#include <QWebChannel>
#include <QWebEngineSettings>
#include <QWebEngineView>
#include <cstdlib>
#include <iostream>

#include "WebBridge.h"
#include "core/event_bus/EventBus.h"
#include "core/fake_data/FakeClientApi.h"
#include "core/ipc/JsonRpcHandler.h"

int main(int argc, char* argv[])
{
    // Toggle developer tools based on an env flag or CLI arg
    bool enableDevTools = std::getenv("SENTINEL_DEV") != nullptr;
    if (enableDevTools) {
        qputenv("QTWEBENGINE_REMOTE_DEBUGGING", "9222");
        std::cout << "[Desktop Shell] Developer remote debugging enabled on port 9222. Open "
                     "http://localhost:9222 in Chrome."
                  << std::endl;
    }

    QApplication app(argc, argv);

    // Initialize Sentinel C++ Core Backend (Fake Data Layer for MVP)
    sentinel::EventBus eventBus;
    sentinel::FakeClientApi fakeApi(eventBus);
    sentinel::JsonRpcHandler rpcHandler(fakeApi);

    // Create the Web Bridge
    WebBridge bridge(eventBus, rpcHandler);

    // Setup QWebEngineView and QWebChannel
    QWebEngineView view;
    QWebChannel channel;

    // Register our bridge object under the name "webBridge"
    channel.registerObject(QStringLiteral("webBridge"), &bridge);
    view.page()->setWebChannel(&channel);

    // Configure WebEngine Settings
    QWebEngineSettings* settings = view.settings();
    settings->setAttribute(QWebEngineSettings::LocalStorageEnabled, true);
    settings->setAttribute(QWebEngineSettings::LocalContentCanAccessRemoteUrls, true);
    settings->setAttribute(QWebEngineSettings::LocalContentCanAccessFileUrls, true);
    settings->setAttribute(QWebEngineSettings::WebGLEnabled, true);
    settings->setAttribute(QWebEngineSettings::JavascriptEnabled, true);

    // Determine target URL to load
    QString targetUrl = QStringLiteral("http://localhost:5173");
    if (const char* envUrl = std::getenv("SENTINEL_URL")) {
        targetUrl = QString::fromUtf8(envUrl);
    } else if (app.arguments().size() > 1) {
        targetUrl = app.arguments().at(1);
    }

    std::cout << "[Desktop Shell] Loading UI URL: " << targetUrl.toStdString() << std::endl;
    view.load(QUrl(targetUrl));

    // Show the Window
    view.setWindowTitle(QStringLiteral("Sentinel Developer Experience Platform"));
    view.resize(1280, 800);
    view.show();

    return app.exec();
}
