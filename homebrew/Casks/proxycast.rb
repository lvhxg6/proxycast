cask "proxycast" do
  version "0.37.0"

  on_arm do
    sha256 "REPLACE_WITH_ARM64_SHA256"
    url "https://github.com/aiclientproxy/proxycast/releases/download/v#{version}/ProxyCast_#{version}_aarch64.dmg"
  end

  on_intel do
    sha256 "REPLACE_WITH_X64_SHA256"
    url "https://github.com/aiclientproxy/proxycast/releases/download/v#{version}/ProxyCast_#{version}_x64.dmg"
  end

  name "ProxyCast"
  desc "AI 代理服务桌面应用 - 多 Provider 凭证池管理"
  homepage "https://github.com/aiclientproxy/proxycast"

  livecheck do
    url :url
    strategy :github_latest
  end

  app "ProxyCast.app"

  zap trash: [
    "~/Library/Application Support/com.proxycast.app",
    "~/Library/Caches/com.proxycast.app",
    "~/Library/Preferences/com.proxycast.app.plist",
    "~/Library/Saved Application State/com.proxycast.app.savedState",
  ]
end
