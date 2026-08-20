# دليل تنفيذ تدقيق الفيديو النهائي

## فحص HTTP Range على النطاق العام

نفذ التدقيق على `https://dataacad-djtmwrgg.manus.space/` بطلب `Range: bytes=0-1023`، متبعًا إعادة التوجيه الموقعة لتخزين الأصول. نجح كل أصل منشور بالنتيجة نفسها: `206 Partial Content`، و`Content-Type: video/mp4`، و1024 بايتًا مقروءة.

| Video | HTTP | Content-Type | Range bytes | Result |
|---|---:|---|---:|---|
| V01 | 206 | video/mp4 | 1024 | PASS |
| V03 | 206 | video/mp4 | 1024 | PASS |
| V04 | 206 | video/mp4 | 1024 | PASS |
| V05 | 206 | video/mp4 | 1024 | PASS |
| V06 | 206 | video/mp4 | 1024 | PASS |
| V07 | 206 | video/mp4 | 1024 | PASS |
| V08 | 206 | video/mp4 | 1024 | PASS |
| V09 | 206 | video/mp4 | 1024 | PASS |
| V10 | 206 | video/mp4 | 1024 | PASS |
| V11 | 206 | video/mp4 | 1024 | PASS |
| V12 | 206 | video/mp4 | 1024 | PASS |

## تصحيح منهجية اجتياز المشغلات

لا تستعمل أزرار فهرس الدروس السمة `data-id`؛ تستعمل `button.lesson-link[data-lesson]`. نتجت القراءة الخاطئة السابقة لمصدر V05 المتبقي من عدم العثور على الزر، لا من خطأ في تبديل الدرس أو ربط المصدر. يعتمد الاجتياز النهائي على `data-lesson` وينتظر إطارين للرسم قبل قراءة وسم `<source>` في مشغّل الدرس.

## اجتياز المشغلات النهائي

مرّ الاجتياز النهائي على كل زر `button.lesson-link[data-lesson]`، وتحقق في كل انتقال من الدرس النشط، ووجود `#lesson-video`، واسم ملف `<source>`، وخلو عنصر الفيديو من خطأ. كانت النتيجة `allSourceMatches: true` ولم تسجل آلية الالتقاط أي `videoErrors`.

| Video ID | Lesson ID | Source filename | Player | Source match | Video error |
|---|---|---|---|---|---|
| V01 | why-data-structures | V01-why-data-structures-ar-final_e5ade353.mp4 | نعم | نعم | لا |
| V03 | singly-linked-basics | V03-linked-list-ar_2b7e6177.mp4 | نعم | نعم | لا |
| V04 | singly-linked-operations | V04-linked-list-operations-ar_6b5a6dfa.mp4 | نعم | نعم | لا |
| V05 | doubly-linked | V05-doubly-linked-list-ar_35dfc86b.mp4 | نعم | نعم | لا |
| V06 | stack-array | V06-stack-ar_6d70b820.mp4 | نعم | نعم | لا |
| V07 | stack-linked | V07-linked-stack-ar_97eac035.mp4 | نعم | نعم | لا |
| V08 | queue-array | V08-queue-ar_d9b39b98.mp4 | نعم | نعم | لا |
| V09 | queue-linked | V09-linked-queue-ar_f39f789e.mp4 | نعم | نعم | لا |
| V10 | recursion | V10-recursion-ar_dca1ba2d.mp4 | نعم | نعم | لا |
| V11 | trees | V11-bst-ar_c8ae9e81.mp4 | نعم | نعم | لا |
| V12 | graphs | V12-graph-traversal-ar_1001cd68.mp4 | نعم | نعم | لا |

## حالة V02

عند فتح الدرس `array`، ظهر الدرس النشط نفسه بلا `#lesson-video`. وظهرت بطاقة حالة تقول: **«إنتاج خارجي مطلوب · 90.9 ثانية»** وتشرح أن الأصل التاريخي لم يعد قابلًا للتحقق (`403`) وأنه لا يظهر مشغّل قبل وجود MP4 صالح ومراجع. لا توجد وصلة بديلة أو placeholder.

## قيم المصدر الكاملة من اجتياز المتصفح

قرأ الاجتياز قيمة `<source src>` مباشرة بعد تحديث الدرس النشط، ووجد `playerFound: true` و`videoError: null` لكل صف و`videoErrors: []` للمجموعة كلها.

| Video ID | Lesson ID | source src الكامل | Player | video.error |
|---|---|---|---|---|
| V01 | why-data-structures | `/manus-storage/V01-why-data-structures-ar-final_e5ade353.mp4` | نعم | null |
| V03 | singly-linked-basics | `/manus-storage/V03-linked-list-ar_2b7e6177.mp4` | نعم | null |
| V04 | singly-linked-operations | `/manus-storage/V04-linked-list-operations-ar_6b5a6dfa.mp4` | نعم | null |
| V05 | doubly-linked | `/manus-storage/V05-doubly-linked-list-ar_35dfc86b.mp4` | نعم | null |
| V06 | stack-array | `/manus-storage/V06-stack-ar_6d70b820.mp4` | نعم | null |
| V07 | stack-linked | `/manus-storage/V07-linked-stack-ar_97eac035.mp4` | نعم | null |
| V08 | queue-array | `/manus-storage/V08-queue-ar_d9b39b98.mp4` | نعم | null |
| V09 | queue-linked | `/manus-storage/V09-linked-queue-ar_f39f789e.mp4` | نعم | null |
| V10 | recursion | `/manus-storage/V10-recursion-ar_dca1ba2d.mp4` | نعم | null |
| V11 | trees | `/manus-storage/V11-bst-ar_c8ae9e81.mp4` | نعم | null |
| V12 | graphs | `/manus-storage/V12-graph-traversal-ar_1001cd68.mp4` | نعم | null |
