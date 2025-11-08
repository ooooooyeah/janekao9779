# JaneKao小铺

## 简介

这是一个用于批量创建 X 定时推文功能的脚本，模拟输入推文内容和时间。

希望可以给椰糕带来更多可能性，走向更好的未来，还有我们的二搭。

## 使用方法

1. 安装 Tampermonkey 或类似的浏览器扩展。
2. 将 `Planned.js` 和 `auto-interaction.js` 文件的内容复制到 Tampermonkey 中。
3. 打开 X 网站，点击 Tampermonkey 扩展中  **椰糕小铺之定时推文**  和 **椰糕小铺之互动助手** 的脚本。
4. 按照提示输入推文内容和时间，点击确认按钮即可。
5. 不用的时候可以在 Tampermonkey 中关掉脚本，或者关掉 Tampermonkey 扩展。

## 使用说明

<img src="https://github.com/ooooooyeah/janekao9779/blob/main/form_description.png" alt="定时发布表单填写说明" style="width: 210px;">

- 定时发布：
  - 文本内容会按照顺序依次发送
  - 先填写定时文本的表单，点击生成后让脚本自己跑
  - 图片是可选的，可以多选，一帖至多一张
  - 当文本数量大于图片，图片再次循环被使用
  - 当图片数量大于文本，靠后的图片不会被使用

- 推文互动：
  - 评论模式（💬）：会按照顺序依次点赞、转发、评论
  - 引用模式（✍️）：会按照顺序依次点赞、转发、引用
  - 转发模式（🔄）：会按照顺序依次点赞、转发
  - 先填写一键互动的表单
  - 然后鼠标hover到需要互动的帖子，点击出现 **小猫** 按钮即可
  - 需要切换模式点击 **浅黄色** 的模式按钮，点击时会变成 **橘色** 
  - `auto-interaction.js` 是顺序互动，保存的评论文本按顺序执行，并且仅使用一次

## Tampermonkey 的安装与使用

- [安装和使用的教程](https://www.bilibili.com/video/BV1ok4y1x7QH)
- [Tampermonkey 官网](https://www.tampermonkey.net/?locale=zh)
