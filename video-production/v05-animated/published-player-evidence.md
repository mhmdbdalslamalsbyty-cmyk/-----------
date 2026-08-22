# دليل مشغّل V05 المتحرك

## تحقق محلي قبل النشر

على معاينة `?lesson=doubly-linked` حمّل المشغّل الأصل `/manus-storage/V05-linked-list-doubly-ar-animated_601c351c.mp4`. أعاد العنصر `duration=135.35` و`readyState=4` و`controls=true` و`video.error=null`. بعد إيماءة فعلية نجح التشغيل، وتقدم الزمن إلى 1.12 ثانية، ثم نجح الإيقاف وSeek إلى 90 ثانية بلا خطأ.

عند 82% حُفظت `watched.doubly-linked={percent:82, completed:true}`؛ وبعد حدث `ended` أصبحت `{percent:100, completed:true}`. بقي زر إصدار الشهادة معطّلًا قبل وبعد الإنهاء. ينتظر هذا الدليل تحقق النطاق المنشور قبل اعتماد الحالة `PUBLISHED`.

## تحقق الوصول الخارجي

بعد انتشار الإصدار `c6bbce51` صار النطاق العام في `?lesson=doubly-linked&release_check=c6bbce51` يحمل المصدر `/manus-storage/V05-linked-list-doubly-ar-animated_601c351c.mp4` بمدة `135.35` ثانية و`readyState=4` و`controls=true` و`video.error=null`. يتبع ذلك اختبار Play وPause وSeek والتقدم وحدث النهاية من المشغّل المنشور.

## اختبار التفاعل والتقدم على النطاق العام

بعد إيماءة تشغيل فعلية نجح `play()` بلا خطأ وتقدم الزمن إلى 1.11 ثانية، ثم نجح `pause()` وSeek إلى 90 ثانية. عند 82% حُفظت `watched.doubly-linked={percent:82, completed:true}`، وبعد حدث `ended` أصبحت `{percent:100, completed:true}`. بقي `#certificate-trigger.disabled=true` قبل وبعد الإنهاء، وظل `video.error=null`. لذلك اجتاز V05 بوابة المشغّل والتقدم والإكمال على النطاق العام.
