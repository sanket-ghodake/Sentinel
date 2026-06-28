#!/bin/bash
set -e

# Clean up stale DB cache before running tests to prevent state contamination
rm -f sentinel_cache.db

echo "=== Building Plugins ==="
g++ -std=c++20 -shared -fPIC -o plugins/clang-tidy/libsentinel-clang-tidy.so plugins/clang-tidy/ClangTidyPlugin.cpp core/runtime/ProcessRunner.cpp core/compiler/CompileCommandsParser.cpp -Isdk/include -I.
echo "Built ClangTidy plugin"

g++ -std=c++20 -shared -fPIC -o plugins/cppcheck/libsentinel-cppcheck.so plugins/cppcheck/CppcheckPlugin.cpp core/runtime/ProcessRunner.cpp -Isdk/include -I.
echo "Built Cppcheck plugin"

echo "=== Building Unit Tests ==="

# 1. test_domain
g++ -std=c++20 -o tests/unit/test_domain tests/unit/test_domain.cpp -Isdk/include -I.
echo "Built test_domain"

# 2. test_database
g++ -std=c++20 -o tests/unit/test_database tests/unit/test_database.cpp core/storage/Database.cpp core/event_bus/EventBus.cpp -Isdk/include -I. -lsqlite3
echo "Built test_database"

# 3. test_event_bus
g++ -std=c++20 -o tests/unit/test_event_bus tests/unit/test_event_bus.cpp core/event_bus/EventBus.cpp -Isdk/include -I.
echo "Built test_event_bus"

# 4. test_fake_data
g++ -std=c++20 -o tests/unit/test_fake_data tests/unit/test_fake_data.cpp core/fake_data/FakeClientApi.cpp core/storage/Database.cpp core/event_bus/EventBus.cpp -Isdk/include -I. -lsqlite3
echo "Built test_fake_data"

# 5. test_plugin_loader
g++ -std=c++20 -o tests/unit/test_plugin_loader tests/unit/test_plugin_loader.cpp core/analyzer/PluginLoader.cpp -Isdk/include -I. -ldl
echo "Built test_plugin_loader"

# 6. test_json
g++ -std=c++20 -o tests/unit/test_json tests/unit/test_json.cpp core/ipc/JsonRpcHandler.cpp -Isdk/include -I.
echo "Built test_json"

# 7. test_process_runner
g++ -std=c++20 -o tests/unit/test_process_runner tests/unit/test_process_runner.cpp core/runtime/ProcessRunner.cpp -Isdk/include -I.
echo "Built test_process_runner"

# 8. test_compile_commands_parser
g++ -std=c++20 -o tests/unit/test_compile_commands_parser tests/unit/test_compile_commands_parser.cpp core/compiler/CompileCommandsParser.cpp -Isdk/include -I.
echo "Built test_compile_commands_parser"

echo "=== Running Unit Tests ==="
./tests/unit/test_domain
./tests/unit/test_database
./tests/unit/test_event_bus
./tests/unit/test_fake_data
./tests/unit/test_plugin_loader plugins/clang-tidy/libsentinel-clang-tidy.so plugins/cppcheck/libsentinel-cppcheck.so
./tests/unit/test_json
./tests/unit/test_process_runner
./tests/unit/test_compile_commands_parser

echo "=== All Unit Tests Passed ==="
