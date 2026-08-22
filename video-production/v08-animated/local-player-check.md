# تحقق مشغّل V08 المحلي

| الفحص | النتيجة |
|---|---|
| المصدر والجاهزية | حمّل درس `queue-array` المصدر `/manus-storage/V08-queue-array-ar-animated_17686618.mp4` بمدة `121.716667` ثانية و`readyState=4` و`video.error=null`. |
| Play وPause بإيماءة موثوقة | نجح Play داخل سياق نقرة متصفح فعلية؛ بلغ `currentTime=0.608486` ثانية و`paused=false` بلا خطأ، ثم نجح Pause عند `0.608530` ثانية. |
| Seek | نجح الانتقال إلى 12 ثانية بلا خطأ. |
| التقدم والإكمال | حفظ `watched.queue-array={percent:82, completed:true}` عند 82%، ثم `{percent:100, completed:true}` بعد `ended`. |
| شرط الشهادة | بقي `certificate-trigger.disabled=true`؛ لا يمنح إكمال V08 وحده شهادة. |

سيستكمل السجل باختبار Play بإيماءة موثوقة وPause وSeek ثم تقدم 82% وحدث `ended` وبقاء الشهادة معطلة.
