#!/bin/bash

# Package script for Daily Sketching Chrome Extension
# This script creates a ZIP file ready for Chrome Web Store submission

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Configuration
EXTENSION_NAME="daily-sketching"
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
OUTPUT_DIR="dist"
ZIP_NAME="${EXTENSION_NAME}-v${VERSION}.zip"
TEMP_DIR="${OUTPUT_DIR}/temp"

echo -e "${BLUE}📦 Packaging Daily Sketching Extension v${VERSION}${NC}\n"

# Clean up previous builds
if [ -d "$OUTPUT_DIR" ]; then
    echo -e "${YELLOW}Cleaning up previous build...${NC}"
    rm -rf "$OUTPUT_DIR"
fi

# Create directories
mkdir -p "$TEMP_DIR"
mkdir -p "$OUTPUT_DIR"

# Copy core files
echo -e "${BLUE}Copying core files...${NC}"
cp manifest.json "$TEMP_DIR/"
cp background.js "$TEMP_DIR/"
cp timer.html "$TEMP_DIR/"
cp styles.css "$TEMP_DIR/"

# Copy icons directory (only the icons referenced in manifest)
echo -e "${BLUE}Copying icons...${NC}"
mkdir -p "$TEMP_DIR/icons"
cp icons/icon16.png "$TEMP_DIR/icons/" 2>/dev/null || echo "Warning: icon16.png not found"
cp icons/icon48.png "$TEMP_DIR/icons/" 2>/dev/null || echo "Warning: icon48.png not found"
cp icons/icon128.png "$TEMP_DIR/icons/" 2>/dev/null || echo "Warning: icon128.png not found"

# Copy JavaScript files
echo -e "${BLUE}Copying JavaScript files...${NC}"
mkdir -p "$TEMP_DIR/js"
for js_file in js/*.js; do
    if [ -f "$js_file" ]; then
        cp "$js_file" "$TEMP_DIR/js/"
    fi
done

# Verify required files exist
echo -e "\n${BLUE}Verifying required files...${NC}"
REQUIRED_FILES=(
    "manifest.json"
    "background.js"
    "timer.html"
    "styles.css"
    "icons/icon16.png"
    "icons/icon48.png"
    "icons/icon128.png"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$TEMP_DIR/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${YELLOW}Warning: Missing required files:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "  - $file"
    done
    echo ""
fi

# Count JavaScript files
JS_COUNT=$(find "$TEMP_DIR/js" -name "*.js" | wc -l | tr -d ' ')
echo -e "${GREEN}✓ Found $JS_COUNT JavaScript files${NC}"

# Create ZIP file
echo -e "\n${BLUE}Creating ZIP archive...${NC}"
cd "$TEMP_DIR"
zip -r "$SCRIPT_DIR/$OUTPUT_DIR/$ZIP_NAME" . -q
cd "$SCRIPT_DIR"

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Get file size
ZIP_SIZE=$(du -h "$OUTPUT_DIR/$ZIP_NAME" | cut -f1)

echo -e "\n${GREEN}✅ Package created successfully!${NC}"
echo -e "${GREEN}📦 File: ${OUTPUT_DIR}/${ZIP_NAME}${NC}"
echo -e "${GREEN}📊 Size: ${ZIP_SIZE}${NC}"
echo -e "\n${BLUE}Ready for Chrome Web Store submission!${NC}"
echo -e "${YELLOW}Upload this file to: https://chrome.google.com/webstore/devconsole${NC}\n"

