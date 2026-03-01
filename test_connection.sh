#!/bin/bash
# Try different possible database connections
echo "Testing possible database connections..."
echo ""
echo "1. Testing connection to a local PostgreSQL with user 'replit':"
psql "postgresql://replit@localhost/replit" -c "SELECT 1;" 2>&1 | head -3
echo ""
echo "2. Testing default postgres connection:"
psql "postgres://localhost" -c "SELECT 1;" 2>&1 | head -3
