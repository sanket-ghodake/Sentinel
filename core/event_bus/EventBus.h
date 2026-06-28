#pragma once

#include <chrono>
#include <condition_variable>
#include <functional>
#include <memory>
#include <mutex>
#include <shared_mutex>
#include <stop_token>
#include <thread>
#include <typeindex>
#include <unordered_map>
#include <vector>

#include "Event.h"
#include "sentinel/TypedId.h"

namespace sentinel {

struct SubscriptionTag
{
};
using SubscriptionId = TypedId<SubscriptionTag>;

class ISubscriber
{
public:
    virtual ~ISubscriber() = default;
    virtual void dispatch(const EventBase& event) = 0;
};

template <typename EventType>
class ConcreteSubscriber : public ISubscriber
{
public:
    explicit ConcreteSubscriber(std::function<void(const EventType&)> callback)
        : callback_{std::move(callback)}
    {
    }

    void dispatch(const EventBase& event) override
    {
        if (auto envelope = dynamic_cast<const EventEnvelope<EventType>*>(&event)) {
            callback_(envelope->data());
        }
    }

private:
    std::function<void(const EventType&)> callback_;
};

class EventBus
{
public:
    EventBus();
    ~EventBus();

    // Disable copy and move operations
    EventBus(const EventBus&) = delete;
    EventBus& operator=(const EventBus&) = delete;
    EventBus(EventBus&&) = delete;
    EventBus& operator=(EventBus&&) = delete;

    template <typename EventType>
    SubscriptionId subscribe(std::function<void(const EventType&)> callback)
    {
        std::unique_lock lock(registryMutex_);
        auto idVal = std::to_string(++nextSubscriptionId_);
        SubscriptionId id{idVal};
        auto subscriber = std::make_shared<ConcreteSubscriber<EventType>>(std::move(callback));

        subscribers_[typeid(EventType)].push_back({id, subscriber});
        subscriptionToType_.emplace(id, typeid(EventType));
        return id;
    }

    void unsubscribe(SubscriptionId id);

    template <typename EventType>
    void publish(EventType event)
    {
        auto envelope =
            std::make_unique<EventEnvelope<EventType>>(std::move(event), getCurrentTimeMs());
        {
            std::unique_lock lock(queueMutex_);
            queue_.push_back(std::move(envelope));
        }
        queueCond_.notify_one();
    }

    template <typename EventType>
    void publishSync(const EventType& event)
    {
        EventEnvelope<EventType> envelope(event, getCurrentTimeMs());
        dispatchDirect(envelope);
    }

    void drain();

private:
    struct Subscription
    {
        SubscriptionId id;
        std::shared_ptr<ISubscriber> subscriber;
    };

    void workerLoop(std::stop_token stopToken);
    void dispatchDirect(const EventBase& event);
    uint64_t getCurrentTimeMs() const;

    std::unordered_map<std::type_index, std::vector<Subscription>> subscribers_;
    std::unordered_map<SubscriptionId, std::type_index> subscriptionToType_;
    mutable std::shared_mutex registryMutex_;
    uint64_t nextSubscriptionId_{0};

    std::vector<std::unique_ptr<EventBase>> queue_;
    std::mutex queueMutex_;
    std::condition_variable_any queueCond_;
    std::condition_variable drainCond_;

    std::jthread workerThread_;
};

}  // namespace sentinel
