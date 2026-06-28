#include "EventBus.h"

#include <algorithm>

namespace sentinel {

EventBus::EventBus() : workerThread_{[this](std::stop_token token) { workerLoop(token); }}
{
}

EventBus::~EventBus()
{
    workerThread_.request_stop();
    queueCond_.notify_all();
}

void EventBus::unsubscribe(SubscriptionId id)
{
    std::unique_lock lock(registryMutex_);
    auto it = subscriptionToType_.find(id);
    if (it != subscriptionToType_.end()) {
        auto typeIdx = it->second;
        auto& list = subscribers_[typeIdx];
        list.erase(
            std::remove_if(
                list.begin(), list.end(), [id](const Subscription& sub) { return sub.id == id; }),
            list.end());
        subscriptionToType_.erase(it);
    }
}

void EventBus::drain()
{
    std::unique_lock lock(queueMutex_);
    drainCond_.wait(lock, [this]() { return queue_.empty(); });
}

void EventBus::workerLoop(std::stop_token stopToken)
{
    while (!stopToken.stop_requested()) {
        std::unique_ptr<EventBase> event;
        {
            std::unique_lock lock(queueMutex_);
            queueCond_.wait(lock, stopToken, [this]() { return !queue_.empty(); });
            if (stopToken.stop_requested() && queue_.empty()) {
                break;
            }
            if (!queue_.empty()) {
                event = std::move(queue_.front());
                queue_.erase(queue_.begin());
            }
        }
        if (event) {
            dispatchDirect(*event);
        }
        {
            std::unique_lock lock(queueMutex_);
            if (queue_.empty()) {
                drainCond_.notify_all();
            }
        }
    }
}

void EventBus::dispatchDirect(const EventBase& event)
{
    std::vector<std::shared_ptr<ISubscriber>> targets;
    {
        std::shared_lock lock(registryMutex_);
        auto it = subscribers_.find(event.payloadType());
        if (it != subscribers_.end()) {
            for (const auto& sub : it->second) {
                targets.push_back(sub.subscriber);
            }
        }
    }  // registryMutex_ released here to avoid deadlocks in case callback modifies subscriptions

    for (const auto& target : targets) {
        target->dispatch(event);
    }
}

uint64_t EventBus::getCurrentTimeMs() const
{
    return std::chrono::duration_cast<std::chrono::milliseconds>(
               std::chrono::system_clock::now().time_since_epoch())
        .count();
}

}  // namespace sentinel
