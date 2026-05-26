// ==========================================
// ไฟล์: js/admin-car.js
// หน้าที่: จัดการฐานข้อมูลรถยนต์ และระบบแจ้งเตือนต่อภาษี (เฉพาะ Admin)
// ==========================================

function renderAdminCarPage(container) { 
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title"><i class="fas fa-database text-primary"></i> ฐานข้อมูลรถยนต์</h2>
            <button class="btn" onclick="openCarModal('add')"><i class="fas fa-plus"></i> เพิ่มรถใหม่</button>
        </div>
        <div class="form-box" style="margin-bottom: 20px; padding: 15px;">
            <div style="display:flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px;">
                <div style="flex:1; background:#F3F4F6; padding:10px; border-radius:8px; text-align:center;"><div style="font-size:12px; color:var(--text-light);">รถทั้งหมด</div><div style="font-size:20px; font-weight:bold; color:var(--text);" id="admin-stat-total">0</div></div>
                <div style="flex:1; background:#D1FAE5; padding:10px; border-radius:8px; text-align:center;"><div style="font-size:12px; color:#065F46;">ปกติ</div><div style="font-size:20px; font-weight:bold; color:#065F46;" id="admin-stat-normal">0</div></div>
                <div style="flex:1; background:#FEF3C7; padding:10px; border-radius:8px; text-align:center;"><div style="font-size:12px; color:#D97706;">ใกล้หมดอายุ (≤90วัน)</div><div style="font-size:20px; font-weight:bold; color:#D97706;" id="admin-stat-warning">0</div></div>
                <div style="flex:1; background:#FEE2E2; padding:10px; border-radius:8px; text-align:center;"><div style="font-size:12px; color:#DC2626;">หมดอายุแล้ว</div><div style="font-size:20px; font-weight:bold; color:#DC2626;" id="admin-stat-danger">0</div></div>
            </div>
            <div class="flex-row">
                <div class="input-group flex-col" style="margin-bottom:0;"><label>กรองตามสังกัด</label><select id="admin-filter-sangkat" onchange="filterAdminCarTable()"><option value="all">- แสดงทุกสังกัด -</option></select></div>
                <div class="input-group flex-col" style="margin-bottom:0;">
                    <label>สถานะภาษี</label>
                    <select id="admin-filter-tax" onchange="filterAdminCarTable()">
                        <option value="all">- ทุกสถานะ -</option>
                        <option value="normal">ปกติ (เหลือ > 90 วัน)</option>
                        <option value="warning">ใกล้หมดอายุ (เหลือ ≤ 90 วัน)</option>
                        <option value="danger">หมดอายุแล้ว</option>
                    </select>
                </div>
            </div>
        </div>
        <div id="car-table-loader" style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
        <div class="table-container hidden" id="car-table-wrapper">
            <table>
                <thead>
                    <tr><th>สังกัด/แผนก</th><th>ทะเบียนรถ</th><th>ยี่ห้อ/ประเภท</th><th>วันต่อภาษี/สถานะ</th><th style="text-align:center; min-width: 120px;">จัดการ</th></tr>
                </thead>
                <tbody id="admin-table-body"></tbody>
            </table>
        </div>`; 
        
    fetchCarsData().then(() => { 
        const selectSangkat = document.getElementById('admin-filter-sangkat'); 
        [...new Set(currentCarsList.map(c => c.sangkat))].filter(s => s).forEach(s => selectSangkat.add(new Option(s, s))); 
        filterAdminCarTable();
    }); 
}

function filterAdminCarTable() {
    const filterSangkat = document.getElementById('admin-filter-sangkat').value; 
    const filterTax = document.getElementById('admin-filter-tax').value;
    let filteredList = currentCarsList; 
    const now = new Date();
    
    if(filterSangkat !== 'all') { 
        filteredList = filteredList.filter(c => c.sangkat === filterSangkat); 
    }
    if(filterTax !== 'all') {
        filteredList = filteredList.filter(car => {
            if (!car.taxDate) return false;
            let tDate = new Date(car.taxDate); 
            if (isNaN(tDate)) { 
                const parts = car.taxDate.toString().split('/'); 
                if (parts.length === 3) tDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); 
            }
            if (isNaN(tDate)) return false;
            
            const diffTime = tDate - now; 
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (filterTax === 'danger') return diffDays < 0; 
            if (filterTax === 'warning') return diffDays >= 0 && diffDays <= 90; 
            if (filterTax === 'normal') return diffDays > 90;
            return true;
        });
    }

    document.getElementById('car-table-loader').classList.add('hidden'); 
    document.getElementById('car-table-wrapper').classList.remove('hidden'); 
    const tbody = document.getElementById('admin-table-body'); 
    
    let statTotal = filteredList.length; 
    let statNormal = 0; let statWarning = 0; let statDanger = 0;
    
    if(filteredList.length === 0) { 
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">ไม่มีข้อมูล</td></tr>`; 
    } else {
        tbody.innerHTML = ''; 
        filteredList.forEach(car => { 
            let taxBadge = '-'; let formattedTaxDate = '-';
            if (car.taxDate) {
                let tDate = new Date(car.taxDate); 
                if (isNaN(tDate)) { 
                    const parts = car.taxDate.toString().split('/'); 
                    if (parts.length === 3) tDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); 
                }
                if (!isNaN(tDate)) {
                    formattedTaxDate = `${tDate.getDate().toString().padStart(2,'0')}/${(tDate.getMonth()+1).toString().padStart(2,'0')}/${tDate.getFullYear()}`;
                    const diffTime = tDate - now; 
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays < 0) { 
                        statDanger++; 
                        taxBadge = `<br><span style="background:#FEE2E2; color:#DC2626; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600; display:inline-block; margin-top:4px;"><i class="fas fa-times-circle"></i> หมดอายุแล้ว</span>`; 
                    } else if (diffDays <= 90) { 
                        statWarning++; 
                        taxBadge = `<br><span style="background:#FEF3C7; color:#D97706; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600; display:inline-block; margin-top:4px;"><i class="fas fa-exclamation-triangle"></i> เหลือ ${diffDays} วัน</span>`; 
                    } else { 
                        statNormal++; 
                        taxBadge = `<br><span style="background:#D1FAE5; color:#065F46; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600; display:inline-block; margin-top:4px;"><i class="fas fa-check-circle"></i> ปกติ</span>`; 
                    }
                }
            }
            // 🔴 เพิ่มปุ่มต่อภาษีด่วน (สีเขียว) ไว้ตรงส่วนการจัดการ
            tbody.innerHTML += `
                <tr>
                    <td><b>${car.sangkat}</b><br><span style="font-size:12px; color:var(--text-light);">${car.phanek}</span></td>
                    <td style="font-weight: 500;">${car.plate}</td>
                    <td>${car.brand}<br><span style="font-size:12px; color:var(--text-light);">${car.type}</span></td>
                    <td><span style="font-weight:500;">${formattedTaxDate}</span>${taxBadge}</td>
                    <td style="text-align:center;">
                        <button class="btn btn-success btn-sm" style="padding: 6px 10px; margin-bottom: 4px;" onclick="renewCarTax('${car.id}')" title="ต่อภาษีด่วน"><i class="fas fa-calendar-plus"></i></button> 
                        <button class="btn btn-warning btn-sm" style="padding: 6px 10px; margin-bottom: 4px;" onclick="openCarModal('edit', '${car.id}')" title="แก้ไขข้อมูล"><i class="fas fa-edit"></i></button> 
                        <button class="btn btn-danger btn-sm" style="padding: 6px 10px; margin-bottom: 4px;" onclick="deleteCar('${car.id}')" title="ลบรถ"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`; 
        });
    }
    document.getElementById('admin-stat-total').innerText = statTotal; 
    document.getElementById('admin-stat-normal').innerText = statNormal; 
    document.getElementById('admin-stat-warning').innerText = statWarning; 
    document.getElementById('admin-stat-danger').innerText = statDanger;
}

// 🔴 ฟังก์ชันใหม่ สำหรับแสดงหน้าต่างต่อภาษีด่วน
function renewCarTax(id) {
    const car = currentCarsList.find(c => c.id === id);
    if (!car) return;

    // ดึงค่าวันที่เดิมมาตั้งเป็นค่าเริ่มต้น
    let defaultDate = '';
    if (car.taxDate) {
        let dt = new Date(car.taxDate);
        if (isNaN(dt)) {
            const parts = car.taxDate.toString().split('/');
            if (parts.length === 3) dt = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        if (!isNaN(dt)) {
            defaultDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
        }
    }

    Swal.fire({
        title: `อัปเดตภาษีรถ <span style="color:var(--primary);">${car.plate}</span>`,
        html: `กรุณาเลือก <b>วันครบกำหนดต่อภาษีรอบใหม่</b><br><br><input type="date" id="renew-tax-date" class="swal2-input" value="${defaultDate}" style="max-width: 90%;">`,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-save"></i> บันทึกข้อมูล',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#10B981',
        preConfirm: () => {
            const newDate = document.getElementById('renew-tax-date').value;
            if (!newDate) {
                Swal.showValidationMessage('กรุณาเลือกวันที่ก่อนบันทึก');
            }
            return newDate;
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const newTaxDate = result.value;
            
            // เรียกใช้ API แบบเดียวกับการแก้ไขรถ (edit_car) แต่เปลี่ยนแค่วันที่
            const payload = {
                action: 'edit_car',
                id: car.id,
                sangkat: car.sangkat,
                phanek: car.phanek,
                plate: car.plate,
                brand: car.brand,
                type: car.type,
                taxDate: newTaxDate
            };

            Swal.fire({
                title: 'กำลังบันทึกข้อมูล...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                const res = await apiCall(payload);
                if (res.status === 'success') {
                    Swal.fire({
                        title: 'สำเร็จ!',
                        text: 'อัปเดตวันต่อภาษีเรียบร้อยแล้ว',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    await fetchCarsData(); // โหลดข้อมูลรถใหม่
                    filterAdminCarTable(); // รีเฟรชตาราง
                } else {
                    Swal.fire('ผิดพลาด', res.message, 'error');
                }
            } catch (e) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
            }
        }
    });
}

function openCarModal(mode, id = null) { 
    document.getElementById('carModal').style.display = 'flex'; 
    if(mode === 'add') { 
        document.getElementById('modalTitle').innerText = 'เพิ่มรถใหม่'; 
        document.getElementById('carId').value = ''; 
        ['carSangkat','carPhanek','carPlate','carBrand','carType','carTaxDate'].forEach(el => document.getElementById(el).value = ''); 
    } else if (id) { 
        document.getElementById('modalTitle').innerText = 'แก้ไขรถ'; 
        const car = currentCarsList.find(c => c.id === id); 
        if(car) { 
            document.getElementById('carId').value = car.id; 
            document.getElementById('carSangkat').value = car.sangkat; 
            document.getElementById('carPhanek').value = car.phanek; 
            document.getElementById('carPlate').value = car.plate; 
            document.getElementById('carBrand').value = car.brand; 
            document.getElementById('carType').value = car.type; 
            let tText = '';
            if (car.taxDate) {
                let dt = new Date(car.taxDate);
                if (isNaN(dt)) { 
                    const parts = car.taxDate.toString().split('/'); 
                    if (parts.length === 3) dt = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); 
                }
                if (!isNaN(dt)) { 
                    tText = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; 
                }
            }
            document.getElementById('carTaxDate').value = tText;
        } 
    } 
}

async function saveCar() { 
    const id = document.getElementById('carId').value; 
    const payload = { 
        action: id ? 'edit_car' : 'add_car', 
        id: id, 
        sangkat: document.getElementById('carSangkat').value, 
        phanek: document.getElementById('carPhanek').value, 
        plate: document.getElementById('carPlate').value, 
        brand: document.getElementById('carBrand').value, 
        type: document.getElementById('carType').value, 
        taxDate: document.getElementById('carTaxDate').value 
    }; 
    
    document.getElementById('saveCarBtn').disabled = true; 
    try { 
        const res = await apiCall(payload); 
        if(res.status === 'success') { 
            Swal.fire('สำเร็จ', res.message, 'success'); 
            document.getElementById('carModal').style.display = 'none'; 
            await fetchCarsData(); 
            loadPage('car-settings'); 
        } 
    } catch(e) {} finally { 
        document.getElementById('saveCarBtn').disabled = false; 
    } 
}

function deleteCar(id) { 
    Swal.fire({ 
        title: 'ลบข้อมูล?', 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonColor: '#EF4444', 
        confirmButtonText: 'ลบเลย!' 
    }).then(async (result) => { 
        if (result.isConfirmed) { 
            try { 
                const res = await apiCall({ action: 'delete_car', id: id }); 
                if(res.status === 'success') { 
                    Swal.fire('ลบแล้ว', '', 'success'); 
                    await fetchCarsData(); 
                    loadPage('car-settings'); 
                } 
            } catch(e) {} 
        } 
    }); 
}