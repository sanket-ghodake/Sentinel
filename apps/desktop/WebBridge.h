#pragma once

#include <QObject>
#include <QString>
#include <mutex>
#include <string>

#include "core/event_bus/Event.h"
#include "core/event_bus/EventBus.h"
#include "core/ipc/JsonHelper.h"
#include "core/ipc/JsonRpcHandler.h"

class WebBridge : public QObject
{
    Q_OBJECT
public:
    explicit WebBridge(sentinel::EventBus& eventBus,
                       sentinel::JsonRpcHandler& handler,
                       QObject* parent = nullptr)
        : QObject(parent), eventBus_(eventBus), handler_(handler)
    {
        // Subscribe to EventBus events to forward to React UI
        scanStartedSub_ =
            eventBus_.subscribe<sentinel::ScanStarted>([this](const sentinel::ScanStarted& ev) {
                std::unordered_map<std::string, sentinel::Json> obj;
                obj["type"] = "ScanStarted";
                obj["scanId"] = ev.scanId.value();
                obj["projectId"] = ev.projectId.value();
                obj["timestamp"] = static_cast<double>(ev.timestamp);
                emitNotification(sentinel::Json(obj).serialize());
            });

        issueFoundSub_ =
            eventBus_.subscribe<sentinel::IssueFound>([this](const sentinel::IssueFound& ev) {
                std::unordered_map<std::string, sentinel::Json> obj;
                obj["type"] = "IssueFound";
                obj["scanId"] = ev.scanId.value();
                obj["projectId"] = ev.projectId.value();
                obj["issue"] = serialize(ev.issue);
                obj["timestamp"] = static_cast<double>(ev.timestamp);
                emitNotification(sentinel::Json(obj).serialize());
            });

        scanCompletedSub_ =
            eventBus_.subscribe<sentinel::ScanCompleted>([this](const sentinel::ScanCompleted& ev) {
                std::unordered_map<std::string, sentinel::Json> obj;
                obj["type"] = "ScanCompleted";
                obj["scanId"] = ev.scanId.value();
                obj["projectId"] = ev.projectId.value();
                obj["timestamp"] = static_cast<double>(ev.timestamp);
                obj["totalIssuesFound"] = static_cast<double>(ev.totalIssuesFound);
                obj["success"] = ev.success;
                emitNotification(sentinel::Json(obj).serialize());
            });
    }

    ~WebBridge() override
    {
        eventBus_.unsubscribe(scanStartedSub_);
        eventBus_.unsubscribe(issueFoundSub_);
        eventBus_.unsubscribe(scanCompletedSub_);
    }

signals:
    void eventNotification(const QString& eventJson);

public slots:
    QString handleMessage(const QString& jsonRpcRequest)
    {
        std::string request = jsonRpcRequest.toStdString();
        std::string response = handler_.handleRequest(request);
        return QString::fromStdString(response);
    }

private:
    void emitNotification(const std::string& serializedJson)
    {
        emit eventNotification(QString::fromStdString(serializedJson));
    }

    sentinel::EventBus& eventBus_;
    sentinel::JsonRpcHandler& handler_;

    sentinel::SubscriptionId scanStartedSub_;
    sentinel::SubscriptionId issueFoundSub_;
    sentinel::SubscriptionId scanCompletedSub_;
};
