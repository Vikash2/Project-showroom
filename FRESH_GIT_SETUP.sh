#!/bin/bash

# Fresh Git Repository Setup Script
# This script will create a clean git repository without any sensitive files

echo "🔄 Starting fresh git repository setup..."
echo ""

# Step 1: Backup current git history (optional)
echo "📦 Step 1: Creating backup of current git history..."
if [ -d .git ]; then
    mv .git .git.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up old .git to .git.backup.*"
else
    echo "ℹ️  No existing .git directory found"
fi

# Step 2: Verify .gitignore files exist
echo ""
echo "🔍 Step 2: Verifying .gitignore files..."
if [ ! -f .gitignore ]; then
    echo "❌ Root .gitignore not found!"
    exit 1
fi
echo "✅ Root .gitignore exists"

# Step 3: Verify sensitive files are NOT in working directory for commit
echo ""
echo "🔒 Step 3: Checking for sensitive files..."
SENSITIVE_FILES=$(find . -type f \( -name "*.env" ! -name "*.env.example" \) -o -name "serviceAccountKey.json" | grep -v node_modules | grep -v .git)

if [ ! -z "$SENSITIVE_FILES" ]; then
    echo "⚠️  Found sensitive files (these will be ignored by .gitignore):"
    echo "$SENSITIVE_FILES"
    echo ""
    echo "Verifying they are in .gitignore..."
    
    # Check if .env is in .gitignore
    if grep -q "^\.env$" .gitignore; then
        echo "✅ .env is in .gitignore"
    else
        echo "❌ .env is NOT in .gitignore!"
        exit 1
    fi
    
    if grep -q "serviceAccountKey.json" .gitignore; then
        echo "✅ serviceAccountKey.json is in .gitignore"
    else
        echo "❌ serviceAccountKey.json is NOT in .gitignore!"
        exit 1
    fi
else
    echo "✅ No sensitive files found in working directory"
fi

# Step 4: Initialize new git repository
echo ""
echo "🎯 Step 4: Initializing fresh git repository..."
git init
echo "✅ Git repository initialized"

# Step 5: Add remote
echo ""
echo "🌐 Step 5: Adding GitHub remote..."
git remote add origin https://github.com/Vikash2/Project-showroom.git
echo "✅ Remote 'origin' added"

# Step 6: Stage all files (respecting .gitignore)
echo ""
echo "📝 Step 6: Staging files (excluding .gitignore patterns)..."
git add .

# Step 7: Show what will be committed
echo ""
echo "📋 Step 7: Files to be committed:"
git status --short | head -20
echo ""
echo "Total files staged: $(git diff --cached --name-only | wc -l)"

# Step 8: Verify no sensitive files are staged
echo ""
echo "🔐 Step 8: Verifying no sensitive files are staged..."
STAGED_SENSITIVE=$(git diff --cached --name-only | grep -E "\.env$|serviceAccountKey\.json" | grep -v "\.env\.example")

if [ ! -z "$STAGED_SENSITIVE" ]; then
    echo "❌ ERROR: Sensitive files are staged for commit!"
    echo "$STAGED_SENSITIVE"
    echo ""
    echo "Aborting! Please check your .gitignore file."
    exit 1
else
    echo "✅ No sensitive files staged - safe to commit!"
fi

# Step 9: Create initial commit
echo ""
echo "💾 Step 9: Creating initial commit..."
git commit -m "Initial commit: Vehicle Showroom Management System

- Backend API with Node.js/Express
- Frontend with React/TypeScript
- Supabase integration
- Sales, booking, and inquiry management
- User authentication and authorization
- Document management system"

echo "✅ Initial commit created"

# Step 10: Show summary
echo ""
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git log --oneline
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Fresh git repository setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Review the commit: git show --stat"
echo "   2. Push to GitHub: git push -u origin main"
echo ""
echo "⚠️  Note: If GitHub repository already has commits, you may need:"
echo "   git push -u origin main --force"
echo ""
