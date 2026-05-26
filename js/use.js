// ==========================================
// ไฟล์: js/use.js
// หน้าที่: จัดการฟอร์มบันทึกการขอใช้งานรถ (เบิกรถ)
// ==========================================

// เปลี่ยนเป็น async function เพื่อให้สามารถรอโหลดข้อมูลล่าสุดได้
async function renderUsePage(container) { 
    container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x text-primary"></i><br>กำลังอัปเดตข้อมูลรถ...</div>`;

    // 1. ดึงข้อมูลรถที่กำลังใช้งานล่าสุด (เพื่อเอามากรองรถออกและนับสถิติ)
    try { 
        const res = await apiCall({ action: 'get_active_uses' }); 
        if(res.status === 'success') activeUsesList = res.data; 
    } catch(e) { 
        activeUsesList = []; 
    }

    // คำนวณสถิติ
    const totalCars = currentCarsList.length;
    const inUseCount = activeUsesList.length;
    const availableCount = totalCars - inUseCount;

    // 2. วาดหน้าจอพร้อมเพิ่มแผงสถานะที่กดได้
    container.innerHTML = `
        <div class="page-title" style="color: var(--primary);"><i class="fas fa-car"></i> ขอใช้งานรถยนต์</div>
        <div class="form-box">
            
            <div style="display:flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
                <div style="flex:1; min-width: 150px; background:#D1FAE5; padding:15px; border-radius:8px; text-align:center; border: 1px solid #34D399;">
                    <div style="font-size:14px; color:#065F46; font-weight:600;"><i class="fas fa-check-circle"></i> พร้อมใช้งาน</div>
                    <div style="font-size:28px; font-weight:bold; color:#065F46;">${availableCount} <span style="font-size:14px; font-weight:normal;">คัน</span></div>
                </div>
                <div style="flex:1; min-width: 150px; background:#FEF3C7; padding:15px; border-radius:8px; text-align:center; border: 1px solid #FBBF24; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" 
                     onclick="loadPage('return', document.querySelectorAll('.menu-item')[3])" 
                     onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)';" 
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)';">
                    <div style="font-size:14px; color:#D97706; font-weight:600;"><i class="fas fa-route"></i> กำลังใช้งาน (คลิกไปหน้าคืนรถ)</div>
                    <div style="font-size:28px; font-weight:bold; color:#D97706;">${inUseCount} <span style="font-size:14px; font-weight:normal;">คัน</span></div>
                </div>
            </div>

            <div class="flex-row">
                <div class="input-group flex-col"><label>สังกัด</label><select id="use-sangkat" onchange="updateUsePhanek()"><option value="">- เลือกสังกัด -</option></select></div>
                <div class="input-group flex-col"><label>แผนก</label><select id="use-phanek" onchange="updateUsePlate()"><option value="">- เลือกแผนก -</option></select></div>
            </div>
            <div class="input-group">
                <label>ทะเบียนรถ <span style="color:var(--success); font-weight:normal; font-size: 12px;">(แสดงเฉพาะรถที่ว่าง)</span></label>
                <select id="use-plate" onchange="autoFillUseCarDetails()"><option value="">- เลือกทะเบียนรถ -</option></select>
                <div id="use-tax-warning" style="margin-top: 8px;"></div>
            </div>
            <div class="flex-row" style="background:#F9FAFB; padding:15px; border-radius:8px; border:1px dashed var(--border); margin-bottom:16px;">
                <div class="input-group flex-col" style="margin-bottom:0;"><label>ยี่ห้อ</label><input type="text" id="use-brand" readonly placeholder="Auto-fill"></div>
                <div class="input-group flex-col" style="margin-bottom:0;"><label>ประเภทรถ</label><input type="text" id="use-type" readonly placeholder="Auto-fill"></div>
            </div>
            <hr style="border:0; border-top:1px solid var(--border); margin: 20px 0;">
            <div class="input-group">
                <label>เลขไมล์ก่อนใช้งาน</label><input type="number" id="use-startMile">
            </div>
            <div class="input-group">
                <label>สถานที่ (จุดหมายปลายทาง)</label><input type="text" id="use-location">
            </div>
            <button class="btn" style="width:100%; padding: 14px; margin-top:15px; font-size:16px;" id="submitUseBtn" onclick="submitUseCar()"><i class="fas fa-paper-plane"></i> ยืนยันการขอใช้รถ</button>
        </div>`; 
        
    const select = document.getElementById('use-sangkat'); 
    [...new Set(currentCarsList.map(c => c.sangkat))].forEach(s => select.add(new Option(s, s))); 
}

function updateUsePhanek() { 
    const val = document.getElementById('use-sangkat').value; 
    const select = document.getElementById('use-phanek'); 
    select.innerHTML = '<option value="">- เลือกแผนก -</option>'; 
    document.getElementById('use-plate').innerHTML = '<option value="">- เลือกทะเบียนรถ -</option>'; 
    document.getElementById('use-brand').value = ''; 
    document.getElementById('use-type').value = ''; 
    document.getElementById('use-tax-warning').innerHTML = ''; 
    
    if(val) {
        [...new Set(currentCarsList.filter(c => c.sangkat === val).map(c => c.phanek))].forEach(p => select.add(new Option(p, p))); 
    }
}

function updateUsePlate() { 
    const s = document.getElementById('use-sangkat').value; 
    const p = document.getElementById('use-phanek').value; 
    const select = document.getElementById('use-plate'); 
    select.innerHTML = '<option value="">- เลือกทะเบียนรถ -</option>'; 
    document.getElementById('use-brand').value = ''; 
    document.getElementById('use-type').value = ''; 
    document.getElementById('use-tax-warning').innerHTML = ''; 
    
    if(p) {
        // 3. กรองข้อมูล: ดึงรายการทะเบียนรถที่กำลังใช้งานอยู่มาทำเป็น Array
        const inUsePlates = activeUsesList.map(u => u.plate);
        
        // ค้นหารถในแผนกนั้น "ที่ยังไม่ถูกใช้งาน" (ไม่อยู่ใน inUsePlates)
        const availableCars = currentCarsList.filter(c => c.sangkat === s && c.phanek === p && !inUsePlates.includes(c.plate));
        
        if (availableCars.length === 0) {
            select.innerHTML = '<option value="">- ไม่มีรถว่างในแผนกนี้ -</option>';
        } else {
            availableCars.forEach(c => select.add(new Option(c.plate, c.plate))); 
        }
    }
}

function autoFillUseCarDetails() { 
    const plate = document.getElementById('use-plate').value; 
    const car = currentCarsList.find(c => c.plate === plate); 
    document.getElementById('use-brand').value = car ? car.brand : ''; 
    document.getElementById('use-type').value = car ? car.type : ''; 
    
    const warningDiv = document.getElementById('use-tax-warning');
    if (warningDiv) {
        warningDiv.innerHTML = '';
        if (car && car.taxDate) {
            let tDate = new Date(car.taxDate); 
            if (isNaN(tDate)) { 
                const parts = car.taxDate.toString().split('/'); 
                if (parts.length === 3) tDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); 
            }
            if (!isNaN(tDate)) {
                const now = new Date(); 
                const diffTime = tDate - now; 
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) { 
                    warningDiv.innerHTML = `<span style="color:var(--danger); font-size:13px; font-weight:600;"><i class="fas fa-times-circle"></i> ภาษีรถคันนี้หมดอายุแล้ว! (เลยมา ${Math.abs(diffDays)} วัน)</span>`; 
                } else if (diffDays <= 90) { 
                    warningDiv.innerHTML = `<span style="color:var(--warning); font-size:13px; font-weight:600;"><i class="fas fa-exclamation-triangle"></i> ภาษีรถใกล้หมดอายุ (เหลือ ${diffDays} วัน)</span>`; 
                } else { 
                    warningDiv.innerHTML = `<span style="color:var(--success); font-size:13px; font-weight:600;"><i class="fas fa-check-circle"></i> ภาษีปกติ (เหลือ ${diffDays} วัน)</span>`; 
                }
            }
        }
    }
}

async function submitUseCar() { 
    const plate = document.getElementById('use-plate').value; 
    const startMile = document.getElementById('use-startMile').value; 
    const location = document.getElementById('use-location').value; 
    
    if(!plate) return Swal.fire('แจ้งเตือน', 'ไม่มีรถว่าง หรือ ยังไม่ได้เลือกทะเบียนรถ', 'warning');
    if(!startMile || !location) return Swal.fire('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning'); 
    
    const car = currentCarsList.find(c => c.plate === plate);
    let taxWarningMsg = '';
    
    if (car && car.taxDate) {
        let tDate = new Date(car.taxDate); 
        if (isNaN(tDate)) { 
            const parts = car.taxDate.toString().split('/'); 
            if (parts.length === 3) tDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); 
        }
        if (!isNaN(tDate)) {
            const now = new Date(); 
            const diffTime = tDate - now; 
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) { 
                taxWarningMsg = `<div style="color:var(--danger);font-size:16px;"><b><i class="fas fa-times-circle"></i> ภาษีหมดอายุแล้ว</b><br>เลยกำหนดมา ${Math.abs(diffDays)} วัน</div>`; 
            } else if (diffDays <= 90) { 
                taxWarningMsg = `<div style="color:var(--warning);font-size:16px;"><b><i class="fas fa-exclamation-triangle"></i> ภาษีใกล้หมดอายุ</b><br>เหลือเวลาอีก ${diffDays} วัน</div>`; 
            }
        }
    }
    
    if (taxWarningMsg) {
        const confirmTax = await Swal.fire({ 
            title: '⚠️ แจ้งเตือนสถานะภาษี', 
            html: taxWarningMsg + '<br><br>คุณต้องการยืนยันขอใช้รถคันนี้ต่อหรือไม่?', 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#10B981', 
            cancelButtonColor: '#6B7280', 
            confirmButtonText: 'ยืนยันใช้งาน', 
            cancelButtonText: 'ยกเลิก' 
        });
        if (!confirmTax.isConfirmed) return;
    }

    document.getElementById('submitUseBtn').disabled = true; 
    document.getElementById('submitUseBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> บันทึก...'; 
    
    const user = JSON.parse(localStorage.getItem('user_session')); 
    const payload = { 
        action: 'save_use_car', 
        empName: user.name, 
        sangkat: document.getElementById('use-sangkat').value, 
        phanek: document.getElementById('use-phanek').value, 
        plate: plate, 
        brand: document.getElementById('use-brand').value, 
        type: document.getElementById('use-type').value, 
        startMile: startMile, 
        location: location 
    }; 
    
    try { 
        const res = await apiCall(payload); 
        if(res.status === 'success') { 
            Swal.fire('สำเร็จ', res.message, 'success'); 
            loadPage('use'); 
        } 
    } catch(e) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    } finally { 
        document.getElementById('submitUseBtn').disabled = false; 
        document.getElementById('submitUseBtn').innerHTML = '<i class="fas fa-paper-plane"></i> ยืนยันการขอใช้รถ'; 
    } 
}