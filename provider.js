async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
  // 加载工具
  await loadTool('AIScheduleTools');
  
  try {
    // 使用Fetch API
    const response = await fetch('/jsxsd/xskb/xskb_list.do?Ves632DSdyV=NEW_XSD_PYGL');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    // 显示错误提示
    await AIScheduleAlert(`请求失败: ${error.message}`);
    // 停止后续操作
    return 'do not continue';
  }
}