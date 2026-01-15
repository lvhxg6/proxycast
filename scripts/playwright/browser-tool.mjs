#!/usr/bin/env node
/**
 * Playwright Browser Tool for AI Agent
 *
 * 提供浏览器自动化功能，专为 AI Agent 设计
 * 输出结构化的可访问性树，便于 AI 理解页面结构
 */

import { chromium } from 'playwright';

// 全局浏览器实例（保持会话）
let browser = null;
let context = null;
let page = null;

// 元素引用映射
let elementRefs = new Map();
let refCounter = 0;

/**
 * 初始化浏览器
 */
async function initBrowser(headless = true) {
  if (!browser) {
    browser = await chromium.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    page = await context.newPage();
  }
  return { browser, context, page };
}

/**
 * 获取页面可访问性树快照
 * 为每个元素生成唯一引用 ID（如 @e1, @e2）
 */
async function getSnapshot(interactiveOnly = false) {
  if (!page) throw new Error('浏览器未初始化，请先执行 open 操作');

  // 清空之前的引用
  elementRefs.clear();
  refCounter = 0;

  // 获取可访问性树
  const snapshot = await page.accessibility.snapshot({ interestingOnly: interactiveOnly });

  if (!snapshot) {
    return { tree: '(empty page)', refs: {} };
  }

  // 递归处理节点，添加引用 ID
  function processNode(node, depth = 0) {
    const indent = '  '.repeat(depth);
    const ref = `@e${++refCounter}`;

    // 存储元素引用（通过角色和名称定位）
    elementRefs.set(ref, {
      role: node.role,
      name: node.name,
      // 构建选择器
      selector: buildSelector(node)
    });

    let line = `${indent}${ref} [${node.role}]`;

    if (node.name) {
      line += ` "${node.name}"`;
    }
    if (node.value) {
      line += ` value="${node.value}"`;
    }
    if (node.checked !== undefined) {
      line += ` checked=${node.checked}`;
    }
    if (node.pressed !== undefined) {
      line += ` pressed=${node.pressed}`;
    }
    if (node.selected !== undefined) {
      line += ` selected=${node.selected}`;
    }
    if (node.disabled) {
      line += ` (disabled)`;
    }

    let result = line + '\n';

    if (node.children) {
      for (const child of node.children) {
        result += processNode(child, depth + 1);
      }
    }

    return result;
  }

  function buildSelector(node) {
    // 优先使用 aria-label 或 role + name 组合
    if (node.name) {
      const role = node.role.toLowerCase();
      // 尝试多种选择器策略
      return `role=${role}[name="${node.name}"]`;
    }
    return null;
  }

  const tree = processNode(snapshot);

  // 转换 Map 为普通对象
  const refs = {};
  for (const [key, value] of elementRefs) {
    refs[key] = value;
  }

  return { tree, refs };
}

/**
 * 解析选择器（支持 @e1 格式的引用）
 */
function resolveSelector(selector) {
  if (selector.startsWith('@e')) {
    const ref = elementRefs.get(selector);
    if (!ref) {
      throw new Error(`未找到元素引用: ${selector}，请先执行 snapshot 获取最新的元素引用`);
    }
    return ref.selector || `text="${ref.name}"`;
  }
  return selector;
}

/**
 * 执行浏览器操作
 */
async function executeAction(action, headless = true) {
  const result = {
    success: true,
    output: '',
    url: null,
    title: null,
    screenshot: null,
    error: null
  };

  try {
    switch (action.open?.url ? 'open' : Object.keys(action)[0]) {
      case 'open': {
        const url = action.open?.url || action.url;
        await initBrowser(headless);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        result.url = page.url();
        result.title = await page.title();
        result.output = `已打开页面: ${result.title}`;
        break;
      }

      case 'snapshot': {
        if (!page) throw new Error('浏览器未初始化');
        const interactiveOnly = action.snapshot?.interactive_only || action.interactive_only || false;
        const { tree, refs } = await getSnapshot(interactiveOnly);
        result.url = page.url();
        result.title = await page.title();
        result.output = `页面可访问性树:\n\n${tree}\n\n共 ${Object.keys(refs).length} 个元素`;
        break;
      }

      case 'click': {
        if (!page) throw new Error('浏览器未初始化');
        const selector = resolveSelector(action.click?.selector || action.selector);
        await page.click(selector, { timeout: 5000 });
        result.output = `已点击元素: ${action.click?.selector || action.selector}`;
        break;
      }

      case 'fill': {
        if (!page) throw new Error('浏览器未初始化');
        const selector = resolveSelector(action.fill?.selector || action.selector);
        const value = action.fill?.value || action.value;
        await page.fill(selector, value, { timeout: 5000 });
        result.output = `已填充表单: ${action.fill?.selector || action.selector} = "${value}"`;
        break;
      }

      case 'type': {
        if (!page) throw new Error('浏览器未初始化');
        const selector = resolveSelector(action.type?.selector || action.selector);
        const text = action.type?.text || action.text;
        await page.type(selector, text, { delay: 50 });
        result.output = `已输入文本: "${text}"`;
        break;
      }

      case 'press': {
        if (!page) throw new Error('浏览器未初始化');
        const key = action.press?.key || action.key;
        await page.keyboard.press(key);
        result.output = `已按键: ${key}`;
        break;
      }

      case 'scroll': {
        if (!page) throw new Error('浏览器未初始化');
        const direction = action.scroll?.direction || action.direction || 'down';
        const amount = action.scroll?.amount || action.amount || 500;

        let deltaX = 0, deltaY = 0;
        switch (direction) {
          case 'up': deltaY = -amount; break;
          case 'down': deltaY = amount; break;
          case 'left': deltaX = -amount; break;
          case 'right': deltaX = amount; break;
        }

        await page.mouse.wheel(deltaX, deltaY);
        result.output = `已滚动: ${direction} ${amount}px`;
        break;
      }

      case 'wait_for': {
        if (!page) throw new Error('浏览器未初始化');
        const selector = resolveSelector(action.wait_for?.selector || action.selector);
        const timeoutMs = action.wait_for?.timeout_ms || action.timeout_ms || 5000;
        await page.waitForSelector(selector, { timeout: timeoutMs });
        result.output = `元素已出现: ${action.wait_for?.selector || action.selector}`;
        break;
      }

      case 'screenshot': {
        if (!page) throw new Error('浏览器未初始化');
        const fullPage = action.screenshot?.full_page || action.full_page || false;
        const path = action.screenshot?.path || action.path;

        const options = { fullPage };
        if (path) {
          options.path = path;
          await page.screenshot(options);
          result.output = `截图已保存: ${path}`;
        } else {
          const buffer = await page.screenshot(options);
          result.screenshot = buffer.toString('base64');
          result.output = '截图已生成（base64）';
        }
        break;
      }

      case 'get_text': {
        if (!page) throw new Error('浏览器未初始化');
        const selector = action.get_text?.selector || action.selector;

        let text;
        if (selector) {
          const resolved = resolveSelector(selector);
          text = await page.textContent(resolved);
        } else {
          text = await page.evaluate(() => document.body.innerText);
        }

        result.output = text || '(empty)';
        break;
      }

      case 'evaluate': {
        if (!page) throw new Error('浏览器未初始化');
        const script = action.evaluate?.script || action.script;
        const evalResult = await page.evaluate(script);
        result.output = JSON.stringify(evalResult, null, 2);
        break;
      }

      case 'close': {
        if (browser) {
          await browser.close();
          browser = null;
          context = null;
          page = null;
          elementRefs.clear();
        }
        result.output = '浏览器已关闭';
        break;
      }

      default:
        throw new Error(`未知操作: ${JSON.stringify(action)}`);
    }
  } catch (error) {
    result.success = false;
    result.error = error.message;
    result.output = `操作失败: ${error.message}`;
  }

  return result;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  let actionJson = null;
  let headless = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--action' && args[i + 1]) {
      actionJson = args[i + 1];
      i++;
    } else if (args[i] === '--headless') {
      headless = true;
    } else if (args[i] === '--no-headless') {
      headless = false;
    }
  }

  if (!actionJson) {
    console.error('Usage: browser-tool.mjs --action <json> [--headless|--no-headless]');
    process.exit(1);
  }

  try {
    const action = JSON.parse(actionJson);
    const result = await executeAction(action, headless);
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log(JSON.stringify({
      success: false,
      output: '',
      error: error.message
    }));
    process.exit(1);
  }
}

// 处理进程退出
process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});

process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

main();
