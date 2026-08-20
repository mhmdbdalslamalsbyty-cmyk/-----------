# مصفوفة إنتاج الفيديو النهائية

**تاريخ التحديث:** 20 أغسطس 2026  
**قاعدة الربط:** يظهر المشغّل فقط عندما تكون الحالة `PUBLISHED` ويشير السجل إلى مسار MP4 حقيقي. مرجع معرّفات الدروس القانوني هو `client/lessons/data.js`، ويستعمل المشغّل `LESSON_VIDEO_CATALOG` في `client/script.js`.

المواصفات المعتمدة هي **16:9**، ورسوم تعليمية ثنائية الأبعاد بهوية داكنة متسقة مع الأكاديمية، وتعليق عربي فصيح محايد، ومدد فعلية من 92 ثانية للأصول الجديدة. جميع الأصول الجديدة H.264 بدقة 1920×1080 مع مسار AAC، وقد اجتازت فحوص تركيب المشاهد وخصائص الملف قبل الرفع.

| الفيديو | معرّف الدرس القانوني | الهدف | الحالة | أصل MP4 المنشور |
|---|---|---|---|---|
| V01 | `why-data-structures` | ربط اختيار البنية بسرعة الوصول والتنظيم. | `PUBLISHED` | `/manus-storage/V01-why-data-structures-ar-final_e5ade353.mp4` |
| V02 | `array` | الفهرسة والوصول المباشر وكلفة الإزاحة. | `EXTERNAL_PRODUCTION_REQUIRED` | — الأصل التاريخي يعيد 403، وحزمته محفوظة |
| V03 | `singly-linked-basics` | فهم الرأس والعقدة والرابط التالي. | `PUBLISHED` | `/manus-storage/V03-linked-list-ar_2b7e6177.mp4` |
| V04 | `singly-linked-operations` | ترتيب تحديث المؤشرات عند الإدراج عند الرأس. | `PUBLISHED` | `/manus-storage/V04-linked-list-operations-ar_6b5a6dfa.mp4` |
| V05 | `doubly-linked` | فهم `prev` و`next` ومقايضة الذاكرة بالمرونة. | `PUBLISHED` | `/manus-storage/V05-doubly-linked-list-ar_35dfc86b.mp4` |
| V06 | `stack-array` | ربط LIFO بعمليات Push وPop وPeek. | `PUBLISHED` | `/manus-storage/V06-stack-ar_6d70b820.mp4` |
| V07 | `stack-linked` | مقارنة السعة الثابتة مع مرونة القمة المرتبطة. | `PUBLISHED` | `/manus-storage/V07-linked-stack-ar_97eac035.mp4` |
| V08 | `queue-array` | FIFO و`front` و`rear` والطابور الدائري. | `PUBLISHED` | `/manus-storage/V08-queue-ar_d9b39b98.mp4` |
| V09 | `queue-linked` | طرفا الطابور وحالة الإفراغ. | `PUBLISHED` | `/manus-storage/V09-linked-queue-ar_f39f789e.mp4` |
| V10 | `recursion` | حالة الأساس ومسار Call Stack. | `PUBLISHED` | `/manus-storage/V10-recursion-ar_dca1ba2d.mp4` |
| V11 | `trees` | مسار المقارنات في BST وأثر التوازن. | `PUBLISHED` | `/manus-storage/V11-bst-ar_c8ae9e81.mp4` |
| V12 | `graphs` | المقارنة بين BFS وDFS وقائمة `visited`. | `PUBLISHED` | `/manus-storage/V12-graph-traversal-ar_1001cd68.mp4` |

## أدلة الإنتاج والحزم

تظل النصوص المحورية والخطافات وقصص المشاهد في `VIDEO_SCRIPTS.md`. وتحتوي `NOTEBOOKLM_PRODUCTION_PACKAGE.md` على النصوص الكاملة، والتعليق، واللوحات، وتعليمات الرسوم، ومصادر كل درس، وموجهات NotebookLM. حفظت ملفات العمل والتعليق وتركيب المشاهد خارج مشروع الويب في `webdev-static-assets/data-academy-video-production/`، بينما تسجل هذه المصفوفة فقط أصول النشر الفعلية.

تؤكد ملفات `renderer/V06` حتى `renderer/V12/config.js` وجود حزم التصيير القابلة للتنفيذ للدفعة الثانية، وتؤكد اختبارات الكتالوج أن كل مصدر `PUBLISHED` أعلاه مربوط بمعرّف الدرس القانوني نفسه. لذلك لا يبقى في المصفوفة معرّف بديل لـV11 أو V12 ولا أصل منشور غير قابل للتحقق.

أكد تدقيق الإكمال اللاحق أن V04–V11 لا تمثل خطة إنتاج متبقية: فقد عادت أصولها العامة بصيغة `video/mp4` واستجابة نطاق جزئي `206`، كما ظهر مشغّل فعلي لكل درس وطابق مصدره المسار المدرج أعلاه. تحقق V05 إضافيًا من حفظ التقدم فوق عتبة 80% وتثبيته عند الإكمال؛ لذلك لا تجري إعادة تصيير أو رفع لأي من هذه الأصول المكتملة.

## ملاحظة تدقيق V02

لم يُعد بناء V02 أو يُستبدل. خصائصه المسجلة 1920×1080 و90.9 ثانية وH.264/AAC. أعاد طلب GET من بيئة المعاينة استجابة 403 بعد إعادة توجيه موقعة؛ لذلك لا يعرض التطبيق مشغّلًا له ولا يدعي الجدول وجود أصل منشور. تحتاج إتاحته لاحقًا إلى استعادة الأصل التاريخي أو رفع MP4 حقيقي موثّق؛ لا يؤثر ذلك في الأصول الجديدة أو روابطها.

## تصحيح معرّفات الربط

صُحّح مدخلا V11 وV12 في الكتالوج من `tree` و`graph` إلى `trees` و`graphs` المطابقين لبيانات الدروس. لا توجد حالة `READY` في هذا السِبرنت؛ الحالات المسموح بها هي `PRODUCED` و`PUBLISHED` و`READY_FOR_PRODUCTION` و`EXTERNAL_PRODUCTION_REQUIRED`.
