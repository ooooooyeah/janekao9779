// ==UserScript==
// @name         椰糕小铺之定时推文(失焦修复版)
// @namespace    https://github.com/ooooooyeah/janekao9779
// @version      0.4.1
// @description  批量创建X定时文本 - 基于原版优化 - 小窗模式
// @author       ooooooyeah
// @match        https://x.com/*
// @match        https://twitter.com/*
// @match        https://x.com/home

// @updateURL    https://github.com/ooooooyeah/janekao9779/raw/main/Planned.js
// @downloadURL  https://github.com/ooooooyeah/janekao9779/raw/main/Planned.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';
    if (!window.location.href.includes('x.com') && !window.location.href.includes('twitter.com')) {
        return;
    }

    function waitForPageReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    // 初始化脚本
    async function initializeScript() {
        await waitForPageReady();

        // 再等待一点时间确保X/Twitter界面加载完成
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('[椰糕小铺] 脚本开始初始化...');

        if (document.querySelector('.scheduler-btn')) {
            console.log('[椰糕小铺] 脚本已经运行，跳过重复初始化');
            return;
        }

        setupScheduler();
    }

    function setupScheduler() {
        console.log('[椰糕小铺] 开始创建界面...');

        // 创建样式（保持原版样式，增加进度显示）
        const style = document.createElement('style');
        style.textContent = `
        .scheduler-btn {
            position: fixed;
            right: 20px;
            top: 20px;
            z-index: 9999;
            padding: 8px 14px;
            background: #ED843F;
            color: white;
            border: none;
            border-radius: 9999px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(237, 132, 63, 0.3);
            transition: all 0.2s ease;
        }

        .scheduler-btn:hover {
            background: #ED843Fcc;
            box-shadow: 0 3px 8px rgba(237, 132, 63, 0.4);
        }

        .scheduler-form {
            position: fixed;
            right: 20px;
            top: 70px;
            background: #FEFFD4;
            padding: 14px;
            border-radius: 14px;
            box-shadow: 0 4px 15px rgba(237, 132, 63, 0.15), 0 2px 3px rgba(237, 132, 63, 0.1);
            z-index: 9999;
            width: 320px;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            border: 1px solid #F4C17F40;
            max-height: 85vh;
            overflow-y: auto;
        }

        .scheduler-form input {
            width: 100%;
            margin-bottom: 12px;
            padding: 8px;
            border: 1px solid #F4C17F;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
            background-color: white;
            transition: border-color 0.2s ease;
        }

        .scheduler-form input:focus {
            outline: none;
            border-color: #ED843F;
            box-shadow: 0 0 0 2px rgba(237, 132, 63, 0.1);
        }

        .scheduler-form textarea {
            width: 100%;
            margin-bottom: 12px;
            padding: 8px;
            border: 1px solid #F4C17F;
            border-radius: 6px;
            font-size: 14px;
            resize: vertical;
            min-height: 80px;
            box-sizing: border-box;
            background-color: white;
            transition: border-color 0.2s ease;
        }

        .scheduler-form textarea:focus {
            outline: none;
            border-color: #ED843F;
            box-shadow: 0 0 0 2px rgba(237, 132, 63, 0.1);
        }

        .scheduler-form label {
            display: block;
            margin-bottom: 6px;
            color: #744322;
            font-size: 13px;
            font-weight: 500;
        }

        .scheduler-form button {
            background: #ED843F;
            color: white;
            border: none;
            border-radius: 9999px;
            padding: 8px 16px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            margin-top: 8px;
            transition: background 0.2s ease;
        }

        .scheduler-form button:hover {
            background: #ED843Fcc;
        }

        .scheduler-form #scheduler-content {
            min-height: 120px;
            font-family: inherit;
            line-height: 1.5;
        }

        .scheduler-form #scheduler-suffix {
            min-height: 80px;
            font-family: inherit;
            line-height: 1.5;
        }

        .scheduler-form .image-upload {
            margin-bottom: 12px;
            padding: 8px;
            border: 1px dashed #F4C17F;
            border-radius: 6px;
            background-color: #FCEEAE10;
            cursor: pointer;
        }

        .scheduler-form .image-upload:hover {
            background-color: #FCEEAE20;
        }

        .scheduler-form .image-upload input {
            margin-bottom: 0;
            border: none;
            padding: 0;
            cursor: pointer;
        }

        .scheduler-form .image-count {
            color: #744322;
            font-size: 13px;
            margin-top: 4px;
        }

        .scheduler-form button.stop-btn {
            background: #744322;
        }

        .scheduler-form button.stop-btn:hover {
            background: #744322cc;
        }

        .button-container {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 8px;
        }

        .cat-icon-btn {
            background: #F4C17F;
            color: #744322;
            border: none;
            border-radius: 9999px;
            padding: 8px 16px;
            font-weight: bold;
            font-size: 14px;
            cursor: default;
            pointer-events: none;
        }

        /* 进度显示 */
        .progress-container {
            margin-top: 12px;
            display: none;
        }

        .progress-bar {
            width: 100%;
            height: 16px;
            background-color: #F4C17F;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 8px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #ED843F, #F4C17F);
            width: 0%;
            transition: width 0.3s ease;
        }

        .progress-text {
            font-size: 12px;
            color: #744322;
            text-align: center;
            margin-bottom: 4px;
        }

        .status-log {
            max-height: 100px;
            overflow-y: auto;
            background: white;
            border: 1px solid #F4C17F;
            border-radius: 6px;
            padding: 6px;
            font-size: 11px;
            color: #744322;
            margin-top: 6px;
        }

        .log-item {
            margin-bottom: 2px;
            padding: 2px 4px;
            border-radius: 3px;
        }

        .log-success {
            background-color: #d4edda;
            color: #155724;
        }

        .log-error {
            background-color: #f8d7da;
            color: #721c24;
        }

        .log-info {
            background-color: #d1ecf1;
            color: #0c5460;
        }

        /* 后台运行提示 */
        .background-notice {
            background: #fff3cd;
            color: #856404;
            padding: 8px;
            border-radius: 6px;
            font-size: 12px;
            margin-bottom: 12px;
            display: none;
            border: 1px solid #ffeaa7;
        }

        .keep-alive-indicator {
            position: fixed;
            right: 20px;
            top: 400px;
            background: rgba(237, 132, 63, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            z-index: 10000;
            display: none;
        }

        /* 小窗模式样式 */
        .mini-window {
            position: fixed;
            right: 350px;
            top: 70px;
            width: 280px;
            height: 400px;
            background: #FEFFD4;
            border: 2px solid #ED843F;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(237, 132, 63, 0.25);
            z-index: 10001;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            resize: both;
            overflow: hidden;
            min-width: 250px;
            min-height: 300px;
        }

        .mini-window-header {
            background: linear-gradient(90deg, #ED843F, #F4C17F);
            color: white;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            user-select: none;
        }

        .mini-window-controls {
            display: flex;
            gap: 4px;
        }

        .mini-window-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 3px;
            width: 16px;
            height: 16px;
            color: white;
            font-size: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .mini-window-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .mini-window-content {
            padding: 10px;
            height: calc(100% - 40px);
            overflow-y: auto;
            font-size: 11px;
        }

        .mini-progress {
            margin-bottom: 8px;
        }

        .mini-progress-text {
            font-size: 10px;
            color: #744322;
            margin-bottom: 3px;
            text-align: center;
        }

        .mini-progress-bar {
            height: 12px;
            background-color: #F4C17F;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 6px;
        }

        .mini-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #ED843F, #F4C17F);
            width: 0%;
            transition: width 0.3s ease;
        }

        .mini-status-log {
            height: 200px;
            overflow-y: auto;
            background: white;
            border: 1px solid #F4C17F;
            border-radius: 6px;
            padding: 4px;
            font-size: 9px;
            color: #744322;
        }

        .mini-log-item {
            margin-bottom: 1px;
            padding: 1px 3px;
            border-radius: 2px;
            line-height: 1.2;
        }

        .mini-controls {
            display: flex;
            gap: 4px;
            margin-top: 6px;
        }

        .mini-btn {
            flex: 1;
            background: #ED843F;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 10px;
            cursor: pointer;
        }

        .mini-btn:hover {
            background: #ED843Fcc;
        }

        .mini-btn.stop-btn {
            background: #744322;
        }

        .mini-toggle-btn {
            background: #F4C17F;
            color: #744322;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            margin-left: 8px;
        }

        .mini-toggle-btn:hover {
            background: #ED843F;
            color: white;
        }

        /* 让主表单在小窗模式时稍微缩小 */
        .scheduler-form.mini-mode {
            width: 300px;
        }

        /* 焦点保持指示器 */
        .focus-keeper {
            position: fixed;
            left: 20px;
            top: 20px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            z-index: 10000;
            display: none;
        }
    `;
        document.head.appendChild(style);

        // 创建按钮
        const btn = document.createElement('button');
        btn.className = 'scheduler-btn';
        btn.textContent = '定时发布';
        document.body.appendChild(btn);

        // 创建保活指示器
        const keepAliveIndicator = document.createElement('div');
        keepAliveIndicator.className = 'keep-alive-indicator';
        keepAliveIndicator.textContent = '后台保活中';
        document.body.appendChild(keepAliveIndicator);

        // 创建焦点保持指示器
        const focusKeeper = document.createElement('div');
        focusKeeper.className = 'focus-keeper';
        focusKeeper.textContent = '🎯 焦点保持';
        document.body.appendChild(focusKeeper);

        // 创建表单
        const form = document.createElement('div');
        form.className = 'scheduler-form';
        form.innerHTML = `
        <div class="background-notice" id="background-notice">
           ⚠️ 后台运行模式 - 建议保持此标签页可见以获得最佳效果
        </div>

        <label>起始时间（注意你在推特的时区）</label>
        <input type="datetime-local" id="scheduler-startTime">

        <label>发布间隔（分钟）</label>
        <input type="number" id="scheduler-interval" value="5">

        <label>推文内容（两个换行分隔不同推文）</label>
        <textarea id="scheduler-content" placeholder="输入推文内容...
每个推文之间用两个换行分隔

保持单个换行会在推文中显示为换行"></textarea>

        <label>推文后缀（每行一个话题or关键词）</label>
        <textarea id="scheduler-suffix" placeholder="#话题1
#话题2
#话题3"></textarea>

        <label>选择图片（可多选，一帖至多一张）</label>
        <div class="image-upload">
            <input type="file" id="scheduler-images" multiple accept="image/*">
        </div>
        <div id="image-count" class="image-count"></div>

        <div class="progress-container" id="progress-container">
            <div class="progress-text" id="progress-text">准备发布...</div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
            <div class="status-log" id="status-log"></div>
        </div>

        <div class="button-container">
            <button id="scheduler-generateBtn">生成定时推文</button>
            <button class="mini-toggle-btn" id="mini-toggle-btn">小窗模式</button>
            <button class="cat-icon-btn">
                <span style="font-size: 0.8em;">🐱</span>
                <span style="font-size: 1.2em;">🐱</span>
            </button>
        </div>

        <div style="color: #744322; font-size: 12px; margin-top: 12px; text-align: center;">@kaojanejanekao9779 | 失焦修复版v0.4.1</div>
    `;
        document.body.appendChild(form);

        // 创建小窗
        const miniWindow = document.createElement('div');
        miniWindow.className = 'mini-window';
        miniWindow.innerHTML = `
        <div class="mini-window-header" id="mini-header">
            <span>🐱 推文进度监控</span>
            <div class="mini-window-controls">
                <button class="mini-window-btn" id="mini-minimize">−</button>
                <button class="mini-window-btn" id="mini-close">×</button>
            </div>
        </div>
        <div class="mini-window-content">
            <div class="mini-progress" id="mini-progress">
                <div class="mini-progress-text" id="mini-progress-text">等待开始...</div>
                <div class="mini-progress-bar">
                    <div class="mini-progress-fill" id="mini-progress-fill"></div>
                </div>
            </div>
            <div class="mini-status-log" id="mini-status-log"></div>
            <div class="mini-controls">
                <button class="mini-btn" id="mini-stop-btn" style="display: none;">停止</button>
                <button class="mini-btn" id="mini-clear-log">清空日志</button>
            </div>
        </div>
    `;
        document.body.appendChild(miniWindow);

        // 状态变量
        let isGenerating = false;
        let shouldStop = false;
        let selectedImages = [];
        let keepAliveInterval = null;
        let backgroundMode = false;
        let miniWindowMode = false;
        let focusKeepInterval = null;

        // 后台保活机制（简化版）
        function startKeepAlive() {
            if (keepAliveInterval) return;

            keepAliveIndicator.style.display = 'block';
            keepAliveInterval = setInterval(() => {
                try {
                    if (!document.hidden) {
                        window.focus();
                        // 轻量级保活
                        const tweetBox = document.querySelector('[data-testid="tweetTextarea_0"]');
                        if (tweetBox) {
                            tweetBox.focus();
                        }
                    }
                } catch (error) {
                    console.log('Keep alive error:', error);
                }
            }, 5000); // 每5秒执行一次
        }

        function stopKeepAlive() {
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
                keepAliveInterval = null;
            }
            keepAliveIndicator.style.display = 'none';
        }

        // 焦点保持机制 - 专门为小窗模式设计
        function startFocusKeeping() {
            if (focusKeepInterval) return;

            focusKeeper.style.display = 'block';
            focusKeepInterval = setInterval(() => {
                try {
                    // 更积极的焦点保持策略
                    ensurePageFocused();

                    // 保持编辑器焦点
                    const editorDiv = document.querySelector('[data-testid="tweetTextarea_0"]');
                    if (editorDiv && isGenerating) {
                        editorDiv.focus();
                    }

                    // 模拟用户活动，防止浏览器认为页面不活跃
                    if (document.visibilityState === 'visible') {
                        // 轻微移动页面以保持活跃状态
                        const currentScroll = window.pageYOffset;
                        window.scrollTo(0, currentScroll + 1);
                        setTimeout(() => window.scrollTo(0, currentScroll), 50);
                    }

                } catch (error) {
                    console.log('Focus keep error:', error);
                }
            }, 1000); // 每1秒执行一次，更频繁的焦点保持
        }

        function stopFocusKeeping() {
            if (focusKeepInterval) {
                clearInterval(focusKeepInterval);
                focusKeepInterval = null;
            }
            focusKeeper.style.display = 'none';
        }

        // 页面状态监听
        document.addEventListener('visibilitychange', () => {
            if (isGenerating) {
                if (document.hidden) {
                    if (!backgroundMode) {
                        showBackgroundNotice();
                        startKeepAlive();
                        backgroundMode = true;
                    }
                } else {
                    if (backgroundMode) {
                        hideBackgroundNotice();
                        stopKeepAlive();
                        backgroundMode = false;
                    }
                }
            }
        });

        function showBackgroundNotice() {
            const notice = document.getElementById('background-notice');
            if (notice) notice.style.display = 'block';
            addLog('🔄 进入后台模式，启动保活机制', 'info');
        }

        function hideBackgroundNotice() {
            const notice = document.getElementById('background-notice');
            if (notice) notice.style.display = 'none';
            addLog('✅ 回到前台模式', 'info');
        }

        // 进度和日志功能
        function updateProgress(current, total, message = '') {
            const percentage = Math.round((current / total) * 100);
            const displayMessage = message || `进度: ${current}/${total} (${percentage}%)`;

            // 更新主窗口进度
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');
            const progressContainer = document.getElementById('progress-container');

            if (progressContainer) progressContainer.style.display = 'block';
            if (progressFill) progressFill.style.width = `${percentage}%`;
            if (progressText) progressText.textContent = displayMessage;

            // 更新小窗进度
            const miniProgressFill = document.getElementById('mini-progress-fill');
            const miniProgressText = document.getElementById('mini-progress-text');

            if (miniProgressFill) miniProgressFill.style.width = `${percentage}%`;
            if (miniProgressText) miniProgressText.textContent = displayMessage;
        }

        function hideProgress() {
            const progressContainer = document.getElementById('progress-container');
            if (progressContainer) progressContainer.style.display = 'none';
        }

        function addLog(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();

            // 更新主窗口日志
            const statusLog = document.getElementById('status-log');
            if (statusLog) {
                const logItem = document.createElement('div');
                logItem.className = `log-item log-${type}`;
                logItem.textContent = `[${timestamp}] ${message}`;
                statusLog.appendChild(logItem);
                statusLog.scrollTop = statusLog.scrollHeight;
            }

            // 更新小窗日志
            const miniStatusLog = document.getElementById('mini-status-log');
            if (miniStatusLog) {
                const miniLogItem = document.createElement('div');
                miniLogItem.className = `mini-log-item log-${type}`;
                miniLogItem.textContent = `[${timestamp}] ${message}`;
                miniStatusLog.appendChild(miniLogItem);
                miniStatusLog.scrollTop = miniStatusLog.scrollHeight;

                // 限制日志条数，避免内存占用过多
                const logItems = miniStatusLog.querySelectorAll('.mini-log-item');
                if (logItems.length > 100) {
                    logItems[0].remove();
                }
            }

            // 控制台也输出
            console.log(`[Scheduler] ${message}`);
        }

        function clearLog() {
            const statusLog = document.getElementById('status-log');
            if (statusLog) statusLog.innerHTML = '';

            const miniStatusLog = document.getElementById('mini-status-log');
            if (miniStatusLog) miniStatusLog.innerHTML = '';
        }

        // 原版核心逻辑函数（保持不变）
        function getNextSaturday() {
            const now = new Date();
            const userOffset = -now.getTimezoneOffset();
            const targetOffset = 8 * 60;
            const diffMinutes = targetOffset - userOffset;
            const daysToSaturday = (6 - now.getDay() + 7) % 7;
            const nextSaturday = new Date(now.getTime() + daysToSaturday * 24 * 60 * 60 * 1000);
            nextSaturday.setHours(18, 0, 0, 0);
            nextSaturday.setMinutes(nextSaturday.getMinutes() - diffMinutes);
            return nextSaturday;
        }

        async function waitForElement(selector, timeout = 15000) {
            const startTime = Date.now();

            while (Date.now() - startTime < timeout) {
                const element = document.querySelector(selector);
                if (element) {
                    return element;
                }
                await sleep(100);
            }
            throw new Error(`等待元素 ${selector} 超时`);
        }

        async function waitForElementToDisappear(selector, timeout = 60000) {
            if (shouldStop) throw new Error('用户手动停止了操作');
            const startTime = Date.now();

            while (Date.now() - startTime < timeout) {
                const element = document.querySelector(selector);
                if (!element) {
                    return true;
                }
                await sleep(300);
            }
            throw new Error(`等待元素 ${selector} 消失超时`);
        }

        async function simulateScheduleTweet(content, time, tweetIndex) {
            let editorDiv = null;
            let hasStartedInput = false;

            try {
                if (shouldStop) throw new Error('用户手动停止了操作');

                addLog(`开始处理推文 ${tweetIndex + 1}`, 'info');

                if (selectedImages.length > 0) {
                    addLog('上传图片中...', 'info');
                    const imageInput = await waitForElement('input[type="file"][accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime"]', 60000);
                    const imageIndex = tweetIndex % selectedImages.length;

                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(selectedImages[imageIndex]);
                    imageInput.files = dataTransfer.files;
                    await imageInput.dispatchEvent(new Event('change', { bubbles: true }));
                    await waitForElement('[data-testid="attachments"]');
                    addLog('图片上传成功', 'success');
                }

                if (shouldStop) throw new Error('用户手动停止了操作');

                // 使用enhanced版本的简单直接输入方法
                addLog('输入推文内容中...', 'info');
                editorDiv = await waitForElement('[data-testid="tweetTextarea_0"]');
                editorDiv.focus();
                hasStartedInput = true;

                await inputTextSafely(editorDiv, content);

                addLog('内容输入完成', 'success');

                if (shouldStop) throw new Error('用户手动停止了操作');

                addLog('设置定时发布...', 'info');
                const scheduleIcon = await waitForElement('[data-testid="scheduleOption"]');
                scheduleIcon.click();

                await waitForElement('select[id^="SELECTOR_"]');

                const selectors = Array.from(document.querySelectorAll('select[id^="SELECTOR_"]'))
                    .sort((a, b) => parseInt(a.id.split('_')[1]) - parseInt(b.id.split('_')[1]));

                if (selectors.length < 5) {
                    throw new Error('未找到完整的时间选择器');
                }

                const [monthSelect, daySelect, yearSelect, hourSelect, minuteSelect] = selectors;

                const month = (time.getMonth() + 1).toString();
                const day = time.getDate().toString();
                const year = time.getFullYear().toString();
                const hour = time.getHours();
                const minute = time.getMinutes();

                const setSelectValue = async (select, value) => {
                    if (select === minuteSelect) {
                        select.value = value;
                    } else {
                        select.value = value.toString();
                    }
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    await sleep(Math.floor(Math.random() * 50) + 10);
                };

                await setSelectValue(monthSelect, month);
                await setSelectValue(daySelect, day);
                await setSelectValue(yearSelect, year);
                await setSelectValue(hourSelect, hour);
                await setSelectValue(minuteSelect, minute);

                addLog(`时间设置: ${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, 'info');

                const confirmButton = await waitForElement('[data-testid="scheduledConfirmationPrimaryAction"]');
                confirmButton.click();

                if (shouldStop) throw new Error('用户手动停止了操作');

                const sendTweetButton = await waitForElement('[data-testid="tweetButtonInline"]');
                sendTweetButton.click();

                await waitForElementToDisappear('[data-testid="toolBar"] [role="progressbar"]');

                const options = {
                    timeZone: 'Asia/Shanghai',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                };
                const chinaTimeString = time.toLocaleString('zh-CN', options);
                addLog(`✅ 定时推文设置成功: ${chinaTimeString}`, 'success');
                console.log(`成功设置定时推文：${chinaTimeString}`);

            } catch (error) {
                if (error.message === '用户手动停止了操作') {
                    addLog('操作被用户终止', 'info');
                    console.log('操作被用户终止');
                } else {
                    addLog(`❌ 设置失败: ${error.message}`, 'error');
                    console.error('设置定时推文失败:', error.message);
                    alert(`设置定时推文失败: ${error.message}`);
                }
                throw error;
            }
        }

        // 安全的文本输入方法 - 支持失焦状态
        async function inputTextSafely(editorDiv, content) {
            // 确保编辑器获得焦点
            editorDiv.focus();
            editorDiv.click();

            // 清空现有内容
            editorDiv.textContent = '';
            editorDiv.innerHTML = '';

            // 强制触发清空事件
            editorDiv.dispatchEvent(new Event('input', { bubbles: true }));
            await sleep(200);

            try {
                // 方法1: 模拟粘贴操作（最可靠的方法）
                const success = await simulatePasteOperation(editorDiv, content);
                if (success) {
                    addLog(`✓ 粘贴方法成功 (${content.length}字符)`, 'success');
                    return;
                }

                // 方法2: 如果粘贴失败，使用选择和替换
                await inputBySelectionReplace(editorDiv, content);

            } catch (error) {
                addLog(`主要输入方法失败: ${error.message}，尝试兜底方法`, 'error');
                await inputTextByForceMethod(editorDiv, content);
            }
        }

        // 模拟粘贴操作
        async function simulatePasteOperation(editorDiv, content) {
            try {
                // 确保焦点
                editorDiv.focus();

                // 创建粘贴事件
                const clipboardData = new DataTransfer();
                clipboardData.setData('text/plain', content);

                const pasteEvent = new ClipboardEvent('paste', {
                    bubbles: true,
                    cancelable: true,
                    clipboardData: clipboardData
                });

                // 触发粘贴事件
                editorDiv.dispatchEvent(pasteEvent);

                // 如果浏览器不支持ClipboardEvent，使用备用方法
                if (!pasteEvent.defaultPrevented) {
                    // 手动处理粘贴
                    editorDiv.textContent = content;

                    // 触发必要的事件
                    editorDiv.dispatchEvent(new Event('input', { bubbles: true }));
                    editorDiv.dispatchEvent(new Event('change', { bubbles: true }));
                }

                await sleep(300);

                // 验证内容
                const actualContent = editorDiv.textContent || editorDiv.innerText || '';
                const success = actualContent.trim().length >= content.trim().length * 0.9;

                return success;

            } catch (error) {
                console.log('模拟粘贴失败:', error);
                return false;
            }
        }

        // 使用选择和替换方法
        async function inputBySelectionReplace(editorDiv, content) {
            try {
                // 确保焦点
                editorDiv.focus();

                // 选择所有内容
                if (window.getSelection && document.createRange) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(editorDiv);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    await sleep(100);

                    // 尝试使用 document.execCommand 替换选中内容
                    if (document.execCommand && document.execCommand('insertText', false, content)) {
                        await sleep(200);
                        const actualContent = editorDiv.textContent || editorDiv.innerText || '';
                        if (actualContent.trim().length >= content.trim().length * 0.8) {
                            addLog(`✓ 选择替换成功 (${actualContent.length}字符)`, 'success');
                            return;
                        }
                    }
                }

                // 如果选择替换失败，直接设置内容
                editorDiv.innerHTML = '';
                const lines = content.split('\n');

                for (let i = 0; i < lines.length; i++) {
                    if (i > 0) {
                        editorDiv.appendChild(document.createElement('br'));
                    }
                    if (lines[i]) {
                        editorDiv.appendChild(document.createTextNode(lines[i]));
                    }
                }

                // 触发事件
                editorDiv.dispatchEvent(new Event('input', { bubbles: true }));
                editorDiv.dispatchEvent(new Event('change', { bubbles: true }));

                await sleep(200);
                const actualContent = editorDiv.textContent || editorDiv.innerText || '';
                addLog(`✓ DOM操作成功 (${actualContent.length}字符)`, 'success');

            } catch (error) {
                throw new Error(`选择替换方法失败: ${error.message}`);
            }
        }

        // 强制输入方法（最后兜底）
        async function inputTextByForceMethod(editorDiv, content) {
            try {
                // 强制获取焦点
                window.focus();
                document.body.focus();
                editorDiv.focus();
                editorDiv.click();

                // 清空
                editorDiv.innerHTML = '';

                // 分小段处理，每段不超过50个字符
                const chunks = [];
                for (let i = 0; i < content.length; i += 50) {
                    chunks.push(content.slice(i, i + 50));
                }

                for (let i = 0; i < chunks.length; i++) {
                    if (shouldStop) throw new Error('用户手动停止了操作');

                    const chunk = chunks[i];

                    // 尝试多种方法设置这一段
                    try {
                        // 方法A: 直接append
                        const textNode = document.createTextNode(chunk);
                        editorDiv.appendChild(textNode);

                    } catch (err) {
                        // 方法B: 使用innerHTML追加
                        const escapedChunk = chunk.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
                        editorDiv.innerHTML += escapedChunk;
                    }

                    // 触发事件
                    editorDiv.dispatchEvent(new Event('input', { bubbles: true }));

                    await sleep(50);

                    // 定期检查焦点
                    if (i % 5 === 0) {
                        ensurePageFocused();
                    }
                }

                // 最终检验和事件触发
                await sleep(200);
                editorDiv.dispatchEvent(new Event('change', { bubbles: true }));

                const finalContent = editorDiv.textContent || editorDiv.innerText || '';
                if (finalContent.trim().length === 0) {
                    throw new Error('所有输入方法都失败了');
                }

                addLog(`✓ 强制输入完成 (${finalContent.length}字符)`, 'success');

            } catch (error) {
                addLog(`❌ 所有输入方法失败: ${error.message}`, 'error');
                throw error;
            }
        }



        // 确保页面焦点的辅助函数
        function ensurePageFocused() {
            try {
                if (document.hidden || !document.hasFocus()) {
                    window.focus();
                    document.body.focus();

                    // 找到编辑器并重新聚焦
                    const editorDiv = document.querySelector('[data-testid="tweetTextarea_0"]');
                    if (editorDiv) {
                        editorDiv.focus();
                        editorDiv.click();
                    }
                }
            } catch (error) {
                console.log('Focus restore error:', error);
            }
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // 按钮事件
        btn.addEventListener('click', () => {
            const isVisible = form.style.display === 'block';
            form.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) {
                const defaultTime = getNextSaturday().toLocaleString('sv').replace(' ', 'T').slice(0, 16);
                document.getElementById('scheduler-startTime').value = defaultTime;

                const chinaTime = new Date(getNextSaturday().getTime());
                const chinaTimeString = chinaTime.toLocaleString('zh-CN', {
                    timeZone: 'Asia/Shanghai',
                    hour12: false
                });
                console.log('对应的北京时间：', chinaTimeString);
            }
        });

        // 图片选择事件
        const imageInput = document.getElementById('scheduler-images');
        const imageCount = document.getElementById('image-count');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                selectedImages = Array.from(e.target.files);
                imageCount.textContent = `已选择 ${selectedImages.length} 张图片`;
            });
        }

        // 主要生成按钮事件（保持原版逻辑，添加进度显示）
        const generateBtn = form.querySelector('#scheduler-generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', async () => {
                if (isGenerating) {
                    shouldStop = true;
                    generateBtn.disabled = true;
                    generateBtn.textContent = '正在停止...';
                    addLog('用户请求停止操作', 'info');
                    return;
                }

                try {
                    isGenerating = true;
                    shouldStop = false;
                    generateBtn.classList.add('stop-btn');
                    generateBtn.textContent = '点击停止';
                    clearLog();

                    // 显示小窗停止按钮
                    if (miniWindowMode && miniStopBtn) {
                        miniStopBtn.style.display = 'block';
                        miniStopBtn.disabled = false;
                        miniStopBtn.textContent = '停止';
                    }

                    // 启动焦点保持机制（不论是否小窗模式）
                    startFocusKeeping();
                    addLog('🎯 已启动焦点保持机制', 'info');

                    addLog('🚀 开始生成定时推文', 'info');

                    const startTimeInput = document.getElementById('scheduler-startTime').value;
                    const startTime = new Date(startTimeInput);
                    const interval = parseInt(document.getElementById('scheduler-interval').value);

                    const suffix = document.getElementById('scheduler-suffix').value;
                    const suffixLines = suffix.split('\n')
                        .map(line => line.trim())
                        .filter(line => line)
                        .map(line => line + ' ')
                        .join('\n');

                    let content = document.getElementById('scheduler-content').value;
                    console.log('原始内容:', content);

                    if (!content || content.trim() === '') {
                        alert('请输入推文内容');
                        return;
                    }

                    content = content.replace(/\r\n/g, '\n');

                    const tweets = content.split(/\n\s*\n+/)
                        .map(tweet => tweet.trim())
                        .filter(tweet => tweet.length > 0);

                    console.log('处理后的推文数组:', tweets);
                    addLog(`准备发布 ${tweets.length} 条推文`, 'info');

                    if (tweets.length === 0) {
                        alert('未能正确分割推文内容');
                        return;
                    }

                    const initialTweetButton = document.querySelector('[data-testid="tweetButtonInline"]');
                    if (initialTweetButton && !initialTweetButton.disabled) {
                        throw new Error('请先清空编辑框内的内容再继续操作');
                    }

                    // 开始发布流程
                    for (let i = 0; i < tweets.length; i++) {
                        if (shouldStop) {
                            addLog('🛑 操作被用户停止', 'info');
                            break;
                        }

                        const tweetTime = new Date(startTime.getTime() + i * interval * 60000);
                        const tweetContent = tweets[i] + '\n\n' + suffixLines;

                        updateProgress(i, tweets.length, `正在处理第 ${i + 1}/${tweets.length} 条推文`);

                        try {
                            await simulateScheduleTweet(tweetContent, tweetTime, i);
                            updateProgress(i + 1, tweets.length, `已完成 ${i + 1}/${tweets.length} 条推文`);

                            if (i < tweets.length - 1) {
                                const delay = Math.floor(Math.random() * 301) + 1800;
                                addLog(`⏳ 等待 ${Math.round(delay / 1000)} 秒后处理下一条`, 'info');
                                await sleep(delay);
                            }
                        } catch (error) {
                            if (error.message === '用户手动停止了操作') {
                                break;
                            }
                            console.error(`第 ${i + 1} 条推文发送失败:`, error);
                            addLog(`❌ 第 ${i + 1} 条推文失败: ${error.message}`, 'error');
                            const continuePosting = confirm(`第 ${i + 1} 条推文发送失败。是否继续发送剩余推文？`);
                            if (!continuePosting) {
                                addLog('用户选择停止发布', 'info');
                                break;
                            }
                        }
                    }

                    if (!shouldStop) {
                        addLog('🎉 所有推文处理完成！', 'success');
                        setTimeout(() => {
                            form.style.display = 'none';
                            hideProgress();
                        }, 3000);
                    }

                } catch (error) {
                    console.error('处理推文时出错:', error);
                    addLog(`💥 处理出错: ${error.message}`, 'error');
                    alert('处理推文时出错: ' + error.message);
                } finally {
                    isGenerating = false;
                    shouldStop = false;
                    generateBtn.classList.remove('stop-btn');
                    generateBtn.textContent = '生成定时推文';
                    generateBtn.disabled = false;

                    // 更新小窗按钮状态
                    const miniStopBtn = document.getElementById('mini-stop-btn');
                    if (miniStopBtn) miniStopBtn.style.display = 'none';

                    stopKeepAlive();
                    stopFocusKeeping();
                    hideBackgroundNotice();
                    backgroundMode = false;
                }
            });
        }

        // 小窗模式切换
        const miniToggleBtn = document.getElementById('mini-toggle-btn');
        if (miniToggleBtn) {
            miniToggleBtn.addEventListener('click', () => {
                miniWindowMode = !miniWindowMode;

                if (miniWindowMode) {
                    miniWindow.style.display = 'block';
                    miniToggleBtn.textContent = '关闭小窗';
                    form.classList.add('mini-mode');
                    addLog('📱 小窗模式已开启', 'info');

                    // 如果正在运行，启动焦点保持
                    if (isGenerating) {
                        startFocusKeeping();
                    }
                } else {
                    miniWindow.style.display = 'none';
                    miniToggleBtn.textContent = '小窗模式';
                    form.classList.remove('mini-mode');
                    stopFocusKeeping();
                    addLog('📱 小窗模式已关闭', 'info');
                }
            });
        }

        // 小窗拖拽功能
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        const miniHeader = document.getElementById('mini-header');
        if (miniHeader) {
            miniHeader.addEventListener('mousedown', (e) => {
                isDragging = true;
                dragOffsetX = e.clientX - miniWindow.offsetLeft;
                dragOffsetY = e.clientY - miniWindow.offsetTop;
                document.addEventListener('mousemove', handleDrag);
                document.addEventListener('mouseup', stopDrag);
            });
        }

        function handleDrag(e) {
            if (!isDragging) return;

            const x = e.clientX - dragOffsetX;
            const y = e.clientY - dragOffsetY;

            // 限制拖拽范围
            const maxX = window.innerWidth - miniWindow.offsetWidth;
            const maxY = window.innerHeight - miniWindow.offsetHeight;

            miniWindow.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
            miniWindow.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
            miniWindow.style.right = 'auto'; // 清除right定位
        }

        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        }

        // 小窗控制按钮
        const miniCloseBtn = document.getElementById('mini-close');
        if (miniCloseBtn) {
            miniCloseBtn.addEventListener('click', () => {
                miniWindowMode = false;
                miniWindow.style.display = 'none';
                miniToggleBtn.textContent = '小窗模式';
                form.classList.remove('mini-mode');
                stopFocusKeeping();
            });
        }

        const miniMinimizeBtn = document.getElementById('mini-minimize');
        if (miniMinimizeBtn) {
            miniMinimizeBtn.addEventListener('click', () => {
                const content = miniWindow.querySelector('.mini-window-content');
                const isMinimized = content.style.display === 'none';

                if (isMinimized) {
                    content.style.display = 'block';
                    miniWindow.style.height = '400px';
                    miniMinimizeBtn.textContent = '−';
                } else {
                    content.style.display = 'none';
                    miniWindow.style.height = '40px';
                    miniMinimizeBtn.textContent = '□';
                }
            });
        }

        // 小窗停止按钮
        const miniStopBtn = document.getElementById('mini-stop-btn');
        if (miniStopBtn) {
            miniStopBtn.addEventListener('click', () => {
                shouldStop = true;
                miniStopBtn.disabled = true;
                miniStopBtn.textContent = '正在停止...';
                addLog('用户从小窗请求停止操作', 'info');
            });
        }

        // 小窗清空日志按钮
        const miniClearLogBtn = document.getElementById('mini-clear-log');
        if (miniClearLogBtn) {
            miniClearLogBtn.addEventListener('click', () => {
                clearLog();
            });
        }

    } // 结束 setupScheduler 函数

    // 启动脚本
    initializeScript().catch(console.error);

})();