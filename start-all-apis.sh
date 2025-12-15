#!/bin/bash
# Script to start all API servers

echo "🚀 Starting All API Servers..."
echo ""

# Check if servers are already running
if lsof -ti:8787 > /dev/null 2>&1; then
  echo "⚠️  Port 8787 is already in use. Stopping existing process..."
  lsof -ti:8787 | xargs kill -9 2>/dev/null
  sleep 1
fi

if lsof -ti:8788 > /dev/null 2>&1; then
  echo "⚠️  Port 8788 is already in use. Stopping existing process..."
  lsof -ti:8788 | xargs kill -9 2>/dev/null
  sleep 1
fi

# Set UPC API Key (if not already set)
if [ -z "$UPC_API_KEY" ]; then
  export UPC_API_KEY="4190D3F1E6057DD921DA7E426A79AAF3"
  echo "✅ Set UPC_API_KEY"
fi

# Set Spoonacular API Key (if not already set)
if [ -z "$SPOONACULAR_API_KEY" ] && [ -z "$UPC_API_KEY2" ]; then
  export SPOONACULAR_API_KEY="6da1ac7558c34c9d9c314d1172952a6a"
  echo "✅ Set SPOONACULAR_API_KEY"
fi

# Start UPC Proxy Server (Port 8787)
echo "📡 Starting UPC Proxy Server on port 8787..."
cd "$(dirname "$0")"
nohup node server/proxy.js > /tmp/proxy.log 2>&1 &
PROXY_PID=$!
echo $PROXY_PID > /tmp/proxy.pid
sleep 2

if ps -p $PROXY_PID > /dev/null; then
  echo "✅ UPC Proxy Server started (PID: $PROXY_PID)"
else
  echo "❌ Failed to start UPC Proxy Server. Check /tmp/proxy.log"
  exit 1
fi

# Start Recipe API Server (Port 8788)
echo "🍳 Starting Recipe API Server on port 8788..."
nohup node server/RecipeDB.js > /tmp/recipe.log 2>&1 &
RECIPE_PID=$!
echo $RECIPE_PID > /tmp/recipe.pid
sleep 2

if ps -p $RECIPE_PID > /dev/null; then
  echo "✅ Recipe API Server started (PID: $RECIPE_PID)"
  if [ -z "$SPOONACULAR_API_KEY" ] && [ -z "$UPC_API_KEY2" ]; then
    echo "⚠️  Warning: SPOONACULAR_API_KEY not set. Recipe API will not work without it."
    echo "   Set it with: export SPOONACULAR_API_KEY=your_key"
  else
    echo "✅ Recipe API key configured"
  fi
else
  echo "❌ Failed to start Recipe API Server. Check /tmp/recipe.log"
  exit 1
fi

echo ""
echo "🎉 All servers started successfully!"
echo ""
echo "📊 Server Status:"
echo "   UPC Proxy:    http://localhost:8787 (PID: $PROXY_PID)"
echo "   Recipe API:   http://localhost:8788 (PID: $RECIPE_PID)"
echo ""
echo "📝 Logs:"
echo "   Proxy log:    tail -f /tmp/proxy.log"
echo "   Recipe log:   tail -f /tmp/recipe.log"
echo ""
echo "🧪 Test APIs:"
echo "   node test-apis.js"
echo ""
echo "🛑 To stop servers:"
echo "   kill $PROXY_PID $RECIPE_PID"
echo "   or: pkill -f 'node server/proxy.js' && pkill -f 'node server/RecipeDB.js'"


