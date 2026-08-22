# تحقق مشغّل V07 على النطاق المنشور

| جولة التحقق | النتيجة |
|---|---|
| بعد نقطة الإصدار `828ed4c0` مباشرة | لم يكتمل الانتشار: قدم المشغّل الأصل السابق `V07-linked-stack-ar_97eac035.mp4` بمدة 92 ثانية و`readyState=4` و`video.error=null`. لا يعتمد ذلك نجاحًا للبديل المتحرك الجديد. |
| بعد اكتمال الانتشار | حمّل النطاق العام المصدر الجديد `V07-stack-linked-ar-animated_08380b83.mp4` بمدة `141.166667` ثانية و`readyState=4` و`video.error=null`. ستستكمل دورة Play/Pause وSeek والتقدم والنهاية قبل اعتماد النشر. |

تحقق طلب النطاق العام للأصل الجديد من `307` ثم `206 Partial Content` و`Content-Type: video/mp4` و1024 بايت و`Content-Range: bytes 0-1023/5608304`. أكد `ffprobe` H.264/AAC و1920×1080/60fps ومدة 141.166667 ثانية. في اختبار إيماءة مستخدم موثوقة، نجح Play عند `currentTime=0.320349` و`paused=false` بلا خطأ، ثم نجح Pause عند `0.384` ثانية.

نجح Seek إلى 12 ثانية بلا خطأ. سجل المشغّل العام `watched.stack-linked={percent:82, completed:true}` عند 82%، ثم `{percent:100, completed:true}` بعد حدث `ended`. بقي `certificate-trigger.disabled=true`، لذلك لا يمنح إكمال الفيديو وحده شهادة.

> لا تتحول V07 إلى `PUBLISHED` إلا بعد ظهور `/manus-storage/V07-stack-linked-ar-animated_08380b83.mp4` بمدة 141.166667 ثانية، ثم اجتياز طلب النطاق والمشغّل والتقدم والنهاية والشهادة على النطاق العام.
