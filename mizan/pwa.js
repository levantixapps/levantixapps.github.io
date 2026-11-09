(() => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (installed) return;

  const bar = document.querySelector('.bar');
  const header = document.querySelector('.top');
  if (!bar || !header) return;

  let promptEvent = null;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn';
  button.id = 'install';
  button.textContent = 'تثبيت التطبيق';
  bar.insertBefore(button, document.getElementById('status'));

  const note = document.createElement('p');
  note.className = 'sub';
  note.id = 'installNote';
  note.hidden = true;
  note.setAttribute('role', 'status');
  header.after(note);

  addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptEvent = e; });
  addEventListener('appinstalled', () => { button.remove(); note.hidden = true; });

  const ua = navigator.userAgent;
  const help = () => {
    if (/iPhone|iPad|iPod/.test(ua)) return 'على الآيفون: افتح الرابط في Safari، ثم اضغط زر المشاركة، واختر «إضافة إلى الشاشة الرئيسية».';
    if (/Android/.test(ua)) return 'على أندرويد: افتح الرابط في Chrome، ثم اضغط ⋮ أعلى الشاشة، واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».';
    return 'على الحاسوب: افتح الرابط في Chrome أو Edge، ثم اضغط أيقونة التثبيت في شريط العنوان.';
  };

  button.addEventListener('click', async () => {
    if (promptEvent) {
      const e = promptEvent;
      promptEvent = null;
      e.prompt();
      await e.userChoice.catch(() => {});
      return;
    }
    note.textContent = help();
    if (/Android/.test(ua)) {
      const apk = document.createElement('a');
      apk.href = 'mizan.apk';
      apk.download = 'mizan.apk';
      apk.textContent = 'أو حمّل ملف APK';
      note.append(' ', apk);
    }
    note.hidden = false;
  });
})();
