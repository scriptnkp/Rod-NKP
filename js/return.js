// ==========================================
// ไฟล์: js/return.js
// หน้าที่: แสดงรายการรถที่กำลังถูกใช้งาน, จัดการฟังก์ชันการคืนรถ และฟีเจอร์แชร์ภาพ
// ==========================================

async function renderReturnPage(container) { 
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <div class="page-title" style="color: var(--warning); margin-bottom: 0;"><i class="fas fa-undo"></i> รถที่อยู่ระหว่างการใช้งาน</div>
            <button class="btn btn-outline" style="border-color: var(--primary); color: var(--primary); background: white;" onclick="shareReturnCarsImage()">
                <i class="fas fa-camera"></i> แคปภาพตามรถ
            </button>
        </div>
        <div id="active-list-loader" style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
        
        <div id="capture-area" style="background: var(--bg); padding: 15px; border-radius: 12px;">
            <div class="card-grid" id="active-use-container" style="margin-top: 0;"></div>
        </div>`; 
        
    try { 
        const res = await apiCall({ action: 'get_active_uses' }); 
        const loader = document.getElementById('active-list-loader'); 
        const grid = document.getElementById('active-use-container'); 
        
        if(!loader || !grid) return; 
        loader.style.display = 'none'; 
        
        if(res.data.length === 0) { 
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 30px; background:white; border-radius:12px;">ไม่มีรถที่กำลังใช้งานอยู่</div>`; 
            return; 
        } 
        
        res.data.forEach(use => { 
            // --- ระบบแปลงรูปแบบวันที่ และ คำนวณจำนวนวัน ---
            let daysText = '-';
            let displayDate = '-';
            
            if(use.date) {
                try {
                    let useDateObj;
                    if(use.date.toString().includes('T')) {
                        useDateObj = new Date(use.date);
                    } else {
                        const parts = use.date.split(' ');
                        const dateParts = parts[0].split('/');
                        const timeParts = parts[1] ? parts[1].split(':') : [0,0,0];
                        useDateObj = new Date(dateParts[2], parseInt(dateParts[1]) - 1, dateParts[0], timeParts[0], timeParts[1]);
                    }
                    
                    if(!isNaN(useDateObj)) {
                        const dd = String(useDateObj.getDate()).padStart(2, '0');
                        const mm = String(useDateObj.getMonth() + 1).padStart(2, '0');
                        const yyyy = useDateObj.getFullYear();
                        const hh = String(useDateObj.getHours()).padStart(2, '0');
                        const min = String(useDateObj.getMinutes()).padStart(2, '0');
                        
                        displayDate = `${dd}/${mm}/${yyyy} เวลา ${hh}:${min} น.`;
                        
                        const now = new Date();
                        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const useMidnight = new Date(useDateObj.getFullYear(), useDateObj.getMonth(), useDateObj.getDate());
                        
                        const diffTime = todayMidnight - useMidnight;
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        
                        if(diffDays === 0) {
                            daysText = '<span style="color:var(--success); font-weight:600;">ใช้งานวันนี้</span>';
                        } else if (diffDays > 0) {
                            const color = diffDays >= 3 ? 'var(--danger)' : 'var(--warning)';
                            daysText = `<span style="color:${color}; font-weight:600;">${diffDays} วัน</span>`;
                        }
                    }
                } catch(e) {
                    displayDate = use.date; 
                    daysText = 'N/A';
                }
            }
            
            // หมายเหตุ: เอาปุ่มออกชั่วคราวตอนแสดงผลในภาพแคปจอ (ใช้ CSS ช่วยซ่อนผ่าน html2canvas ได้ แต่วิธีนี้ชัวร์สุด)
            grid.innerHTML += `
                <div class="use-card capture-card">
                    <div class="use-card-header">
                        <div class="use-card-plate"><i class="fas fa-car-side"></i> ${use.plate}</div>
                        <div class="use-card-badge">กำลังใช้งาน</div>
                    </div>
                    <div class="use-card-detail"><strong>ผู้เบิก:</strong> ${use.empName}</div>
                    <div class="use-card-detail"><strong>สถานที่:</strong> ${use.location}</div>
                    <div class="use-card-detail"><strong>ไมล์เริ่มต้น:</strong> ${use.startMile}</div>
                    
                    <div class="use-card-detail" style="margin-top: 10px; margin-bottom: 15px; background: #F3F4F6; padding: 10px; border-radius: 8px; font-size: 13px; border: 1px dashed var(--border);">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                            <span style="color:var(--text-light);"><i class="far fa-calendar-alt text-primary"></i> วันที่ยืม:</span>
                            <span style="font-weight:500;">${displayDate}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-light);"><i class="fas fa-clock text-warning"></i> ระยะเวลา:</span>
                            <span>${daysText}</span>
                        </div>
                    </div>

                    <button class="btn btn-warning no-capture-btn" style="width:100%;" onclick="openReturnModal('${use.useId}', '${use.plate}', '${use.startMile}')">
                        <i class="fas fa-key"></i> ดำเนินการคืนรถ
                    </button>
                </div>`; 
        }); 
    } catch (error) {
        console.error("Error loading active uses:", error);
    } 
}

// 📸 ฟังก์ชันสำหรับถ่ายภาพหน้าจอ (Screenshot)
async function shareReturnCarsImage() {
    const captureArea = document.getElementById('capture-area');
    const grid = document.getElementById('active-use-container');
    
    if (!captureArea || grid.innerHTML.includes('ไม่มีรถที่กำลังใช้งานอยู่') || grid.innerHTML === '') {
        return Swal.fire('แจ้งเตือน', 'ไม่มีรายการรถให้แคปภาพครับ', 'info');
    }

    if (typeof html2canvas === 'undefined') {
        return Swal.fire('เกิดข้อผิดพลาด', 'ไม่พบระบบถ่ายภาพ กรุณารีเฟรชหน้าเว็บแล้วลองใหม่ครับ', 'error');
    }

    // 1. แจ้งผู้ใช้ว่ากำลังประมวลผล
    Swal.fire({
        title: 'กำลังสร้างรูปภาพ...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        // 2. ซ่อนปุ่ม "ดำเนินการคืนรถ" สีส้มชั่วคราว เพื่อให้รูปภาพดูสะอาดตา (ส่งให้คนอื่นดู)
        const buttons = document.querySelectorAll('.no-capture-btn');
        buttons.forEach(btn => btn.style.display = 'none');

        // 3. ถ่ายภาพพื้นที่ Capture Area (ตั้งค่า scale: 2 เพื่อให้ภาพคมชัดระดับ HD)
        const canvas = await html2canvas(captureArea, {
            scale: 2,
            backgroundColor: '#F9FAFB', 
            useCORS: true 
        });

        // 4. นำปุ่มกลับมาแสดงเหมือนเดิม
        buttons.forEach(btn => btn.style.display = 'inline-flex');

        // 5. แปลง Canvas เป็นไฟล์รูปภาพ (PNG)
        const image = canvas.toDataURL("image/png");
        
        // 6. สั่งให้เบราว์เซอร์ดาวน์โหลดรูปอัตโนมัติ
        const link = document.createElement('a');
        link.href = image;
        const dateStr = new Date().toISOString().slice(0, 10);
        link.download = `รายการตามรถคืน-${dateStr}.png`;
        link.click();
        
        Swal.close();
        Swal.fire({
            title: 'บันทึกภาพสำเร็จ!',
            text: 'ระบบได้ดาวน์โหลดภาพลงเครื่องแล้ว คุณสามารถส่งเข้ากลุ่ม LINE ได้เลยครับ',
            icon: 'success',
            timer: 2500,
            showConfirmButton: false
        });

    } catch (error) {
        console.error("Capture Error:", error);
        
        // อย่าลืมนำปุ่มกลับมาแสดงถ้าระบบถ่ายภาพ Error
        const buttons = document.querySelectorAll('.no-capture-btn');
        buttons.forEach(btn => btn.style.display = 'inline-flex');
        
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างรูปภาพได้', 'error');
    }
}

// ฟังก์ชันเปิด Modal และ บันทึกคืนรถ ยังคงเหมือนเดิมเป๊ะครับ
function openReturnModal(useId, plate, startMile) { 
    document.getElementById('returnModal').style.display = 'flex'; 
    document.getElementById('return-useId').value = useId; 
    document.getElementById('return-display-plate').innerHTML = `<i class="fas fa-car"></i> ทะเบียน: ${plate}`; 
    document.getElementById('return-display-startMile').innerText = `ไมล์ก่อนเดินทาง: ${startMile}`; 
    document.getElementById('return-endMile').value = ''; 
}

async function submitReturn() { 
    const endMile = document.getElementById('return-endMile').value; 
    if(!endMile) return Swal.fire('แจ้งเตือน', 'กรุณาระบุเลขไมล์ล่าสุด', 'warning'); 
    
    document.getElementById('submitReturnBtn').disabled = true; 
    document.getElementById('submitReturnBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> บันทึก...'; 
    
    const user = JSON.parse(localStorage.getItem('user_session')); 
    const payload = { 
        action: 'save_return_car', 
        useId: document.getElementById('return-useId').value, 
        endMile: endMile, 
        empName: user.name 
    }; 
    
    try { 
        const res = await apiCall(payload); 
        if(res.status === 'success') { 
            Swal.fire('สำเร็จ', res.message, 'success'); 
            document.getElementById('returnModal').style.display = 'none'; 
            
            const activeMenu = document.querySelector('.menu-item.active');
            if (activeMenu && activeMenu.innerText.includes('หน้าหลัก')) {
                await fetchCarsData(); 
                loadPage('dashboard'); 
            } else {
                loadPage('return'); 
            }
        } 
    } catch(e) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลคืนรถได้', 'error');
    } finally { 
        document.getElementById('submitReturnBtn').disabled = false; 
        document.getElementById('submitReturnBtn').innerHTML = 'ยืนยันการคืนรถ'; 
    } 
}