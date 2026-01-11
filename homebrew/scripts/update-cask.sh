#!/bin/bash
# 自动更新 ProxyCast Homebrew Cask 版本
# 用法: ./update-cask.sh <version>
# 示例: ./update-cask.sh 0.38.0

set -e

VERSION=$1
REPO="aiclientproxy/proxycast"
CASK_FILE="$(dirname "$0")/../Casks/proxycast.rb"

if [ -z "$VERSION" ]; then
    echo "用法: $0 <version>"
    echo "示例: $0 0.38.0"
    exit 1
fi

echo "🔄 更新 ProxyCast Cask 到版本 $VERSION"

# 下载 DMG 并计算 sha256
ARM64_URL="https://github.com/$REPO/releases/download/v$VERSION/ProxyCast_${VERSION}_aarch64.dmg"
X64_URL="https://github.com/$REPO/releases/download/v$VERSION/ProxyCast_${VERSION}_x64.dmg"

TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo "📥 下载 ARM64 DMG..."
curl -sL "$ARM64_URL" -o "$TEMP_DIR/arm64.dmg"
ARM64_SHA=$(shasum -a 256 "$TEMP_DIR/arm64.dmg" | awk '{print $1}')
echo "   SHA256: $ARM64_SHA"

echo "📥 下载 x64 DMG..."
curl -sL "$X64_URL" -o "$TEMP_DIR/x64.dmg"
X64_SHA=$(shasum -a 256 "$TEMP_DIR/x64.dmg" | awk '{print $1}')
echo "   SHA256: $X64_SHA"

# 更新 Cask 文件
echo "📝 更新 Cask 文件..."
sed -i '' "s/version \".*\"/version \"$VERSION\"/" "$CASK_FILE"
sed -i '' "/on_arm do/,/end/ s/sha256 \".*\"/sha256 \"$ARM64_SHA\"/" "$CASK_FILE"
sed -i '' "/on_intel do/,/end/ s/sha256 \".*\"/sha256 \"$X64_SHA\"/" "$CASK_FILE"

echo "✅ 更新完成！"
echo ""
echo "下一步："
echo "  1. git add Casks/proxycast.rb"
echo "  2. git commit -m 'chore: bump proxycast to $VERSION'"
echo "  3. git push"
