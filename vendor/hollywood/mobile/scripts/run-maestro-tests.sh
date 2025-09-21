#!/bin/bash

# Maestro Test Runner Script
# This script runs all Maestro tests and generates reports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Starting Maestro Tests..."

# Check if Maestro is installed
if ! command -v maestro &> /dev/null; then
    echo -e "${RED}❌ Maestro is not installed${NC}"
    echo "Please install Maestro: curl -Ls https://get.maestro.mobile.dev | bash"
    exit 1
fi

# Create test results directories
mkdir -p test-results/screenshots
mkdir -p test-results/videos
mkdir -p test-results/reports

# Function to run a test flow
run_test() {
    local flow_name=$1
    local flow_path=$2
    
    echo -e "${YELLOW}Running test: $flow_name${NC}"
    
    if maestro test "$flow_path" \
        --format junit \
        --output "test-results/reports/${flow_name}.xml"; then
        echo -e "${GREEN}✅ $flow_name passed${NC}"
        return 0
    else
        echo -e "${RED}❌ $flow_name failed${NC}"
        return 1
    fi
}

# Track test results
FAILED_TESTS=()
PASSED_TESTS=()

# Run all test flows
for flow in .maestro/flows/*.yaml; do
    if [ -f "$flow" ]; then
        flow_name=$(basename "$flow" .yaml)
        if run_test "$flow_name" "$flow"; then
            PASSED_TESTS+=("$flow_name")
        else
            FAILED_TESTS+=("$flow_name")
        fi
    fi
done

echo ""
echo "📊 Test Results Summary"
echo "========================"
echo -e "${GREEN}Passed: ${#PASSED_TESTS[@]} tests${NC}"
for test in "${PASSED_TESTS[@]}"; do
    echo -e "  ${GREEN}✅${NC} $test"
done

if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    echo -e "${RED}Failed: ${#FAILED_TESTS[@]} tests${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}❌${NC} $test"
    done
fi

# Generate HTML report
echo ""
echo "📝 Generating HTML report..."
maestro report \
    --input test-results/reports \
    --output test-results/reports/index.html

echo -e "${GREEN}✨ Report generated at: test-results/reports/index.html${NC}"

# Open report in browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open test-results/reports/index.html
fi

# Exit with error if any tests failed
if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    exit 1
fi

echo -e "${GREEN}🎉 All tests passed!${NC}"
