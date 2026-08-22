# تحقق مشغّل V10 المحلي

| الفحص | النتيجة |
|---|---|
| نطاق المصدر | `307 → 206`، و`Content-Type: video/mp4`، و`Content-Range: bytes 0-1023/5666817`، و1024 بايت |
| `currentSrc` | `/manus-storage/V10-recursion-ar-animated_1bdb3849.mp4` |
| الجاهزية | `duration=131.133333`، `readyState=4`، `video.error=null` |
| Play / Pause | تشغيل داخل إيماءة مستخدم موثوقة: `paused=false` عند `0.633084` ثانية؛ ثم إيقاف ناجح `paused=true` |
| Seek | نجح الانتقال إلى `12` ثانية |
| التقدم | بعد `timeupdate` عند 82%: `watched.recursion.percent=82`؛ وبعد `ended`: `percent=100` و`completed=true` |
| الشهادة | زر `#certificate-trigger` بقي `disabled=true`؛ لا يمنح الفيديو شهادة منفردة |

> هذا دليل محلي فقط. لا يُسجل V10 كـ`PUBLISHED` قبل تحقق النطاق العام من المصدر الجديد والمشغّل والتقدم.
