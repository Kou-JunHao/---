async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
  // ���ع���
  await loadTool('AIScheduleTools');
  
  try {
    // ʹ��Fetch API
    const response = await fetch('/jsxsd/xskb/xskb_list.do?Ves632DSdyV=NEW_XSD_PYGL');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    // ��ʾ������ʾ
    await AIScheduleAlert(`����ʧ��: ${error.message}`);
    // ֹͣ��������
    return 'do not continue';
  }
}