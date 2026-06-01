#!/bin/bash

# 上传到 GitHub 的脚本

echo "=== 上传到 GitHub ==="
echo ""
echo "请按以下步骤操作："
echo ""
echo "1. 在浏览器中打开 https://github.com/new"
echo "   创建新仓库，名称: lambo-review-monitor"
echo "   选择 Public 或 Private，然后点击 Create repository"
echo ""
echo "2. 复制下面的命令并在终端中执行："
echo ""
echo "   cd $(pwd)/lambo-review-monitor"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR_USERNAME/lambo-review-monitor.git"
echo "   git push -u origin main"
echo ""
echo "3. 把 YOUR_USERNAME 替换为你的 GitHub 用户名"
echo ""
echo "或者使用 GitHub CLI（如果已安装）："
echo "   cd $(pwd)/lambo-review-monitor"
echo "   gh repo create lambo-review-monitor --public --source=. --push"
echo ""

