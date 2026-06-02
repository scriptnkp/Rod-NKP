// ==========================================
// ไฟล์: js/fuel.js
// หน้าที่: จัดการระบบบันทึกประวัติ แก้ไขการเติมน้ำมัน และแสดงสถิติ
// ==========================================

async function renderFuelDashboard(container) {
    container.innerHTML = `
        <div class="page-title" style="color: var(--danger);"><i class="fas fa-gas-pump"></i> ประวัติการเติมน้ำมัน</div>
        
        <div style="display:flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="flex:1; min-width: 150px; background:#EFF6FF; padding:15px; border-radius:8px; border: 1px solid #BFDBFE;">
                <div style="font-size:13px; color:#1D4ED8; font-weight:600;"><i class="fas fa-credit-card"></i> เครดิต</div>
                <div style="font-size:22px; font-weight:bold; color:#1E3A8A; margin-top:4px;" id="stat-fuel-credit">0 <span style="font-size:12px; font-weight:normal;">รายการ</span></div>
                <div style="font-size:15px; color:#2563EB; font-weight:600; margin-top:2px;" id="stat-fuel-credit-amt">฿0.00</div>
            </div>
            <div style="flex:1; min-width: 150px; background:#F5F3FF; padding:15px; border-radius:8px; border: 1px solid #DDD6FE;">
                <div style="font-size:13px; color:#6D28D9; font-weight:600;"><i class="fas fa-id-card"></i> ฟลีทการ์ด</div>
                <div style="font-size:22px; font-weight:bold; color:#4C1D95; margin-top:4px;" id="stat-fuel-freecard">0 <span style="font-size:12px; font-weight:normal;">รายการ</span></div>
                <div style="font-size:15px; color:#7C3AED; font-weight:600; margin-top:2px;" id="stat-fuel-freecard-amt">฿0.00</div>
            </div>
            <div style="flex:1; min-width: 150px; background:#ECFEFF; padding:15px; border-radius:8px; border: 1px solid #A5F3FC;">
                <div style="font-size:13px; color:#0891B2; font-weight:600;"><i class="fas fa-plug"></i> อัดประจุ EV</div>
                <div style="font-size:22px; font-weight:bold; color:#164E63; margin-top:4px;" id="stat-fuel-ev">0 <span style="font-size:12px; font-weight:normal;">รายการ</span></div>
                <div style="font-size:15px; color:#0E7490; font-weight:600; margin-top:2px;" id="stat-fuel-ev-amt">฿0.00</div>
            </div>
            <div style="flex:1; min-width: 150px; background:#ECFDF5; padding:15px; border-radius:8px; border: 1px solid #A7F3D0;">
                <div style="font-size:13px; color:#047857; font-weight:600;"><i class="fas fa-check-circle"></i> ตั้งหนี้แล้ว</div>
                <div style="font-size:22px; font-weight:bold; color:#064E3B; margin-top:4px;" id="stat-fuel-debt-done">0 <span style="font-size:12px; font-weight:normal;">รายการ</span></div>
                <div style="font-size:15px; color:#059669; font-weight:600; margin-top:2px;" id="stat-fuel-debt-done-amt">฿0.00</div>
            </div>
            <div style="flex:1; min-width: 150px; background:#FFFBEB; padding:15px; border-radius:8px; border: 1px solid #FDE68A;">
                <div style="font-size:13px; color:#B45309; font-weight:600;"><i class="fas fa-hourglass-half"></i> ยังไม่ได้ตั้งหนี้</div>
                <div style="font-size:22px; font-weight:bold; color:#78350F; margin-top:4px;" id="stat-fuel-debt-pending">0 <span style="font-size:12px; font-weight:normal;">รายการ</span></div>
                <div style="font-size:15px; color:#D97706; font-weight:600; margin-top:2px;" id="stat-fuel-debt-pending-amt">฿0.00</div>
            </div>
        </div>

        <div class="form-box" style="margin-bottom: 20px; margin-top: 0;">
            <div class="flex-row">
                <div class="input-group flex-col">
                    <select id="filter-fuel-time" onchange="filterFuelTable()">
                        <option value="month" selected>📌 เฉพาะเดือนปัจจุบัน</option>
                        <option value="week">📅 7 วันล่าสุด</option>
                        <option value="all">📂 ดูทั้งหมด</option>
                    </select>
                </div>
                <div class="input-group flex-col"><select id="filter-fuel-debt" onchange="filterFuelTable()"><option value="all" selected>- ทุกสถานะตั้งหนี้ -</option><option value="pending">⏳ ยังไม่ตั้งหนี้</option><option value="completed">✅ ตั้งหนี้แล้ว</option></select></div>
                <div class="input-group flex-col"><select id="filter-fuel-paytype" onchange="filterFuelTable()"><option value="all" selected>- ทุกประเภทจ่าย -</option><option value="เครดิต">เครดิต</option><option value="ฟลีทการ์ด">ฟลีทการ์ด</option><option value="อัดประจุ EV">อัดประจุ EV</option></select></div>
                <div class="input-group flex-col"><select id="filter-fuel-sangkat" onchange="updateFilterFuelPhanek()"><option value="">- ทุกสังกัด -</option></select></div>
                <div class="input-group flex-col"><select id="filter-fuel-phanek" onchange="updateFilterFuelPlate()"><option value="">- ทุกแผนก -</option></select></div>
                <div class="input-group flex-col"><select id="filter-fuel-plate" onchange="filterFuelTable()"><option value="">- ทุกทะเบียน -</option></select></div>
                <div class="input-group flex-col"><button class="btn btn-danger" style="width: 100%; height: 44px;" onclick="openFuelModal('add')"><i class="fas fa-plus"></i> เพิ่มรายการ</button></div>
            </div>
        </div>
        <div id="fuel-table-loader" style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
        <div class="table-container hidden" id="fuel-table-wrapper">
            <table style="width: 100%; min-width: 950px;">
                <thead><tr><th style="width: 12%;">วันที่</th><th style="width: 18%;">ผู้เติม/สังกัด</th><th style="width: 12%;">รถยนต์</th><th style="width: 25%;">รายละเอียดการเติม</th><th style="width: 15%;">โครงข่าย/WBS/ศูนย์ต้นทุน</th><th style="width: 10%; text-align:center;">เอกสาร</th><th style="width: 8%; text-align:center;">จัดการ</th></tr></thead>
                <tbody id="fuel-table-body"></tbody>
            </table>
            <div id="fuel-pagination" class="pagination"></div>
        </div>`;
        
    const selectSangkat = document.getElementById('filter-fuel-sangkat'); 
    [...new Set(currentCarsList.map(c => c.sangkat))].forEach(s => selectSangkat.add(new Option(s, s))); 
    const selectPhanek = document.getElementById('filter-fuel-phanek'); 
    [...new Set(currentCarsList.map(c => c.phanek))].forEach(p => selectPhanek.add(new Option(p, p))); 
    
    // 🔴 แก้ไข Dropdown ทะเบียนให้โชว์ภาษี
    const selectPlate = document.getElementById('filter-fuel-plate'); 
    [...new Set(currentCarsList.map(c => c.plate))].forEach(pl => {
        const car = currentCarsList.find(c => c.plate === pl);
        const displayPlate = (car && car.taxType) ? `${pl} (${car.taxType})` : pl;
        selectPlate.add(new Option(displayPlate, pl));
    }); 
    
    await fetchFuelsData(); 
    
    const timeFilter = document.getElementById('filter-fuel-time');
    const monthNamesTH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const uniqueMonths = new Set();
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    currentFuelsList.forEach(f => {
        if(f.date) {
            let d = new Date(f.date); 
            if(isNaN(d)) { 
                const parts = f.date.split(' ')[0].split('/'); 
                if(parts.length===3) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); 
            }
            if(!isNaN(d)) {
                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (monthKey !== currentMonthKey) {
                    uniqueMonths.add(monthKey);
                }
            }
        }
    });

    const sortedMonths = Array.from(uniqueMonths).sort().reverse();
    const allOption = timeFilter.querySelector('option[value="all"]');
    
    sortedMonths.forEach(m => {
        const [year, month] = m.split('-');
        const monthText = `🗓️ ${monthNamesTH[parseInt(month)-1]} ${parseInt(year)+543}`;
        const newOption = new Option(monthText, m);
        timeFilter.insertBefore(newOption, allOption);
    });

    filterFuelTable(); 
}

function updateFilterFuelPhanek() { 
    const s = document.getElementById('filter-fuel-sangkat').value; 
    const selectP = document.getElementById('filter-fuel-phanek'); 
    const selectPl = document.getElementById('filter-fuel-plate'); 
    selectP.innerHTML = '<option value="">- ทุกแผนก -</option>'; 
    selectPl.innerHTML = '<option value="">- ทุกทะเบียน -</option>'; 
    let filtered = currentCarsList; 
    if(s) filtered = filtered.filter(c => c.sangkat === s); 
    [...new Set(filtered.map(c => c.phanek))].forEach(p => selectP.add(new Option(p, p))); 
    
    // 🔴 แก้ไขโชว์ภาษี
    [...new Set(filtered.map(c => c.plate))].forEach(pl => {
        const car = currentCarsList.find(c => c.plate === pl);
        const displayPlate = (car && car.taxType) ? `${pl} (${car.taxType})` : pl;
        selectPl.add(new Option(displayPlate, pl));
    }); 
    filterFuelTable(); 
}

function updateFilterFuelPlate() { 
    const s = document.getElementById('filter-fuel-sangkat').value; 
    const p = document.getElementById('filter-fuel-phanek').value; 
    const selectPl = document.getElementById('filter-fuel-plate'); 
    selectPl.innerHTML = '<option value="">- ทุกทะเบียน -</option>'; 
    let filtered = currentCarsList; 
    if(s) filtered = filtered.filter(c => c.sangkat === s); 
    if(p) filtered = filtered.filter(c => c.phanek === p); 
    
    // 🔴 แก้ไขโชว์ภาษี
    [...new Set(filtered.map(c => c.plate))].forEach(pl => {
        const car = currentCarsList.find(c => c.plate === pl);
        const displayPlate = (car && car.taxType) ? `${pl} (${car.taxType})` : pl;
        selectPl.add(new Option(displayPlate, pl));
    }); 
    filterFuelTable(); 
}
        
function filterFuelTable() {
    const sEl = document.getElementById('filter-fuel-sangkat'); const pEl = document.getElementById('filter-fuel-phanek'); const plEl = document.getElementById('filter-fuel-plate'); const tEl = document.getElementById('filter-fuel-time'); const dEl = document.getElementById('filter-fuel-debt'); const ptEl = document.getElementById('filter-fuel-paytype'); 
    if(!sEl || !pEl || !plEl || !tEl || !dEl || !ptEl) return;
    
    const timeFilter = tEl.value; const debtFilter = dEl.value; const sangkat = sEl.value; const phanek = pEl.value; const plate = plEl.value; const payTypeFilter = ptEl.value; const now = new Date();
    
    currentFilteredFuels = currentFuelsList.filter(f => {
        let dateMatch = true; 
        if(f.date) { 
            let d = new Date(f.date); 
            if(isNaN(d)) { const parts = f.date.split(' ')[0].split('/'); if(parts.length===3) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); } 
            if(!isNaN(d)) { 
                if (timeFilter === 'month') { 
                    dateMatch = (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()); 
                } else if (timeFilter === 'week') { 
                    const diffDays = (now - d) / (1000 * 60 * 60 * 24); 
                    dateMatch = diffDays <= 7 && diffDays >= 0; 
                } else if (timeFilter !== 'all') { 
                    const filterParts = timeFilter.split('-');
                    if (filterParts.length === 2) {
                        dateMatch = (d.getFullYear() === parseInt(filterParts[0]) && (d.getMonth() + 1) === parseInt(filterParts[1]));
                    }
                } 
            } 
        }
        let debtMatch = true; if (debtFilter === 'pending') debtMatch = !f.isDebt; else if (debtFilter === 'completed') debtMatch = f.isDebt;
        let payTypeMatch = true; if (payTypeFilter !== 'all') payTypeMatch = f.payType === payTypeFilter;
        return dateMatch && debtMatch && payTypeMatch && (!sangkat || f.sangkat === sangkat) && (!phanek || f.phanek === phanek) && (!plate || f.plate === plate);
    });

    let countCredit = 0, amtCredit = 0;
    let countFreecard = 0, amtFreecard = 0;
    let countEV = 0, amtEV = 0; 
    let countDebtDone = 0, amtDebtDone = 0;
    let countDebtPending = 0, amtDebtPending = 0;

    currentFilteredFuels.forEach(f => {
        const amt = parseFloat(f.totalAmount) || 0;
        if(f.payType === 'เครดิต') { countCredit++; amtCredit += amt; } 
        else if(f.payType === 'ฟลีทการ์ด') { countFreecard++; amtFreecard += amt; }
        else if(f.payType === 'อัดประจุ EV') { countEV++; amtEV += amt; } 

        if(f.isDebt) { countDebtDone++; amtDebtDone += amt; } 
        else { countDebtPending++; amtDebtPending += amt; }
    });

    if(document.getElementById('stat-fuel-credit')) {
        document.getElementById('stat-fuel-credit').innerHTML = `${countCredit} <span style="font-size:12px; font-weight:normal;">รายการ</span>`;
        document.getElementById('stat-fuel-credit-amt').innerText = `฿${amtCredit.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('stat-fuel-freecard').innerHTML = `${countFreecard} <span style="font-size:12px; font-weight:normal;">รายการ</span>`;
        document.getElementById('stat-fuel-freecard-amt').innerText = `฿${amtFreecard.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        document.getElementById('stat-fuel-ev').innerHTML = `${countEV} <span style="font-size:12px; font-weight:normal;">รายการ</span>`;
        document.getElementById('stat-fuel-ev-amt').innerText = `฿${amtEV.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        document.getElementById('stat-fuel-debt-done').innerHTML = `${countDebtDone} <span style="font-size:12px; font-weight:normal;">รายการ</span>`;
        document.getElementById('stat-fuel-debt-done-amt').innerText = `฿${amtDebtDone.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('stat-fuel-debt-pending').innerHTML = `${countDebtPending} <span style="font-size:12px; font-weight:normal;">รายการ</span>`;
        document.getElementById('stat-fuel-debt-pending-amt').innerText = `฿${amtDebtPending.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    
    const loader = document.getElementById('fuel-table-loader'); 
    const wrapper = document.getElementById('fuel-table-wrapper'); 
    if (loader) loader.classList.add('hidden'); 
    if (wrapper) wrapper.classList.remove('hidden'); 
    renderFuelTablePage(1);
}

function renderFuelTablePage(page) {
    const user = JSON.parse(localStorage.getItem('user_session')); 
    currentFuelPage = page; 
    const tbody = document.getElementById('fuel-table-body'); 
    const paginationDiv = document.getElementById('fuel-pagination'); 
    if (!tbody) return; 
    tbody.innerHTML = ''; 
    paginationDiv.innerHTML = '';
    
    if(currentFilteredFuels.length === 0) { 
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">ไม่มีข้อมูลประวัติการเติมน้ำมัน</td></tr>`; 
        return; 
    }
    
    const start = (page - 1) * FUEL_ITEMS_PER_PAGE; 
    const end = start + FUEL_ITEMS_PER_PAGE; 
    const pageData = currentFilteredFuels.slice(start, end);

    pageData.forEach(f => {
        const formattedDate = formatDisplayDate(f.date); 
        let debtBadge = `<span class="badge-nodebt">ยังไม่ตั้งหนี้</span>`;
        
        if(f.isDebt) { 
            debtBadge = `<span class="badge-debt"><i class="fas fa-check-circle"></i> ตั้งหนี้แล้ว</span>`; 
            if(f.debtNo && f.debtNo.toString().trim() !== '' && f.debtNo !== '-') { 
                debtBadge += `<br><span style="font-size:12.5px; color:#065F46; font-weight:700; display:inline-block; margin-top:4px; background:#A7F3D0; padding:3px 8px; border-radius:6px; letter-spacing: 0.5px;">${f.debtNo}</span>`; 
            } 
        }
        
        let pTypeBadge = f.payType ? `<br><span class="badge-paytype"><i class="fas fa-wallet"></i> ${f.payType}</span>` : '';
        
        let docHtml = ''; 
        if(f.receiptUrl) docHtml += `<a href="${f.receiptUrl}" target="_blank" class="btn btn-outline btn-sm" style="margin-bottom:4px; padding: 4px 8px; width: 100%;"><i class="fas fa-image"></i> บิล</a><br>`; 
        if(f.ypUrl) docHtml += `<a href="${f.ypUrl}" target="_blank" class="btn btn-outline btn-sm" style="padding: 4px 8px; width: 100%;"><i class="fas fa-image"></i> ยพ.</a>`; 
        if(!docHtml) docHtml = '-';
        
        let actionHtml = `<button class="btn btn-warning btn-sm" style="padding: 6px 10px;" onclick="openFuelModal('edit', '${f.id}')"><i class="fas fa-edit"></i></button> <button class="btn btn-danger btn-sm" style="padding: 6px 10px;" onclick="deleteFuel('${f.id}')"><i class="fas fa-trash"></i></button>`;
        
        if (user.role === 'Admin' || user.role === 'ผู้ช่วย Admin') {
            actionHtml = `<button class="btn btn-sm" style="background:#6366F1; color:white; margin-bottom: 4px; width: 100%;" onclick="openBudgetModal('${f.id}')"><i class="fas fa-sitemap"></i> ศูนย์ต้นทุน</button><br>` + actionHtml;
            if (!f.isDebt) { 
                actionHtml = `<button class="btn btn-success btn-sm" style="margin-bottom: 4px; width: 100%;" onclick="markDebt('${f.id}')"><i class="fas fa-check-circle"></i> ตั้งหนี้</button><br>` + actionHtml; 
            }
        }
        let budgetBadge = f.budget ? `<br><span class="badge-budget"><i class="fas fa-hashtag"></i> ศูนย์ต้นทุน: ${f.budget}</span>` : '';

        // 🔴 หาประเภทภาษีมาแสดงในตาราง
        const carObj = currentCarsList.find(c => c.plate === f.plate);
        const taxTypeBadge = (carObj && carObj.taxType) ? ` <span style="font-size:12px; color:var(--text-light);">(${carObj.taxType})</span>` : '';

        tbody.innerHTML += `<tr>
            <td style="color: var(--text-light);">${formattedDate}</td>
            <td><b>${f.empName}</b><br><span style="font-size:12px; color:var(--text-light);">${f.sangkat} - ${f.phanek}</span></td>
            <td><span style="font-weight: 500; color: var(--info);">${f.plate}${taxTypeBadge}</span><br>${debtBadge}${pTypeBadge}</td>
            <td><div style="line-height: 1.5;"><span style="color: var(--text);"><b>ปั๊ม:</b> ${f.station || '-'}</span><br><span style="font-size:13px; color:var(--text-light);">ใบกำกับภาษี: ${f.taxInvoice || '-'}</span><br><span style="font-size:13px; color:var(--text-light);">เลขที่ (ยพ.): ${f.docNo || '-'}</span><br><span style="font-weight: 600; color: var(--danger);">ยอดชำระ: ฿${f.totalAmount}</span></div></td>
            <td><div style="line-height: 1.5;"><span style="font-size:13px; color:var(--text-light);"><b>WBS:</b> ${f.wbs || '-'}</span><br><span style="font-size:13px; color:var(--text-light);"><b>โครงข่าย/ใบสั่ง:</b> ${f.network || '-'}</span>${budgetBadge}</div></td>
            <td style="text-align:center;">${docHtml}</td><td style="text-align:center;">${actionHtml}</td>
        </tr>`;
    });
    
    const totalPages = Math.ceil(currentFilteredFuels.length / FUEL_ITEMS_PER_PAGE); 
    if(totalPages > 1) { 
        for(let i = 1; i <= totalPages; i++) { 
            paginationDiv.innerHTML += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="renderFuelTablePage(${i})">${i}</button>`; 
        } 
    }
}

function openBudgetModal(id) { 
    const f = currentFuelsList.find(item => item.id === id); 
    document.getElementById('budget-fuel-id').value = id; 
    document.getElementById('budget-value').value = f ? (f.budget || '') : ''; 
    document.getElementById('budgetModal').style.display = 'flex'; 
}

async function submitBudget() {
    const id = document.getElementById('budget-fuel-id').value; 
    const budgetVal = document.getElementById('budget-value').value; 
    document.getElementById('submitBudgetBtn').disabled = true; 
    document.getElementById('submitBudgetBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> บันทึก...';
    try { 
        const res = await apiCall({ action: 'save_fuel_budget', id: id, budget: budgetVal }); 
        if(res.status === 'success') { 
            Swal.fire('สำเร็จ', 'อัปเดตศูนย์ต้นทุนเรียบร้อย', 'success'); 
            document.getElementById('budgetModal').style.display = 'none'; 
            await fetchFuelsData(); 
            filterFuelTable(); 
        } 
    } catch(e) {} finally { 
        document.getElementById('submitBudgetBtn').disabled = false; 
        document.getElementById('submitBudgetBtn').innerHTML = 'บันทึกข้อมูล'; 
    }
}

function markDebt(id) { 
    Swal.fire({ 
        title: 'ระบุเลขตั้งหนี้', 
        input: 'text', 
        inputPlaceholder: 'กรอกเลขตั้งหนี้ (ถ้ามี)', 
        showCancelButton: true, 
        confirmButtonColor: '#10B981', 
        confirmButtonText: 'บันทึกตั้งหนี้', 
        cancelButtonText: 'ยกเลิก' 
    }).then(async (result) => { 
        if (result.isConfirmed) { 
            const debtNo = result.value || '-'; 
            try { 
                const res = await apiCall({ action: 'mark_fuel_debt', id: id, debtNo: debtNo }); 
                if(res.status === 'success') { 
                    Swal.fire('สำเร็จ', '', 'success'); 
                    await fetchFuelsData(); 
                    filterFuelTable(); 
                } 
            } catch(e) {} 
        } 
    }); 
}

function openFuelModal(mode, id = null) {
    document.getElementById('fuelModal').style.display = 'flex'; 
    const user = JSON.parse(localStorage.getItem('user_session')); 
    const canManageDebt = (user.role === 'Admin' || user.role === 'ผู้ช่วย Admin');
    
    const selectSangkat = document.getElementById('fuel-sangkat'); 
    const uniqueSangkat = [...new Set(currentCarsList.map(c => c.sangkat))]; 
    selectSangkat.innerHTML = '<option value="">- เลือกสังกัด -</option>'; 
    uniqueSangkat.forEach(s => selectSangkat.add(new Option(s, s)));
    
    const now = new Date(); const y = now.getFullYear(); const m = String(now.getMonth() + 1).padStart(2, '0'); const d = String(now.getDate()).padStart(2, '0'); const todayStr = `${y}-${m}-${d}`;

    if(mode === 'add') {
        document.getElementById('fuelModalTitle').innerText = 'บันทึกข้อมูลเติมน้ำมัน'; 
        document.getElementById('fuel-id').value = ''; 
        document.getElementById('fuel-debt-container').style.display = 'none';
        ['fuel-sangkat','fuel-phanek','fuel-plate','fuel-brand','fuel-type','fuel-mile','fuel-type-oil','fuel-station','fuel-tax-invoice','fuel-price','fuel-quantity','fuel-total','fuel-book','fuel-no','fuel-network','fuel-wbs', 'fuel-pay-type', 'fuel-budget'].forEach(el => document.getElementById(el).value = '');
        document.getElementById('fuel-subtotal').innerText = '0.00'; 
        document.getElementById('fuel-vat').innerText = '0.00';
        document.getElementById('fuel-img-receipt').value = ''; 
        document.getElementById('fuel-img-yp').value = ''; 
        document.getElementById('fuel-is-debt').checked = false; 
        document.getElementById('req-receipt').innerHTML = '* บังคับ'; 
        document.getElementById('req-yp').innerHTML = '* บังคับ'; 
        document.getElementById('fuel-date').value = todayStr;
    } else if (id) {
        document.getElementById('fuelModalTitle').innerText = 'แก้ไขรายการเติมน้ำมัน'; 
        document.getElementById('fuel-debt-container').style.display = canManageDebt ? 'flex' : 'none';
        const f = currentFuelsList.find(item => item.id === id);
        
        if(f) {
            document.getElementById('fuel-id').value = f.id; 
            document.getElementById('fuel-is-debt').checked = f.isDebt; 
            document.getElementById('fuel-sangkat').value = f.sangkat; 
            updateFuelPhanek(); 
            document.getElementById('fuel-phanek').value = f.phanek; 
            updateFuelPlate(); 
            document.getElementById('fuel-plate').value = f.plate; 
            autoFillFuelCarDetails(); 
            document.getElementById('fuel-mile').value = f.mile; 
            document.getElementById('fuel-type-oil').value = f.fuelType; 
            document.getElementById('fuel-station').value = f.station || ''; 
            document.getElementById('fuel-tax-invoice').value = f.taxInvoice; 
            document.getElementById('fuel-price').value = f.price; 
            document.getElementById('fuel-quantity').value = f.quantity; 
            document.getElementById('fuel-total').value = f.totalAmount; 
            recalculateVatFromTotal(); 
            document.getElementById('fuel-book').value = f.bookNo; 
            document.getElementById('fuel-no').value = f.docNo; 
            document.getElementById('fuel-network').value = f.network; 
            document.getElementById('fuel-wbs').value = f.wbs; 
            document.getElementById('fuel-budget').value = f.budget || ''; 
            document.getElementById('fuel-img-receipt').value = ''; 
            document.getElementById('fuel-img-yp').value = ''; 
            document.getElementById('req-receipt').innerHTML = '(เลือกใหม่ถ้าต้องการเปลี่ยน)'; 
            document.getElementById('req-yp').innerHTML = '(เลือกใหม่ถ้าต้องการเปลี่ยน)'; 
            document.getElementById('fuel-pay-type').value = f.payType || '';
            
            let dText = ''; 
            if(f.date) { 
                let dt = new Date(f.date); 
                if(isNaN(dt)) { const p = f.date.split(' ')[0].split('/'); dt = new Date(`${p[2]}-${p[1]}-${p[0]}`); } 
                if(!isNaN(dt)) { dText = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; } 
            } 
            document.getElementById('fuel-date').value = dText;
        }
    }
}

function updateFuelPhanek() { 
    const val = document.getElementById('fuel-sangkat').value; 
    const select = document.getElementById('fuel-phanek'); 
    select.innerHTML = '<option value="">- เลือกแผนก -</option>'; 
    document.getElementById('fuel-plate').innerHTML = '<option value="">- เลือกทะเบียนรถ -</option>'; 
    document.getElementById('fuel-brand').value = ''; 
    document.getElementById('fuel-type').value = ''; 
    if(val) [...new Set(currentCarsList.filter(c => c.sangkat === val).map(c => c.phanek))].forEach(p => select.add(new Option(p, p))); 
}

function updateFuelPlate() { 
    const s = document.getElementById('fuel-sangkat').value; 
    const p = document.getElementById('fuel-phanek').value; 
    const select = document.getElementById('fuel-plate'); 
    select.innerHTML = '<option value="">- เลือกทะเบียนรถ -</option>'; 
    document.getElementById('fuel-brand').value = ''; 
    document.getElementById('fuel-type').value = ''; 
    if(p) currentCarsList.filter(c => c.sangkat === s && c.phanek === p).forEach(c => {
        // 🔴 แก้ไขโชว์ภาษีตอนเลือกทะเบียนรถเติมน้ำมัน
        const displayPlate = c.taxType ? `${c.plate} (${c.taxType})` : c.plate;
        select.add(new Option(displayPlate, c.plate));
    }); 
}

function autoFillFuelCarDetails() { 
    const plate = document.getElementById('fuel-plate').value; 
    const car = currentCarsList.find(c => c.plate === plate); 
    document.getElementById('fuel-brand').value = car ? car.brand : ''; 
    document.getElementById('fuel-type').value = car ? car.type : ''; 
}

function calculateFuel() { 
    const price = parseFloat(document.getElementById('fuel-price').value) || 0; 
    const qty = parseFloat(document.getElementById('fuel-quantity').value) || 0; 
    document.getElementById('fuel-total').value = (price * qty).toFixed(2); 
    recalculateVatFromTotal(); 
}

function recalculateVatFromTotal() { 
    const total = parseFloat(document.getElementById('fuel-total').value) || 0; 
    document.getElementById('fuel-subtotal').innerText = ((total * 100) / 107).toFixed(2); 
    document.getElementById('fuel-vat').innerText = ((total * 7) / 107).toFixed(2); 
}
        
async function submitFuel() { 
    const id = document.getElementById('fuel-id').value; 
    const fuelDate = document.getElementById('fuel-date').value; 
    const payType = document.getElementById('fuel-pay-type').value;
    const isDebt = document.getElementById('fuel-is-debt').checked; 
    const sangkat = document.getElementById('fuel-sangkat').value; 
    const phanek = document.getElementById('fuel-phanek').value; 
    const plate = document.getElementById('fuel-plate').value; 
    const brand = document.getElementById('fuel-brand').value; 
    const type = document.getElementById('fuel-type').value; 
    const mile = document.getElementById('fuel-mile').value; 
    const fuelType = document.getElementById('fuel-type-oil').value; 
    const station = document.getElementById('fuel-station').value; 
    const taxInvoice = document.getElementById('fuel-tax-invoice').value; 
    const price = document.getElementById('fuel-price').value; 
    const quantity = document.getElementById('fuel-quantity').value; 
    const totalAmount = document.getElementById('fuel-total').value; 
    const subtotal = document.getElementById('fuel-subtotal').innerText; 
    const vat = document.getElementById('fuel-vat').innerText; 
    const book = document.getElementById('fuel-book').value; 
    const docNo = document.getElementById('fuel-no').value; 
    const network = document.getElementById('fuel-network').value; 
    const wbs = document.getElementById('fuel-wbs').value; 
    const budget = document.getElementById('fuel-budget').value; 
    const receiptFile = document.getElementById('fuel-img-receipt').files[0]; 
    const ypFile = document.getElementById('fuel-img-yp').files[0]; 
    
    if (!fuelDate) return Swal.fire('แจ้งเตือน', 'กรุณาระบุวันที่เติมน้ำมัน', 'warning'); 
    if (!payType) return Swal.fire('แจ้งเตือน', 'กรุณาระบุประเภทการจ่ายเงิน', 'warning'); 
    if (!id && (!receiptFile || !ypFile)) return Swal.fire('แจ้งเตือน', 'กรุณาอัปโหลดเอกสารบิลและยพ.ให้ครบถ้วน', 'warning'); 
    if(!plate) return Swal.fire('แจ้งเตือน', 'กรุณาเลือกทะเบียนรถ', 'warning'); 
    
    // 🔴 หาประเภทภาษีมาแสดงในป๊อปอัปยืนยัน
    const selectedCarForTax = currentCarsList.find(c => c.plate === plate);
    const taxTypeStr = (selectedCarForTax && selectedCarForTax.taxType) ? ` (${selectedCarForTax.taxType})` : '';

    const confirmResult = await Swal.fire({ 
        title: 'ตรวจสอบข้อมูลก่อนบันทึก', 
        html: `<div style="text-align: left; font-size: 14px; background: #F9FAFB; padding: 15px; border-radius: 8px; max-height: 50vh; overflow-y: auto; border: 1px solid #E5E7EB;"><div style="margin-bottom: 10px; color: ${isDebt ? '#065F46' : '#6B7280'}; font-weight:bold; display: ${id ? 'block' : 'none'};"><i class="fas ${isDebt ? 'fa-check-circle' : 'fa-times-circle'}"></i> สถานะ: ${isDebt ? 'ตั้งหนี้แล้ว' : 'ยังไม่ตั้งหนี้'}</div><p style="margin-bottom: 5px;"><b>วันที่เติม:</b> ${fuelDate}</p><p style="margin-bottom: 5px;"><b>ประเภทจ่าย:</b> ${payType}</p><p style="margin-bottom: 5px;"><b>รถยนต์:</b> ${plate}${taxTypeStr} (${brand} ${type})</p><p style="margin-bottom: 5px;"><b>สังกัด/แผนก:</b> ${sangkat || '-'} / ${phanek || '-'}</p><p style="margin-bottom: 5px;"><b>เลขไมล์:</b> ${mile || '-'}</p><hr style="border-top: 1px dashed #E5E7EB; margin: 10px 0;"><p style="margin-bottom: 5px;"><b>สถานีบริการ:</b> ${station || '-'} (บิล: ${taxInvoice || '-'})</p><p style="margin-bottom: 5px;"><b>เล่มที่/เลขที่ (ยพ.):</b> ${book || '-'} / ${docNo || '-'}</p><p style="margin-bottom: 5px;"><b>เชื้อเพลิง:</b> ${fuelType || '-'}</p><p style="margin-bottom: 5px;"><b>ปริมาณ:</b> ${quantity || 0} ลิตร (ราคา ฿${price || 0}/ลิตร)</p><p style="margin-bottom: 5px;"><b>โครงข่าย/ใบสั่ง:</b> ${network || '-'}</p><p style="margin-bottom: 5px;"><b>WBS / ศูนย์ต้นทุน:</b> ${wbs || '-'} / ${budget || '-'}</p><hr style="border-top: 1px dashed #E5E7EB; margin: 10px 0;"><div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>มูลค่าสินค้า:</span> <span>฿${subtotal}</span></div><div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>VAT 7%:</span> <span>฿${vat}</span></div><div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 16px;"><b>ยอดชำระรวม:</b> <b style="color:var(--danger);">฿${totalAmount || '0.00'}</b></div></div>`, 
        icon: 'info', 
        showCancelButton: true, 
        confirmButtonColor: '#10B981', 
        cancelButtonColor: '#6B7280', 
        confirmButtonText: '<i class="fas fa-check"></i> ยืนยันการบันทึก', 
        cancelButtonText: 'กลับไปแก้ไข' 
    }); 
    if (!confirmResult.isConfirmed) return; 
    
    document.getElementById('submitFuelBtn').disabled = true; 
    document.getElementById('submitFuelBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบีบอัดภาพและบันทึก...'; 
    
    const receiptB64 = receiptFile ? await compressImage(receiptFile) : ''; 
    const ypB64 = ypFile ? await compressImage(ypFile) : ''; 
    const user = JSON.parse(localStorage.getItem('user_session')); 
    
    const payload = { 
        action: id ? 'edit_fuel' : 'add_fuel', 
        id: id, 
        fuelDate: fuelDate, 
        payType: payType, 
        empName: user.name, 
        sangkat: sangkat, 
        phanek: phanek, 
        plate: plate, 
        mile: mile, 
        fuelType: fuelType, 
        station: station, 
        taxInvoice: taxInvoice, 
        price: price, 
        quantity: quantity, 
        totalAmount: totalAmount, 
        bookNo: book, 
        docNo: docNo, 
        network: network, 
        wbs: wbs,
        budget: budget, 
        isDebt: isDebt, 
        receiptBase64: receiptB64, 
        receiptName: receiptFile ? receiptFile.name : '', 
        ypBase64: ypB64, 
        ypName: ypFile ? ypFile.name : '' 
    }; 
    
    try { 
        const res = await apiCall(payload); 
        if(res.status === 'success') { 
            Swal.fire('สำเร็จ', res.message, 'success'); 
            document.getElementById('fuelModal').style.display = 'none'; 
            await fetchFuelsData(); 
            filterFuelTable(); 
        } else { 
            Swal.fire('ผิดพลาด', res.message, 'error'); 
        } 
    } catch(e) {} finally { 
        document.getElementById('submitFuelBtn').disabled = false; 
        document.getElementById('submitFuelBtn').innerHTML = '<i class="fas fa-save"></i> บันทึกข้อมูล'; 
    } 
}

function deleteFuel(id) { 
    Swal.fire({ 
        title: 'ลบรายการ?', 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonColor: '#EF4444', 
        confirmButtonText: 'ลบเลย!' 
    }).then(async (result) => { 
        if (result.isConfirmed) { 
            try { 
                const res = await apiCall({ action: 'delete_fuel', id: id }); 
                if(res.status === 'success') { 
                    Swal.fire('ลบแล้ว', '', 'success'); 
                    await fetchFuelsData(); 
                    filterFuelTable(); 
                } 
            } catch(e) {} 
        } 
    }); 
}