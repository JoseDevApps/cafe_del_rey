#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  setup-podman.sh — Café del Rey
#  Installs and configures Podman + podman-compose for this project.
#  Tested on: Ubuntu 22.04/24.04, Fedora 38+, Debian 12, macOS (Homebrew)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── 0. Detect OS ──────────────────────────────────────────────────────────────
OS="unknown"
if   [[ -f /etc/os-release ]]; then source /etc/os-release; OS="${ID:-unknown}"
elif [[ "$(uname)" == "Darwin" ]]; then OS="macos"; fi
info "Detected OS: $OS"

# ── 1. Install Podman ─────────────────────────────────────────────────────────
install_podman() {
  if command -v podman &>/dev/null; then
    success "Podman already installed: $(podman --version)"
    return
  fi

  info "Installing Podman..."
  case "$OS" in
    ubuntu|debian)
      sudo apt-get update -qq
      sudo apt-get install -y podman fuse-overlayfs slirp4netns
      ;;
    fedora)
      sudo dnf install -y podman
      ;;
    centos|rhel)
      sudo dnf install -y podman
      ;;
    arch)
      sudo pacman -Sy --noconfirm podman fuse-overlayfs slirp4netns
      ;;
    macos)
      brew install podman
      podman machine init --cpus 2 --memory 4096 --disk-size 20
      podman machine start
      ;;
    *)
      warn "Unknown OS '$OS'. Please install Podman manually: https://podman.io/getting-started/installation"
      ;;
  esac

  if command -v podman &>/dev/null; then
    success "Podman installed: $(podman --version)"
  else
    error "Podman installation failed."
  fi
}

# ── 2. Configure rootless (Linux only) ───────────────────────────────────────
configure_rootless() {
  if [[ "$OS" == "macos" ]]; then return; fi

  info "Configuring rootless Podman..."

  # Ensure /etc/subuid and /etc/subgid have entries for current user
  USER_NAME="${USER:-$(whoami)}"
  if ! grep -q "^${USER_NAME}:" /etc/subuid 2>/dev/null; then
    warn "/etc/subuid has no entry for $USER_NAME. Adding..."
    echo "${USER_NAME}:100000:65536" | sudo tee -a /etc/subuid > /dev/null
  fi
  if ! grep -q "^${USER_NAME}:" /etc/subgid 2>/dev/null; then
    warn "/etc/subgid has no entry for $USER_NAME. Adding..."
    echo "${USER_NAME}:100000:65536" | sudo tee -a /etc/subgid > /dev/null
  fi

  # Enable lingering so Podman systemd units survive logout
  if command -v loginctl &>/dev/null; then
    loginctl enable-linger "$USER_NAME" 2>/dev/null || true
    success "Lingering enabled for $USER_NAME"
  fi

  # Ensure user owns the XDG_RUNTIME_DIR socket dir
  XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
  mkdir -p "${XDG_RUNTIME_DIR}/containers" 2>/dev/null || true

  success "Rootless configuration complete."
}

# ── 3. Install podman-compose ─────────────────────────────────────────────────
install_podman_compose() {
  # Podman >= 4.4 ships `podman compose` built-in (calls docker-compose or podman-compose)
  PODMAN_VERSION=$(podman --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
  MAJOR=$(echo "$PODMAN_VERSION" | cut -d. -f1)
  MINOR=$(echo "$PODMAN_VERSION" | cut -d. -f2)

  if [[ "$MAJOR" -gt 4 ]] || [[ "$MAJOR" -eq 4 && "$MINOR" -ge 4 ]]; then
    success "Podman $PODMAN_VERSION includes built-in 'podman compose'. No extra install needed."
  fi

  if command -v podman-compose &>/dev/null; then
    success "podman-compose already installed: $(podman-compose --version)"
    return
  fi

  info "Installing podman-compose via pip..."
  if command -v pip3 &>/dev/null; then
    pip3 install --user podman-compose
  elif command -v pip &>/dev/null; then
    pip install --user podman-compose
  else
    warn "pip not found. Install manually: pip install podman-compose"
    return
  fi

  # Ensure ~/.local/bin is in PATH
  if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    warn "Add ~/.local/bin to your PATH:"
    echo '  export PATH="$HOME/.local/bin:$PATH"'
    echo '  # Add this to your ~/.bashrc or ~/.zshrc'
  fi

  success "podman-compose installed."
}

# ── 4. Verify setup ───────────────────────────────────────────────────────────
verify() {
  info "Verifying setup..."
  echo ""
  echo "  podman version  : $(podman --version 2>/dev/null || echo 'NOT FOUND')"
  echo "  podman-compose  : $(podman-compose --version 2>/dev/null || echo 'not installed (optional)')"
  echo "  podman compose  : $(podman compose version 2>/dev/null | head -1 || echo 'not available')"
  echo ""

  # Quick smoke test
  if podman run --rm hello-world &>/dev/null; then
    success "Rootless Podman smoke test passed."
  else
    warn "Smoke test failed. Try: podman system migrate && podman run --rm hello-world"
  fi
}

# ── 5. Print usage ─────────────────────────────────────────────────────────────
print_usage() {
  echo ""
  echo -e "${CYAN}════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  Café del Rey — Podman setup complete!${NC}"
  echo -e "${CYAN}════════════════════════════════════════════${NC}"
  echo ""
  echo "  Start with podman-compose:"
  echo "    podman-compose -f podman-compose.yml up --build"
  echo ""
  echo "  Or with Makefile:"
  echo "    make podman-up"
  echo ""
  echo "  Services:"
  echo "    Frontend  →  http://localhost:4001"
  echo "    API       →  http://localhost:8000"
  echo "    Swagger   →  http://localhost:8000/docs"
  echo "    Admin     →  http://localhost:4001/admin"
  echo ""
  echo "  Credentials: superadmin / cafedelrey2025"
  echo "  (Change in api/.env before deploying to production)"
  echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo -e "${CYAN}  Café del Rey — Podman Setup${NC}"
  echo ""

  install_podman
  configure_rootless
  install_podman_compose
  verify
  print_usage
}

main "$@"
