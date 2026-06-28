# hadolint ignore=DL3007
FROM sentinel-dev:latest

USER root

# Install Qt6 and WebEngine/WebChannel development packages
# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    qt6-base-dev \
    qt6-base-dev-tools \
    qt6-webengine-dev \
    qt6-webchannel-dev \
    && rm -rf /var/lib/apt/lists/*

USER developer
WORKDIR /workspace/sentinel
