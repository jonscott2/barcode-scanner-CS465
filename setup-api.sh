#!/bin/bash
# Setup script for UPC Database API key
# Usage: source setup-api.sh

export UPC_API_KEY="4190D3F1E6057DD921DA7E426A79AAF3"
echo "UPC_API_KEY has been set to: ${UPC_API_KEY:0:8}...${UPC_API_KEY: -8}"
echo ""
echo "To start the proxy server, run:"
echo "  npm run start:proxy"
echo ""
echo "Or in a new terminal:"
echo "  export UPC_API_KEY=\"4190D3F1E6057DD921DA7E426A79AAF3\""
echo "  npm run start:proxy"
