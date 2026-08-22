# تحقق مشغّل V12 على النطاق العام

| المحاولة | النتيجة |
|---|---|
| `?release=12a8cc4b-v12` | حمّل الدرس الأصل السابق `/manus-storage/V12-graph-traversal-ar_1001cd68.mp4` بمدة 92 ثانية، مع `readyState=4` و`video.error=null`. |
| `?release=12a8cc4b-v12-r2` | بقي المصدر السابق نفسه ومدته 92 ثانية رغم معامل إصدار جديد؛ لا يعتمد ذلك نشر البديل. |

لا يثبت هذا الفحص انتشار ربط البديل الجديد `/manus-storage/V12-graph-traversal-ar-animated_1155efb3.mp4`؛ لذلك تبقى V12 `VERIFIED` إلى أن يظهر المصدر الجديد وتكتمل اختبارات النطاق والمشغّل والتقدم وحدث النهاية على النطاق العام.

## الاعتماد اللاحق

ظهر المصدر الجديد `/manus-storage/V12-graph-traversal-ar-animated_1155efb3.mp4` بمدة `109.316667` ثانية و`readyState=4` و`video.error=null`. أعاد Range داخل الأصل `206` و`video/mp4` و1024 بايت. نجحت Play بإيماءة ثم Pause وSeek إلى 12 ثانية، وحفظ `watched.graphs` عند 82% ثم 100% بعد `ended`، وبقي زر الشهادة معطلًا. أصبحت V12 `PUBLISHED`.
