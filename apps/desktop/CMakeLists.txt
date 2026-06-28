cmake_minimum_required(VERSION 3.16)
project(sentinel-desktop LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Enable Qt's automatic Meta-Object Compiler (MOC)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

# Find Qt6 components
find_package(Qt6 REQUIRED COMPONENTS Core Widgets WebEngineWidgets WebChannel)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/../../sdk/include
    ${CMAKE_CURRENT_SOURCE_DIR}/../../
)

# Core Platform Source Files
set(CORE_SOURCES
    ${CMAKE_CURRENT_SOURCE_DIR}/../../core/event_bus/EventBus.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/../../core/fake_data/FakeClientApi.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/../../core/ipc/JsonRpcHandler.cpp
)

# Main Executable
add_executable(sentinel-desktop
    main.cpp
    WebBridge.h
    ${CORE_SOURCES}
)

# Link against Qt6 libraries
target_link_libraries(sentinel-desktop PRIVATE
    Qt6::Core
    Qt6::Widgets
    Qt6::WebEngineWidgets
    Qt6::WebChannel
)
