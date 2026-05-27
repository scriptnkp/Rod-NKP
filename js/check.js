// ==========================================
// ไฟล์: js/check.js
// หน้าที่: จัดการฟอร์มบันทึกการตรวจเช็คสภาพรถก่อน-หลังใช้งาน
// ==========================================

function renderInspectionPage(container) { 
    container.innerHTML = `
        <div class="page-title" style="color: var(--success);"><i class="fas fa-wrench"></i> ตรวจเช็คสภาพรถ</div>
        <div class="form-box">
            <div class="flex-row">
                <div class="input-group flex-col"><label>สังกัด</label><select id="ins-sangkat" onchange="updateInsPhanek()"><option value="">- เลือกสังกัด -</option></select></div>
                <div class="input-group flex-col"><label>แผนก</label><select id="ins-phanek" onchange="updateInsPlate()"><option value="">- เลือกแผนก -</option></select></div>
            </div>
            <div class="input-group"><label>ทะเบียนรถ</label><select id="ins-plate"><option value="">- เลือกทะเบียนรถ -</option></select></div>
            
            <div style="margin-top: 20px; margin-bottom:15px; font-weight:600; color:var(--success); border-bottom: 2px solid #E5E7EB; padding-bottom:8px;">
                <i class="fas fa-clipboard-list"></i> หัวข้อการตรวจเช็ค
            </div>
            ${['ระบบไฟ (หน้า/เลี้ยว/เบรก)', 'ยาง และ ล้อ', 'ของเหลว (น้ำมัน/น้ำ)', 'แบตเตอรี่ และ สตาร์ท', 'ระบบเบรก และ ช่วงล่าง', 'ความสะอาดตัวรถ'].map((item, index) => 
                `<div class="check-item"><label>${index+1}. ${item}</label><select id="check-${index+1}"><option value="✅ ปกติ">✅ ปกติ</option><option value="❌ ชำรุด">❌ ชำรุด</option></select></div>`
            ).join('')}
            
            <div class="input-group" style="margin-top:20px;">
                <label>รายละเอียดชำรุด (หมายเหตุ)</label>
                <textarea id="ins-note" rows="3" placeholder="ระบุรายละเอียดเพิ่มเติม..."></textarea>
            </div>
            <div class="input-group">
                <label>อัปโหลดภาพจุดชำรุด (ถ้ามี)</label>
                <input type="file" id="ins-image" accept="image/*">
            </div>
            <button class="btn btn-success" style="width:100%; padding:14px; margin-top:15px;" id="submitInsBtn" onclick="submitInspection()"><i class="fas fa-save"></i> บันทึกตรวจสภาพ</button>
        </div>`; 
        
    const select = document.getElementById('ins-sangkat'); 
    [...new Set(currentCarsList.map(c => c.sangkat))].forEach(s => select.add(new Option(s, s))); 
}

function updateInsPhanek() { 
    const val = document.getElementById('ins-sangkat').value; 
    const select = document.getElementById('ins-phanek'); 
    select.innerHTML = '<option value="">- เลือกแผนก -</option>'; 
    document.getElementById('ins-plate').innerHTML = '<option value="">- เลือกทะเบียนรถ -</option>'; 
    
    if(val) {
        [...new Set(currentCarsList.filter(c => c.sangkat === val).map(c => c.phanek))].forEach(p => select.add(new Option(p, p))); 
    }
}

function updateInsPlate() { 
    const s = document.getElementById('ins-sangkat').value; 
    const p = document.getElementById('ins-phanek').value; 
    const select = document.getElementById('ins-plate'); 
    select.innerHTML = '<option value="">- เลือกทะเบียนรถ -</option>'; 
    
    if(p) {
        currentCarsList.filter(c => c.sangkat === s && c.phanek === p).forEach(c => select.add(new Option(c.plate, c.plate))); 
    }
}

async function submitInspection() { 
    const plate = document.getElementById('ins-plate').value; 
    if(!plate) return Swal.fire('แจ้งเตือน', 'กรุณาเลือกทะเบียนรถ', 'warning'); 
    
    const imgFile = document.getElementById('ins-image').files[0]; 
    
    // 🔴 แก้ไขจุดที่ 2: ปลดล็อกเงื่อนไขตรวจสอบรูปภาพออก เพื่อไม่ให้ระบบแจ้งเตือนบังคับอัปโหลด
    document.getElementById('submitInsBtn').disabled = true; 
    document.getElementById('submitInsBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> บันทึก...'; 
    
    // ตรวจสอบว่าถ้าผู้ใช้มีการเลือกไฟล์รูปภาพ ค่อยประมวลผลบีบอัดไฟล์ ถ้าไม่มีให้ส่งเป็นค่าว่างเปล่า
    let base64String = ''; 
    if (imgFile) {
        base64String = await compressImage(imgFile); 
    }
    
    const user = JSON.parse(localStorage.getItem('user_session')); 
    
    const payload = { 
        action: 'save_inspection', 
        empName: user.name, 
        sangkat: document.getElementById('ins-sangkat').value, 
        phanek: document.getElementById('ins-phanek').value, 
        plate: plate, 
        c_light: document.getElementById('check-1').value, 
        c_tire: document.getElementById('check-2').value, 
        c_fluid: document.getElementById('check-3').value, 
        c_battery: document.getElementById('check-4').value, 
        c_brake: document.getElementById('check-5').value, 
        c_clean: document.getElementById('check-6').value, 
        note: document.getElementById('ins-note').value, 
        imageBase64: base64String 
    }; 
    
    try { 
        const res = await apiCall(payload); 
        if(res.status === 'success') { 
            Swal.fire('สำเร็จ', res.message, 'success'); 
            loadPage('check'); 
        } 
    } catch(e) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    } finally { 
        document.getElementById('submitInsBtn').disabled = false; 
        document.getElementById('submitInsBtn').innerHTML = '<i class="fas fa-save"></i> บันทึกตรวจสภาพ'; 
    } 
}
