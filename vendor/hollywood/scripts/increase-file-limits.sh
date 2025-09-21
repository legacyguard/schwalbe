#!/bin/bash

# Script to increase file limits for macOS to prevent "too many open files" errors

echo "Increasing file limits for the current session..."

# Set soft limit
ulimit -n 10240

# Check if we need to update system limits
if [ "$(uname)" == "Darwin" ]; then
    echo "Detected macOS. Checking system limits..."
    
    # Check current limits
    CURRENT_LIMIT=$(launchctl limit maxfiles | awk '{print $2}')
    
    if [ "$CURRENT_LIMIT" -lt "10240" ]; then
        echo "Current limit is $CURRENT_LIMIT. Attempting to increase..."
        
        # Create a temporary plist file for increasing limits
        cat > ~/Library/LaunchDaemons/limit.maxfiles.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
        <string>launchctl</string>
        <string>limit</string>
        <string>maxfiles</string>
        <string>10240</string>
        <string>10240</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOF
        
        echo "You may need to restart your system for permanent changes."
        echo "For now, run this command in your terminal:"
        echo "  ulimit -n 10240"
    else
        echo "System limit is already sufficient: $CURRENT_LIMIT"
    fi
fi

echo "Current file limit: $(ulimit -n)"
echo ""
echo "To build the project, run:"
echo "  ulimit -n 10240 && npm run build"
