FROM alpine:3.19

# Install base utilities, runtimes, and linters/formatters
# hadolint ignore=DL3018,DL3013,DL3016,DL3047
RUN apk add --no-cache \
    bash \
    git \
    python3 \
    py3-pip \
    nodejs \
    npm \
    clang-extra-tools \
    shellcheck \
    curl \
    wget \
    && pip3 install --no-cache-dir --break-system-packages pre-commit pre-commit-hooks \
    && wget -q -O /usr/local/bin/hadolint https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Linux-x86_64 \
    && chmod +x /usr/local/bin/hadolint \
    && wget -q -O /usr/local/bin/shfmt https://github.com/mvdan/sh/releases/download/v3.7.0/shfmt_v3.7.0_linux_amd64 \
    && chmod +x /usr/local/bin/shfmt \
    && npm install -g \
    eslint@8 \
    prettier@3 \
    markdownlint-cli \
    @commitlint/cli@19 \
    @commitlint/config-conventional@19




# Set global Node.js module path for resolving lint configurations
ENV NODE_PATH=/usr/local/lib/node_modules

# Create workspace directory
WORKDIR /workspace/sentinel

# Copy the entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
