# تحقق مشغّل V07 المحلي

| الفحص | النتيجة |
|---|---|
| المصدر والجاهزية | حمّل درس `stack-linked` المصدر `/manus-storage/V07-stack-linked-ar-animated_08380b83.mp4` بمدة `141.166667` ثانية و`readyState=4` و`video.error=null`. |
| Play وPause بإيماءة موثوقة | نجح Play داخل سياق نقرة متصفح فعلية؛ بلغ `currentTime=0.621136` ثانية و`paused=false` بلا خطأ، ثم نجح Pause عند `0.621196` ثانية. |
| Seek | نجح الانتقال إلى 12 ثانية بلا خطأ. |
| التقدم والإكمال | حفظ `watched.stack-linked={percent:82, completed:true}` عند 82%، ثم `{percent:100, completed:true}` بعد `ended`. |
| شرط الشهادة | بقي `certificate-trigger.disabled=true`؛ لا يمنح إكمال V07 وحده شهادة. |

سيستكمل السجل باختبار Play بإيماءة موثوقة وPause وSeek ثم تقدم 82% وحدث `ended` وبقاء الشهادة معطلة.
