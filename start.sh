#!/bin/sh
# Start the Node.js API server in the background on port 5000
PORT=5000 node server/server.js &

# Run Apache in the foreground as the primary process (replaces the shell)
exec apache2-foreground