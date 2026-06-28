#include <atomic>
#include <cassert>
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

#include "core/event_bus/Event.h"
#include "core/event_bus/EventBus.h"
#include "sentinel/Quality.h"
#include "sentinel/TypedId.h"

// Test 1: Basic Subscription and Synchronous Dispatch
void TestSyncDispatch()
{
    std::cout << "[Test] Running Sync Dispatch..." << std::endl;
    sentinel::EventBus bus;

    sentinel::ScanId scanId("scan-1");
    sentinel::ProjectId projectId("proj-1");

    bool called = false;
    bus.subscribe<sentinel::ScanStarted>([&](const sentinel::ScanStarted& event) {
        assert(event.scanId == scanId);
        assert(event.projectId == projectId);
        called = true;
    });

    sentinel::ScanStarted event{.scanId = scanId, .projectId = projectId};
    bus.publishSync(event);
    assert(called);
    std::cout << "Sync Dispatch Passed!" << std::endl;
}

// Test 2: Asynchronous Dispatch & Drain
void TestAsyncDispatch()
{
    std::cout << "[Test] Running Async Dispatch..." << std::endl;
    sentinel::EventBus bus;

    sentinel::ScanId scanId("scan-2");
    sentinel::ProjectId projectId("proj-2");

    std::atomic<bool> called{false};
    bus.subscribe<sentinel::ScanStarted>([&](const sentinel::ScanStarted& event) {
        assert(event.scanId == scanId);
        assert(event.projectId == projectId);
        called = true;
    });

    sentinel::ScanStarted event{.scanId = scanId, .projectId = projectId};
    bus.publish(event);

    bus.drain();
    assert(called);
    std::cout << "Async Dispatch Passed!" << std::endl;
}

// Test 3: Multiple Event Types
void TestMultipleEventTypes()
{
    std::cout << "[Test] Running Multiple Event Types..." << std::endl;
    sentinel::EventBus bus;

    int scanStartedCount = 0;
    int issueFoundCount = 0;

    bus.subscribe<sentinel::ScanStarted>([&](const sentinel::ScanStarted&) { scanStartedCount++; });

    bus.subscribe<sentinel::IssueFound>([&](const sentinel::IssueFound&) { issueFoundCount++; });

    bus.publishSync(sentinel::ScanStarted{});
    bus.publishSync(sentinel::IssueFound{});
    bus.publishSync(sentinel::ScanStarted{});

    assert(scanStartedCount == 2);
    assert(issueFoundCount == 1);
    std::cout << "Multiple Event Types Passed!" << std::endl;
}

// Test 4: FIFO Order Correctness
void TestFifoOrder()
{
    std::cout << "[Test] Running FIFO Order..." << std::endl;
    sentinel::EventBus bus;

    std::vector<int> receivedOrder;
    std::mutex orderMutex;

    bus.subscribe<sentinel::ScanStarted>([&](const sentinel::ScanStarted& event) {
        std::unique_lock<std::mutex> lock(orderMutex);
        receivedOrder.push_back(std::stoi(event.projectId.value()));
    });

    const int eventCount = 100;
    for (int i = 0; i < eventCount; ++i) {
        bus.publish(sentinel::ScanStarted{.scanId = sentinel::ScanId("scan-" + std::to_string(i)),
                                          .projectId = sentinel::ProjectId(std::to_string(i))});
    }

    bus.drain();

    assert(receivedOrder.size() == eventCount);
    for (int i = 0; i < eventCount; ++i) {
        assert(receivedOrder[i] == i);
    }
    std::cout << "FIFO Order Passed!" << std::endl;
}

// Test 5: Concurrency / Multithreading Safety
void TestConcurrency()
{
    std::cout << "[Test] Running Concurrency safety..." << std::endl;
    sentinel::EventBus bus;

    std::atomic<int> totalReceived{0};
    bus.subscribe<sentinel::ScanStarted>([&](const sentinel::ScanStarted&) { totalReceived++; });

    const int numThreads = 8;
    const int eventsPerThread = 200;
    std::vector<std::thread> publishers;

    for (int t = 0; t < numThreads; ++t) {
        publishers.emplace_back([&]() {
            for (int i = 0; i < eventsPerThread; ++i) {
                bus.publish(sentinel::ScanStarted{});
            }
        });
    }

    for (auto& th : publishers) {
        th.join();
    }

    bus.drain();
    assert(totalReceived == numThreads * eventsPerThread);
    std::cout << "Concurrency safety Passed!" << std::endl;
}

// Test 6: Reentrant Unsubscribe
void TestReentrantUnsubscribe()
{
    std::cout << "[Test] Running Reentrant Unsubscribe..." << std::endl;
    sentinel::EventBus bus;

    sentinel::SubscriptionId subId;
    int calledCount = 0;

    subId = bus.subscribe<sentinel::ScanStarted>([&, &bus = bus](const sentinel::ScanStarted&) {
        calledCount++;
        bus.unsubscribe(subId);
    });

    bus.publishSync(sentinel::ScanStarted{});
    bus.publishSync(sentinel::ScanStarted{});

    assert(calledCount == 1);
    std::cout << "Reentrant Unsubscribe Passed!" << std::endl;
}

// Test 7: Reentrant Subscribe
void TestReentrantSubscribe()
{
    std::cout << "[Test] Running Reentrant Subscribe..." << std::endl;
    sentinel::EventBus bus;

    int parentCalled = 0;
    int childCalled = 0;

    bus.subscribe<sentinel::ScanStarted>([&, &bus = bus](const sentinel::ScanStarted&) {
        parentCalled++;
        bus.subscribe<sentinel::ScanStarted>([&](const sentinel::ScanStarted&) { childCalled++; });
    });

    bus.publishSync(sentinel::ScanStarted{});
    assert(parentCalled == 1);
    assert(childCalled == 0);

    bus.publishSync(sentinel::ScanStarted{});
    assert(parentCalled == 2);
    assert(childCalled == 1);
    std::cout << "Reentrant Subscribe Passed!" << std::endl;
}

int main()
{
    std::cout << "========================================" << std::endl;
    std::cout << "Starting Sentinel Event Bus Unit Tests" << std::endl;
    std::cout << "========================================" << std::endl;

    TestSyncDispatch();
    TestAsyncDispatch();
    TestMultipleEventTypes();
    TestFifoOrder();
    TestConcurrency();
    TestReentrantUnsubscribe();
    TestReentrantSubscribe();

    std::cout << "========================================" << std::endl;
    std::cout << "All Event Bus Unit Tests Passed!" << std::endl;
    std::cout << "========================================" << std::endl;
    return 0;
}
