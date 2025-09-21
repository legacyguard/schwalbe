#!/bin/bash

# Memory Optimization Setup Script for LegacyGuard Web
# This script helps configure and run memory-optimized Node.js processes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check system memory
check_system_memory() {
    print_header "Checking System Memory"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        total_mem=$(sysctl -n hw.memsize)
        total_gb=$((total_mem / 1024 / 1024 / 1024))
        print_status "Total system memory: ${total_gb}GB"
        
        if [ $total_gb -lt 16 ]; then
            print_warning "Your system has less than 16GB RAM. Consider using smaller memory limits."
            print_warning "Edit .env.memory to use smaller values like --max-old-space-size=4096"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        total_mem=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        total_gb=$((total_mem / 1024 / 1024))
        print_status "Total system memory: ${total_gb}GB"
        
        if [ $total_gb -lt 16 ]; then
            print_warning "Your system has less than 16GB RAM. Consider using smaller memory limits."
        fi
    else
        print_warning "Unable to detect system memory. Please ensure you have sufficient RAM."
    fi
}

# Setup memory environment
setup_memory_env() {
    print_header "Setting up Memory Environment"
    
    if [ -f ".env.memory" ]; then
        print_status "Loading memory optimization settings..."
        source .env.memory
        print_status "✓ Memory settings loaded"
    else
        print_error "❌ .env.memory file not found!"
        exit 1
    fi
}

# Clean up memory-heavy files
cleanup_large_files() {
    print_header "Cleaning up Large Files"
    
    # Move large files to temp directory
    if [ -f "lint-results.json" ]; then
        print_status "Moving lint-results.json to /tmp/"
        mv lint-results.json /tmp/lint-results-$(date +%s).json
    fi
    
    if [ -f "hardcoded-strings-report.json" ]; then
        print_status "Moving hardcoded-strings-report.json to /tmp/"
        mv hardcoded-strings-report.json /tmp/hardcoded-strings-report-$(date +%s).json
    fi
    
    # Clean build artifacts
    if [ -d "dist" ]; then
        print_status "Cleaning dist directory..."
        rm -rf dist
    fi
    
    if [ -d ".turbo" ]; then
        print_status "Cleaning .turbo cache..."
        rm -rf .turbo
    fi
    
    if [ -f ".tsbuildinfo" ]; then
        print_status "Cleaning TypeScript build info..."
        rm -f .tsbuildinfo
    fi
    
    print_status "✓ Cleanup completed"
}

# Install missing dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    if ! command -v cross-env &> /dev/null; then
        print_status "Installing cross-env globally..."
        npm install -g cross-env
    fi
    
    # Install local dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing node modules..."
        npm install
    fi
    
    print_status "✓ Dependencies ready"
}

# Monitor memory usage
monitor_memory() {
    print_header "Memory Monitoring Setup"
    
    print_status "To monitor Node.js memory usage during builds:"
    echo ""
    echo "Option 1 - Process monitoring:"
    echo "  watch 'ps aux | grep node'"
    echo ""
    echo "Option 2 - Activity Monitor (macOS):"
    echo "  Open Activity Monitor and filter for 'node'"
    echo ""
    echo "Option 3 - Enable V8 GC tracing:"
    echo "  export NODE_OPTIONS=\"\$NODE_OPTIONS --trace-gc\""
    echo ""
}

# Run memory-optimized command
run_command() {
    local cmd="$1"
    
    print_header "Running Memory-Optimized Command: $cmd"
    
    case "$cmd" in
        "dev")
            print_status "Starting development server with memory optimization..."
            npm run dev
            ;;
        "build")
            print_status "Building with memory optimization..."
            npm run build
            ;;
        "build-safe")
            print_status "Building with maximum memory safety..."
            npm run build:memory-safe
            ;;
        "lint")
            print_status "Running ESLint with memory optimization..."
            npm run lint:memory-safe
            ;;
        "type-check")
            print_status "Running TypeScript check with memory optimization..."
            npm run type-check
            ;;
        *)
            print_error "Unknown command: $cmd"
            echo "Available commands: dev, build, build-safe, lint, type-check"
            exit 1
            ;;
    esac
}

# Main function
main() {
    print_header "LegacyGuard Memory Optimization Setup"
    
    case "${1:-setup}" in
        "setup")
            check_system_memory
            setup_memory_env
            cleanup_large_files
            install_dependencies
            monitor_memory
            print_status "✓ Memory optimization setup complete!"
            echo ""
            print_status "Usage examples:"
            echo "  ./scripts/memory-setup.sh dev      # Start dev server"
            echo "  ./scripts/memory-setup.sh build    # Build project" 
            echo "  ./scripts/memory-setup.sh lint     # Run linter"
            ;;
        "dev"|"build"|"build-safe"|"lint"|"type-check")
            setup_memory_env
            run_command "$1"
            ;;
        "monitor")
            monitor_memory
            ;;
        "clean")
            cleanup_large_files
            ;;
        "check")
            check_system_memory
            ;;
        *)
            print_error "Unknown option: $1"
            echo ""
            echo "Usage: $0 [setup|dev|build|build-safe|lint|type-check|monitor|clean|check]"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
