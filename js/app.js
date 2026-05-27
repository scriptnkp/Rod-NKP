// ไฟล์: js/app.js
// บทบาท: ตัวควบคุมระบบหลัก (Core Engine) + ยืนยันตัวตน + จัดการ Routing และฟังก์ชันเสริม (Utils)

// --- โค้ดตรวจจับการเปิดผ่านแอป LINE ---
if (navigator.userAgent.indexOf("Line") > -1) {
    Swal.fire({
        title: '⚠️ ตรวจพบแอป LINE',
        html: 'การใช้งานผ่านแอป LINE อาจทำให้กดเมนูไม่ติดบางส่วน<br><br>แนะนำให้กด <b>จุด 3 จุด</b> ที่มุมจอ แล้วเลือก<br><b style="color:var(--success);">"เปิดในเบราว์เซอร์อื่น (Open in browser)"</b><br>เพื่อความลื่นไหลครับ!',
        icon: 'warning',
        confirmButtonText: 'รับทราบ',
        confirmButtonColor: '#10B981'
    });
}

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxmYjemmmUSQWvR-RiRRwOtFpCxjIzhl8RSqiE29uu_qDHHr6i6s2PyU-czJ7ODy1pIlg/exec'; 

// --- ประกาศตัวแปร Global สำหรับแชร์ใช้งานทุกหน้าจอ ---
let currentCarsList = []; 
let currentFuelsList = []; 
let currentUsersList = []; 
let activeUsesList = [];
let currentFilteredFuels = []; 
let currentFuelPage = 1; 
const FUEL_ITEMS_PER_PAGE = 10;

// ส่วนนี้ทำงานเมื่อเปิดหน้าเว็บขึ้นมาแล้วตรวจพบว่าเคย Login ค้างไว้แล้ว
window.onload = async function() { 
    document.getElementById('login-loader').style.display = 'none';
    const savedUser = localStorage.getItem('user_session'); 
    if(savedUser) { 
        renderDashboard(JSON.parse(savedUser)); 
        
        // 🔴 1. แสดง Popup กำลังโหลดข้อมูลทันที
        Swal.fire({
            title: 'กำลังเชื่อมต่อเซิร์ฟเวอร์',
            text: 'กรุณารอสักครู่ ระบบกำลังดึงข้อมูลพื้นฐาน...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading(); // เปิดแอนิเมชันหมุนๆ ของ SweetAlert2
            }
        });
        
        await fetchCarsData(); // รอโหลดข้อมูลรถยนต์
        await loadPage('dashboard', document.querySelector('.menu-item')); // รอเตรียมหน้า Dashboard
        
        // 🔴 2. ปิด Popup ทันทีเมื่อโหลดทุกอย่างเสร็จสิ้น
        Swal.close(); 
    } 
}

// --- ฟังก์ชันหลักสำหรับเรียกเชื่อมต่อ Google Apps Script API Backend ---
async function apiCall(payload) { 
    try { 
        const response = await fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) }); 
        return await response.json(); 
    } catch(e) { 
        console.error("API Call Error: ", e); 
        throw e; 
    } 
}

// --- ระบบสลับหน้าเว็บเพจ (Client-Side Router) ---
async function loadPage(page, element = null) {
    if(element) { 
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active')); 
        element.classList.add('active'); 
    }
    // ซ่อนแถบ Sidebar อัตโนมัติเมื่อกดในอุปกรณ์หน้าจอเล็ก (Mobile)
    if(window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('active');
    
    const contentDiv = document.getElementById('page-content');
    
    // คัดกรองและส่งต่อไปยังฟังก์ชันแสดงผลในแต่ละโมดูลย่อย
    if(page === 'dashboard') { await renderMainDashboard(contentDiv); } 
    else if(page === 'check') { renderInspectionPage(contentDiv); }
    else if(page === 'use') { renderUsePage(contentDiv); }
    else if(page === 'return') { renderReturnPage(contentDiv); }
    else if(page === 'fuel') { renderFuelDashboard(contentDiv); }
    else if(page === 'report') { renderReportPage(contentDiv); } 
    else if(page === 'car-settings') { renderAdminCarPage(contentDiv); }
    else if(page === 'user-settings') { renderAdminUserPage(contentDiv); }
}

// --- ระบบเข้าสู่ระบบ & ควบคุมสิทธิ์ (Authentication & Profile) ---
async function handleLogin() { 
    const empId = document.getElementById('empId').value; 
    if(!empId) return Swal.fire('แจ้งเตือน', 'กรุณากรอกรหัสพนักงาน', 'warning'); 
    
    document.getElementById('loginBtn').disabled = true; 
    
    // 🔴 1. แสดง Popup ทันทีที่กดปุ่มเข้าสู่ระบบ
    Swal.fire({
        title: 'กำลังเข้าสู่ระบบ',
        text: 'กรุณารอสักครู่ ระบบกำลังตรวจสอบข้อมูล...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try { 
        // สั่งเชื่อมต่อ API เพื่อตรวจสอบรหัสพนักงาน
        const result = await apiCall({ action: 'login', empId: empId }); 
        
        if(result.status === 'success') { 
            localStorage.setItem('user_session', JSON.stringify(result.data)); 
            renderDashboard(result.data); 
            
            // 🔴 2. เปลี่ยนข้อความใน Popup เมื่อ Login ผ่าน (ไม่ต้องปิดเปิดใหม่)
            Swal.update({
                title: 'เข้าสู่ระบบสำเร็จ!',
                text: 'กำลังดาวน์โหลดข้อมูลระบบรถยนต์ กรุณารอสักครู่...'
            });
            
            await fetchCarsData(); // รอโหลดข้อมูลรถยนต์
            await loadPage('dashboard'); // รอเตรียมหน้า Dashboard
            
            // 🔴 3. ปิด Popup เมื่อพร้อมแสดงผล
            Swal.close(); 
        } else { 
            // กรณีรหัสพนักงานผิด จะแสดง Popup แจ้งเตือน Error
            Swal.fire('เกิดข้อผิดพลาด', result.message, 'error'); 
        } 
    } catch (error) { 
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์', 'error'); 
    } finally { 
        document.getElementById('loginBtn').disabled = false; 
    } 
}

function renderDashboard(userData) { 
    document.getElementById('login-screen').style.display = 'none'; 
    document.getElementById('dashboard-screen').style.display = 'flex'; 
    document.getElementById('user-display-name').innerHTML = `<i class="fas fa-user-circle"></i> ${userData.name} (${userData.role})`; 
    
    // เปิดการแสดงผลเมนูผู้ดูแลระบบ (Admin)
    if(userData.role === 'Admin') { 
        document.getElementById('menu-admin-car').classList.remove('hidden'); 
        document.getElementById('menu-admin-user').classList.remove('hidden'); 
    } 
}

function logout() { 
    localStorage.removeItem('user_session'); 
    document.getElementById('dashboard-screen').style.display = 'none'; 
    document.getElementById('login-screen').style.display = 'flex'; 
    document.getElementById('login-loader').style.display = 'none'; 
    document.getElementById('empId').value = ''; 
}

function toggleMenu() { 
    document.getElementById('sidebar').classList.toggle('active'); 
    if(window.innerWidth > 768) document.getElementById('main-content').classList.toggle('shift'); 
}

// --- ฟังก์ชันดึงข้อมูลพื้นฐานเก็บไว้ใน Cache ---
async function fetchCarsData() { try { const result = await apiCall({ action: 'get_cars' }); if(result.status === 'success') { currentCarsList = result.data; updateSidebarAlerts(); } } catch(e) {} }
async function fetchUsersData() { try { const result = await apiCall({ action: 'get_users' }); if(result.status === 'success') currentUsersList = result.data; } catch(e) {} }
async function fetchFuelsData() { try { const result = await apiCall({ action: 'get_fuels' }); if(result.status === 'success') currentFuelsList = result.data; } catch(e) {} }

// --- ฟังก์ชันอำนวยความสะดวกทั่วไป (Utility Functions) ---
function formatDisplayDate(dateStr) { 
    if(!dateStr) return ''; 
    if(dateStr.includes('T') && dateStr.includes('Z')) { 
        const d = new Date(dateStr); 
        const pad = (n) => n.toString().padStart(2, '0'); 
        return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; 
    } 
    return dateStr; 
}

function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.7) { 
    return new Promise((resolve, reject) => { 
        if (!file) return resolve(""); 
        const reader = new FileReader(); 
        reader.readAsDataURL(file); 
        reader.onload = (event) => { 
            const img = new Image(); 
            img.src = event.target.result; 
            img.onload = () => { 
                let width = img.width; let height = img.height; 
                if (width > maxWidth || height > maxHeight) { 
                    if (width > height) { height = Math.round((height *= maxWidth / width)); width = maxWidth; } 
                    else { width = Math.round((width *= maxHeight / height)); height = maxHeight; } 
                } 
                const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; 
                const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); 
                resolve(canvas.toDataURL('image/jpeg', quality)); 
            }; 
            img.onerror = (e) => reject(e); 
        }; 
        reader.onerror = (e) => reject(e); 
    }); 
}

function ThaiBaht(Number) {
    let txtNumArr = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า', 'สิบ'];
    let txtDigitArr = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
    let BahtText = '';
    if (isNaN(Number)) return 'ข้อมูลไม่ถูกต้อง';
    let amount = parseFloat(Number).toFixed(2) + '';
    let parts = amount.split('.'); let number = parts[0]; let decimal = parts[1];

    function convert(str) {
        let text = '';
        for (let i = 0; i < str.length; i++) {
            let n = parseInt(str.charAt(i)); let place = str.length - i - 1;
            if (n !== 0) {
                if (n === 1 && place === 0 && str.length > 1) { text += 'เอ็ด'; } 
                else if (n === 2 && place === 1) { text += 'ยี่สิบ'; } 
                else if (n === 1 && place === 1) { text += 'สิบ'; } 
                else { text += txtNumArr[n] + txtDigitArr[place % 6]; if (place >= 6 && place % 6 === 0) text += 'ล้าน'; }
            } else if (place >= 6 && place % 6 === 0 && text.length > 0 && !text.endsWith('ล้าน')) { text += 'ล้าน'; }
        } return text;
    }
    BahtText = convert(number); if (BahtText === '') BahtText = 'ศูนย์'; BahtText += 'บาท';
    if (decimal === '00') { BahtText += 'ถ้วน'; } else { BahtText += convert(decimal) + 'สตางค์'; }
    return BahtText;
}

function updateSidebarAlerts() {
    let alertCount = 0; const now = new Date();
    currentCarsList.forEach(car => {
        if (car.taxDate) {
            let tDate = new Date(car.taxDate); 
            if (isNaN(tDate)) { const parts = car.taxDate.toString().split('/'); if (parts.length === 3) tDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); }
            if (!isNaN(tDate)) { const diffDays = Math.ceil((tDate - now) / (1000 * 60 * 60 * 24)); if (diffDays <= 90) alertCount++; }
        }
    });
    const alertIcon = document.getElementById('sidebar-car-alert');
    if (alertIcon) alertIcon.style.display = alertCount > 0 ? 'inline-block' : 'none';
}
