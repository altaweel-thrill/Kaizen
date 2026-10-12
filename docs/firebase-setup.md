# حفظ طلبات Kaizen في Firebase فقط

النموذج مجهز للحفظ عبر وظيفة `submitAssessment` في مجموعة `assessmentLeads`. لا يرسل بريدًا ولا يحتاج SMTP أو Resend.

## حالة التفعيل

تم تفعيل Blaze ونشر وظيفة `submitAssessment` في `europe-west1`. نجح اختبار الحفظ الفعلي وقراءة السجل بصلاحيات الإدارة، وإعادة الإرسال دون تغيير السجل، ورفض تعديل الطلب بالمعرّف نفسه، ورفض الحقول غير الصالحة والأصول غير المسموح بها. القراءة العامة من Firestore مرفوضة. تم حذف الطلب التجريبي بعد التحقق.

خدمة الحفظ جاهزة، وملفات الموقع المحلية مربوطة بها. يلزم رفع ملفات الموقع المحدثة لتفعيل النسخة المنشورة.

## تحديث الخدمة

لإعادة نشر الوظيفة بعد تعديلها:

```bash
npm --prefix functions ci
firebase deploy --only functions:kaizen-leads:submitAssessment --project kaizen-44bef
```

إعدادات أصول المواقع المسموح بها موجودة في `functions/.env` تحت `ALLOWED_ORIGINS`. أضف أصل الدومين الخاص عندما تحدده.

القواعد الحالية تمنع الوصول المباشر بالفعل، فلا حاجة لاستبدالها. وظيفة الحفظ تستخدم صلاحيات الخادم. لا تستبدل قواعد التطبيقات الأخرى في مشروع مشترك.

رابط الوظيفة المنشورة والمضبوط في النموذج:

```text
https://europe-west1-kaizen-44bef.cloudfunctions.net/submitAssessment
```

شاهد الطلبات في Firebase Console → Firestore Database → Data → assessmentLeads. استخدم HTTP محليًا بدل `file://` لأن طلبات الأصل `null` مرفوضة. للفحص الآلي يمكنك تشغيل `node tests/firebase-live-check.js`؛ يكتب طلبًا تجريبيًا ثم يحذفه، ويحتاج جلسة Firebase CLI صالحة.

## المتابعة

- تاريخ `createdAt` من الخادم والحالة `new`.
- إعادة المحاولة بنفس المعرّف لا تنشئ سجلًا إضافيًا.
- الحد عشرة طلبات جديدة في الساعة لكل عنوان اتصال.
- يمكن تفعيل TTL للحقل `expiresAt` في مجموعة `assessmentRateLimits`.
- عند فشل الحفظ تبقى المدخلات ويظهر رابط واتساب؛ النجاح لا يظهر قبل تأكيد الحفظ.

[وثائق نشر Cloud Functions](https://firebase.google.com/docs/functions/get-started).
