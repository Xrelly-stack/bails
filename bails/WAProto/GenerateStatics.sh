#!/bin/bash
# Script to generate WAProto statics
# Usage: sh WAProto/GenerateStatics.sh

# Generate JS
npx pbjs -t static-module -w es6 -o WAProto/index.js WAProto/WAProto.proto

# Fix imports
node WAProto/fix-imports.js

# Generate TS definitions
npx pbts -o WAProto/index.d.ts WAProto/index.js
