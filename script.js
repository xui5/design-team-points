
// شاشة التحميل
window.addEventListener('load', function() {
    setTimeout(() => {
        const loader = document.querySelector('.loader-wrapper');
        loader.classList.add('hidden');
    }, 1500);
    
    // تحميل البيانات من Google Sheets عند تحميل الصفحة
    loadTeamData();
});

// معرف الجدول والمفتاح الحقيقي
const SHEET_ID = '1_zWO7VY0uLhHtXJwpNKUBe3FJt5roxWXSOq6eFzTmm4';
const API_KEY = 'AIzaSyACBVXkfY8BQAqM2S-nzpwnrYt73C_zAvw';

// دالة تحميل البيانات من Google Sheets
async function loadTeamData() {
    try {
        console.log('جاري تحميل البيانات...'); // للتأكد من عمل الدالة
        
        // تحميل بيانات النقاط من الورقة الأولى (Sheet1)
        const pointsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`);
        const pointsData = await pointsResponse.json();
        console.log('بيانات النقاط:', pointsData); // لرؤية البيانات في console
        
        // تحميل بيانات التفاصيل من الورقة الثانية (تفاصيل)
        const detailsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/تفاصيل?key=${API_KEY}`);
        const detailsData = await detailsResponse.json();
        console.log('بيانات التفاصيل:', detailsData); // لرؤية البيانات في console
        
        // تحديث البطاقات بالبيانات
        updateCards(pointsData.values, detailsData.values);
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
}

// دالة تحديث البطاقات
function updateCards(pointsRows, detailsRows) {
    if (!pointsRows || pointsRows.length < 2) {
        console.error('لا توجد بيانات كافية في جدول النقاط');
        return;
    }
    
    const cards = document.querySelectorAll('.member-card');
    console.log('عدد البطاقات:', cards.length); // للتأكد من وجود البطاقات
    
    // إنشاء قاموس للتفاصيل
    let memberDetails = {};
    if (detailsRows && detailsRows.length > 1) {
        for (let i = 1; i < detailsRows.length; i++) {
            const row = detailsRows[i];
            if (row && row[0]) {
                memberDetails[row[0].trim()] = row[1] || 'لا توجد تفاصيل متاحة';
            }
        }
    }
    console.log('قاموس التفاصيل:', memberDetails); // للتأكد من قراءة التفاصيل
    
    // تخزين التفاصيل للاستخدام في النافذة المنبثقة
    window.memberDetails = memberDetails;
    
    // تحديث كل بطاقة
    for (let i = 1; i < pointsRows.length; i++) {
        const row = pointsRows[i];
        if (!row || row.length < 2) continue;
        
        const memberName = row[0] ? row[0].trim() : '';
        if (!memberName) continue;
        
        // البحث عن البطاقة المناسبة (أو استخدام الترتيب)
        const cardIndex = i - 1;
        if (cardIndex >= cards.length) continue;
        
        const card = cards[cardIndex];
        if (!card) continue;
        
        // تحديث الاسم
        const nameElement = card.querySelector('.member-name');
        if (nameElement) nameElement.textContent = memberName;
        
        // تحديث النقاط
        const pointItems = card.querySelectorAll('.point-item');
        if (pointItems.length >= 5) {
            // بوستات
            const postValue = pointItems[0].querySelector('.point-value, .white-value');
            if (postValue) postValue.textContent = row[1] || '-';
            
            // ملف
            const fileValue = pointItems[1].querySelector('.point-value, .white-value');
            if (fileValue) fileValue.textContent = row[2] || '-';
            
            // اقتراح
            const suggestValue = pointItems[2].querySelector('.point-value, .white-value');
            if (suggestValue) suggestValue.textContent = row[3] || '-';
            
            // تعديل
            const editValue = pointItems[3].querySelector('.point-value, .white-value');
            if (editValue) editValue.textContent = row[4] || '-';
            
            // المجموع
            const totalValue = pointItems[4].querySelector('.total-value, .blue-total');
            if (totalValue) totalValue.textContent = row[5] || '0';
        }
        
        // تحديث المنصب
        const roleElement = card.querySelector('.member-role');
        if (roleElement) {
            if (memberName.includes('فرح')) {
                roleElement.textContent = 'قائد الفريق';
            } else if (memberName.includes('معاذ')) {
                roleElement.textContent = 'نائب قائد الفريق';
            } else if (memberName) {
                roleElement.textContent = 'عضو';
            }
        }
    }
    
    console.log('تم تحديث البطاقات بنجاح');
}

// فتح النافذة المنبثقة
function openPopup(name) {
    const popup = document.getElementById('popup');
    const title = document.getElementById('popup-title');
    const body = document.getElementById('popup-body');
    
    if (!popup || !title || !body) {
        console.error('عناصر النافذة المنبثقة غير موجودة');
        return;
    }
    
    title.textContent = name;
    
    // الحصول على التفاصيل من window.memberDetails
    const details = window.memberDetails ? window.memberDetails[name] : null;
    body.textContent = details || 'لا توجد تفاصيل متاحة';
    
    popup.classList.add('show');
}

// إغلاق النافذة المنبثقة
function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) popup.classList.remove('show');
}

// إغلاق النافذة عند الضغط خارجها
window.addEventListener('click', function(e) {
    const popup = document.getElementById('popup');
    if (e.target === popup) {
        closePopup();
    }
});

// تأثيرات عند التمرير
window.addEventListener('scroll', function() {
    const cards = document.querySelectorAll('.member-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100 && rect.bottom > 0;
        if (isVisible) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
});

// تأثيرات على المربع الرئيسي
const mainCard = document.getElementById('mainCard');
if (mainCard) {
    mainCard.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(-5px) scale(1.01)';
        this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.3)';
    });
    
    mainCard.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    mainCard.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
    });
}

// حركة العناصر مع الماوس
document.addEventListener('mousemove', function(e) {
    const elements = document.querySelectorAll('.element');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    elements.forEach((element, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX * speed) - (speed / 2);
        const y = (mouseY * speed) - (speed / 2);
        element.style.transform = `translate(${x}px, ${y}px)`;
    });
});
