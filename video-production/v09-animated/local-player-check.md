# تحقق مشغّل V09 المحلي

| الفحص | النتيجة |
|---|---|
| المصدر والجاهزية | حمّل درس `queue-linked` المصدر `/manus-storage/V09-queue-linked-ar-animated_9dd0454f.mp4` بمدة `142.083333` ثانية و`readyState=4` و`video.error=null`. |
| Play وPause بإيماءة موثوقة | نجح Play داخل سياق نقرة متصفح فعلية؛ بلغ `currentTime=0.614042` ثانية و`paused=false` بلا خطأ، ثم نجح Pause عند `0.614091` ثانية. |
| Seek | نجح الانتقال إلى 12 ثانية بلا خطأ. |
| التقدم والإكمال | حفظ `watched.queue-linked={percent:82, completed:true}` عند 82%، ثم `{percent:100, completed:true}` بعد `ended`. |
| شرط الشهادة | بقي `certificate-trigger.disabled=true`؛ لا يمنح إكمال V09 وحده شهادة. |

سيستكمل السجل باختبار Play بإيماءة موثوقة وPause وSeek ثم تقدم 82% وحدث `ended` وبقاء الشهادة معطلة.
