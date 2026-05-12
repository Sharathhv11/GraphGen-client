export async function copyToClipboard(text) {
  if (text === undefined || text === null || String(text).trim() === '') {
    return { success: false, error: 'Nothing to copy.' };
  }

  const value = String(text);

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return { success: true };
    }

    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (!copied) {
      return { success: false, error: 'Copy failed. Please copy manually.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return { success: false, error: 'Copy failed. Please copy manually.' };
  }
}
