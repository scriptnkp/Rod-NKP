// ==========================================
// ไฟล์: js/dashboard.js
// หน้าที่: จัดการหน้าแรก (Dashboard) สถิติ และการแสดงภาพรวม
// ==========================================

function applySwalFilter() {
    const filterValue = document.getElementById('swal-dept-filter').value;
    const rows = document.querySelectorAll('.swal-car-row');
    rows.forEach(row => {
        if (filterValue === 'all' || row.getAttribute('data-dept') === filterValue) { 
            row.style.display = ''; 
        } else { 
            row.style.display = 'none'; 
        }
    });
}

function showCarStatusDetails(status) {
    let list = []; let title = '';
    
    if (status === 'available') {
        title = '<i class="fas fa-check-circle" style="color:var(--success);"></i> รถที่พร้อมใช้งาน';
        const activePlates = activeUsesList.map(u => u.plate);
        list = currentCarsList.filter(c => !activePlates.includes(c.plate));
    } else {
        title = '<i class="fas fa-route" style="color:var(--warning);"></i> รถที่กำลังใช้งาน';
        list = activeUsesList;
    }
    
    if (list.length === 0) { 
        Swal.fire({title: title, text: 'ไม่มีข้อมูล', icon: 'info', confirmButtonText: 'ปิด', confirmButtonColor: '#6366F1'}); 
        return; 
    }
    
    let depts = [];
    list.forEach(item => { 
        let dept = status === 'available' ? item.phanek : (currentCarsList.find(c => c.plate === item.plate) || {}).phanek; 
        if(dept && !depts.includes(dept)) depts.push(dept); 
    });
    depts.sort();

    let filterHtml = `<div style="margin-bottom: 15px; text-align: left; font-family: Sarabun, sans-serif;"><label style="font-size: 14px; font-weight: 600; color: var(--text);">กรองตามแผนก:</label><select id="swal-dept-filter" onchange="applySwalFilter()" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border); outline: none; margin-top:5px; font-family: Sarabun, sans-serif; font-size:14px;"><option value="all">- แสดงทุกแผนก -</option>${depts.map(d => `<option value="${d}">${d}</option>`).join('')}</select></div>`;
    let html = '<div style="text-align: left; font-family: Sarabun, sans-serif;">' + filterHtml;
    
    html += '<div style="max-height: 350px; overflow-y: auto; overflow-x: hidden; border: 1px solid var(--border); border-radius: 8px;"><table style="width:100%; border-collapse: collapse; font-size:14px; table-layout: fixed;"><thead><tr style="background:#f3f4f6;"><th style="padding:10px; border-bottom:1px solid #e5e7eb; width:40%;">ทะเบียน/รถ</th><th style="padding:10px; border-bottom:1px solid #e5e7eb; width:30%;">แผนก/สังกัด</th><th style="padding:10px; border-bottom:1px solid #e5e7eb; width:30%;">รายละเอียด</th></tr></thead><tbody id="swal-car-list">';
    
    list.forEach(item => {
        if (status === 'available') {
            html += `<tr class="swal-car-row" data-dept="${item.phanek}"><td style="padding:10px; border-bottom:1px solid #e5e7eb; font-weight:600; color:var(--success);">${item.plate}<br><span style="font-size:12px;color:var(--text-light);font-weight:normal;">${item.brand} ${item.type}</span></td><td style="padding:10px; border-bottom:1px solid #e5e7eb;">${item.phanek}<br><span style="font-size:12px;color:var(--text-light);">${item.sangkat}</span></td><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><span style="background:#D1FAE5; color:#065F46; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600;">พร้อมใช้งาน</span></td></tr>`;
        } else {
            const cInfo = currentCarsList.find(c => c.plate === item.plate) || {}; 
            let dept = cInfo.phanek || '-';
            html += `<tr class="swal-car-row" data-dept="${dept}"><td style="padding:10px; border-bottom:1px solid #e5e7eb; font-weight:600; color:var(--warning);">${item.plate}<br><span style="font-size:12px;color:var(--text-light);font-weight:normal;">ไป: ${item.location}</span></td><td style="padding:10px; border-bottom:1px solid #e5e7eb;">${dept}<br><span style="font-size:12px;color:var(--text-light);">${cInfo.sangkat || '-'}</span></td><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><span style="background:#FEF3C7; color:#D97706; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600;"><i class="fas fa-user"></i> ${item.empName}</span></td></tr>`;
        }
    });
    
    html += '</tbody></table></div></div>';
    Swal.fire({ title: title, html: html, width: '800px', showConfirmButton: true, confirmButtonText: 'ปิดหน้าต่าง', confirmButtonColor: '#6B7280' });
}

// ==========================================
// ไฟล์: js/dashboard.js (อัปเดตส่วนปุ่มคืนรถ)
// ==========================================

async function renderMainDashboard(container) {
    const user = JSON.parse(localStorage.getItem('user_session')); 
    container.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x text-primary"></i><br>กำลังโหลดภาพรวม...</div>`;
    
    try { 
        const res = await apiCall({ action: 'get_active_uses' }); 
        if(res.status === 'success') activeUsesList = res.data; 
    } catch(e) { 
        activeUsesList = []; 
    }
    
    const totalCars = currentCarsList.length; 
    const inUse = activeUsesList.length; 
    const available = totalCars - inUse;
    const myActiveCars = activeUsesList.filter(u => u.empName === user.name); 
    
    let myTaskHtml = '';
    if (myActiveCars.length > 0) {
        myTaskHtml = `<h3 style="margin-bottom: 15px; font-size: 18px;"><i class="fas fa-bell text-warning"></i> รายการที่รอส่งคืน</h3><div class="card-grid" style="margin-top:0;">`;
        myActiveCars.forEach(u => { 
            // 🔴 เปลี่ยน onclick ให้เรียกฟังก์ชัน openReturnModal โดยตรง
            myTaskHtml += `
                <div class="use-card" style="border-left: 4px solid var(--warning);">
                    <div class="use-card-header"><div class="use-card-plate">${u.plate}</div></div>
                    <div class="use-card-detail"><strong>สถานที่:</strong> ${u.location}</div>
                    <button class="btn btn-warning" style="width:100%; margin-top:10px;" onclick="openReturnModal('${u.useId}', '${u.plate}', '${u.startMile}')">
                        ดำเนินการคืนรถ
                    </button>
                </div>`; 
        }); 
        myTaskHtml += `</div>`;
    } else { 
        myTaskHtml = `<p style="color: var(--text-light);"><i class="fas fa-check-circle text-success"></i> ยอดเยี่ยม! คุณไม่มีรายการยืมรถค้างอยู่</p>`; 
    }

    container.innerHTML = `
        <div style="background: linear-gradient(135deg, var(--primary), #818CF8); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 10px rgba(99,102,241,0.2);">
            <h1 style="font-size: 26px; font-weight: 600; margin-bottom: 8px;">สวัสดี, คุณ${user.name}! 👋</h1>
            <p style="margin: 0; opacity: 0.9;"><i class="fas fa-building"></i> สังกัด: ${user.department} &nbsp;|&nbsp; <i class="fas fa-id-badge"></i> สิทธิ์: ${user.role}</p>
        </div>
        <h3 style="margin-bottom: 15px; font-size: 18px; color: var(--text);"><i class="fas fa-chart-pie"></i> สถานะรถยนต์วันนี้</h3>
        <div class="stat-grid">
            <div class="stat-card"><div class="stat-icon" style="background: var(--primary);"><i class="fas fa-car"></i></div><div class="stat-info"><h3>${totalCars}</h3><p>รถทั้งหมดในระบบ</p></div></div>
            <div class="stat-card clickable success" onclick="showCarStatusDetails('available')"><div class="stat-icon" style="background: var(--success);"><i class="fas fa-check"></i></div><div class="stat-info"><h3>${available}</h3><p>พร้อมใช้งาน (คลิกดู)</p></div></div>
            <div class="stat-card clickable warning" onclick="showCarStatusDetails('inuse')"><div class="stat-icon" style="background: var(--warning);"><i class="fas fa-route"></i></div><div class="stat-info"><h3>${inUse}</h3><p>กำลังใช้งาน (คลิกดู)</p></div></div>
        </div>
        <h3 style="margin-bottom: 15px; font-size: 18px; color: var(--text);"><i class="fas fa-bolt"></i> เมนูด่วน</h3>
        
        <div class="quick-actions">
            <div class="action-card" onclick="loadPage('use', document.querySelectorAll('.menu-item')[2])"><i class="fas fa-key"></i><span>ขอใช้งานรถ</span></div>
            <div class="action-card" onclick="loadPage('check', document.querySelectorAll('.menu-item')[1])"><i class="fas fa-clipboard-check" style="color: var(--success);"></i><span>เช็คสภาพ</span></div>
            <div class="action-card" onclick="loadPage('fuel', document.querySelectorAll('.menu-item')[4])"><i class="fas fa-gas-pump" style="color: var(--danger);"></i><span>เติมน้ำมัน</span></div>
            
            <div class="action-card" onclick="loadPage('utility', document.querySelectorAll('.menu-item')[6] || null)"><i class="fas fa-briefcase" style="color: #8B5CF6;"></i><span>อรรถประโยชน์</span></div>
        </div>

        <div class="form-box" style="margin-top: 0; padding: 20px;">${myTaskHtml}</div>
    `;
}