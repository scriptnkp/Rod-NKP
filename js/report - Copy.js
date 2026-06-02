// ==========================================
// ไฟล์: js/report.js
// หน้าที่: จัดการเงื่อนไขการออกรายงานและระบบพิมพ์ (Print to PDF)
// ==========================================

async function renderReportPage(container) {
    if(currentFuelsList.length === 0) await fetchFuelsData();
    
    const now = new Date(); 
    const y = now.getFullYear(); 
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const firstDay = `${y}-${m}-01`; 
    const dLast = new Date(y, now.getMonth() + 1, 0).getDate(); 
    const lastDay = `${y}-${m}-${String(dLast).padStart(2, '0')}`;
    const monthNamesTH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
    const defaultThaiDate = `${now.getDate()} ${monthNamesTH[now.getMonth()]} ${y+543}`;

    container.innerHTML = `
        <div class="page-title" style="color: var(--success);"><i class="fas fa-print"></i> พิมพ์รายงาน / บันทึกข้อความ (PDF)</div>
        <div class="form-box">
            <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--primary); border-bottom: 2px solid var(--border); padding-bottom: 5px;"><i class="fas fa-filter"></i> เงื่อนไขการดึงรายงาน</h3>
            <div class="flex-row">
                <div class="input-group flex-col"><label>ตั้งแต่วันที่</label><input type="date" id="rep-start" style="padding: 14px; font-size: 15px;"></div>
                <div class="input-group flex-col"><label>ถึงวันที่</label><input type="date" id="rep-end" style="padding: 14px; font-size: 15px;"></div>
            </div>
            <div class="flex-row">
                <div class="input-group flex-col"><label>สังกัด</label><select id="rep-sangkat" onchange="updateRepPhanek()" style="padding: 14px; font-size: 15px;"><option value="">- เลือกสังกัด -</option></select></div>
                <div class="input-group flex-col"><label>แผนก</label><select id="rep-phanek" onchange="updateRepPlate()" style="padding: 14px; font-size: 15px;"><option value="">- เลือกแผนก -</option></select></div>
                <div class="input-group flex-col"><label>เลือกทะเบียนรถ</label><select id="rep-plate" style="padding: 14px; font-size: 15px;"><option value="">- เลือกทะเบียนรถ -</option></select></div>
            </div>
            <div class="flex-row">
                <div class="input-group flex-col">
                    <label>ประเภทจ่าย</label>
                    <select id="rep-paytype" style="padding: 14px; font-size: 15px;">
                        <option value="all">- ทุกประเภทจ่าย -</option>
                        <option value="เครดิต">เครดิต</option>
                        <option value="ฟรีการ์ด">ฟรีการ์ด</option>
                    </select>
                </div>
                <div class="input-group flex-col">
                    <label>เลือกแบบฟอร์ม</label>
                    <select id="rep-type" style="padding: 14px; font-size: 15px; font-weight: 500; border-color: var(--success);">
                        <option value="1">ฟอร์ม 1: รายการใช้น้ำมันเชื้อเพลิง (ตารางการเติมน้ำมัน)</option>
                        <option value="2">ฟอร์ม 2: บันทึกข้อความขออนุมัติเบิก กฟภ. (ตั้งเบิกค่าน้ำมัน)</option>
                    </select>
                </div>
            </div>

            <hr style="border:0; border-top: 2px dashed var(--border); margin: 20px 0;">
            <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--warning); border-bottom: 2px solid var(--border); padding-bottom: 5px;"><i class="fas fa-edit"></i> ข้อมูลเติมข้อความเอง (เฉพาะฟอร์มที่ 2)</h3>
            <div class="flex-row">
                <div class="input-group flex-col"><label>จาก</label><input type="text" id="rep-from" value="ผกส.กฟจ.นครพนม" style="padding: 12px; font-size: 14px;"></div>
                <div class="input-group flex-col"><label>ถึง</label><input type="text" id="rep-to" value="ผจก.กฟจ.นครพนม" style="padding: 12px; font-size: 14px;"></div>
            </div>
            <div class="flex-row">
                <div class="input-group flex-col"><label>เลขที่</label><input type="text" id="rep-custom-no" value="ฉ.1บพ(กส) -" style="padding: 12px; font-size: 14px;"></div>
                <div class="input-group flex-col"><label>วันที่แสดงในรายงาน</label><input type="text" id="rep-custom-date" value="${defaultThaiDate}" style="padding: 12px; font-size: 14px;"></div>
            </div>
            <div class="input-group"><label>เรียน</label><input type="text" id="rep-dear" value="ผจก.กฟจ.นครพนม" style="padding: 12px; font-size: 14px;"></div>

            <button id="printBtn" class="btn btn-success" style="width: 100%; padding: 18px; font-size: 18px; font-weight: 600; margin-top: 15px;" onclick="generateReportPDF()"><i class="fas fa-file-pdf"></i> สร้างรายงาน & พิมพ์ PDF</button>
            <p style="text-align:center; font-size:13px; color:var(--text-light); margin-top:12px;">* ระบบจะเปิดหน้าต่าง Print ของเบราว์เซอร์ ให้เลือก Destination เป็น "Save as PDF" เพื่อบันทึกเป็นไฟล์</p>
        </div>
    `;
    
    const nowTime = new Date(); const year = nowTime.getFullYear(); const month = String(nowTime.getMonth() + 1).padStart(2, '0');
    document.getElementById('rep-start').value = `${year}-${month}-01`; 
    document.getElementById('rep-end').value = `${year}-${month}-${String(new Date(year, nowTime.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
    
    const selectRepSangkat = document.getElementById('rep-sangkat'); 
    [...new Set(currentCarsList.map(c => c.sangkat))].forEach(s => selectRepSangkat.add(new Option(s, s))); 
    updateRepPhanek(); 
}

function updateRepPhanek() {
    const s = document.getElementById('rep-sangkat').value; 
    const selectP = document.getElementById('rep-phanek'); 
    const selectPl = document.getElementById('rep-plate'); 
    selectP.innerHTML = '<option value="">- เลือกแผนก -</option>'; 
    selectPl.innerHTML = '<option value="">- เลือกทะเบียนรถ -</option>';
    
    let filtered = currentCarsList; 
    if(s) filtered = filtered.filter(c => c.sangkat === s); 
    [...new Set(filtered.map(c => c.phanek))].forEach(p => selectP.add(new Option(p, p))); 
    [...new Set(filtered.map(c => c.plate))].forEach(pl => selectPl.add(new Option(pl, pl)));
}

function updateRepPlate() {
    const s = document.getElementById('rep-sangkat').value; 
    const p = document.getElementById('rep-phanek').value; 
    const selectPl = document.getElementById('rep-plate'); 
    selectPl.innerHTML = '<option value="">- เลือกทะเบียนรถ -</option>';
    
    let filtered = currentCarsList; 
    if(s) filtered = filtered.filter(c => c.sangkat === s); 
    if(p) filtered = filtered.filter(c => c.phanek === p); 
    [...new Set(filtered.map(c => c.plate))].forEach(pl => selectPl.add(new Option(pl, pl)));
}

function generateReportPDF() {
    const startDateStr = document.getElementById('rep-start').value; 
    const endDateStr = document.getElementById('rep-end').value; 
    const type = document.getElementById('rep-type').value; 
    const plate = document.getElementById('rep-plate').value; 
    const payType = document.getElementById('rep-paytype').value;
    
    if(!startDateStr || !endDateStr) return Swal.fire('แจ้งเตือน', 'กรุณาเลือกช่วงวันที่ให้ครบ', 'warning'); 
    if(!plate) return Swal.fire('แจ้งเตือน', 'กรุณาเลือกทะเบียนรถด้วยครับ', 'warning');

    const btn = document.getElementById('printBtn'); 
    const originalBtnText = btn.innerHTML; 
    btn.disabled = true; 
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังเตรียมเอกสาร...';

    setTimeout(() => {
        const startD = new Date(startDateStr); startD.setHours(0,0,0,0); 
        const endD = new Date(endDateStr); endD.setHours(23,59,59,999);
        
        let filteredData = currentFuelsList.filter(f => {
            if(!f.date) return false; 
            let d = new Date(f.date); 
            if(isNaN(d)) { const parts = f.date.split(' ')[0].split('/'); d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); }
            let dateMatch = d >= startD && d <= endD;
            let payTypeMatch = payType === 'all' ? true : f.payType === payType;
            return dateMatch && payTypeMatch;
        });
        
        filteredData.sort((a, b) => { 
            let dA = new Date(a.date); if(isNaN(dA)){ const p=a.date.split(' ')[0].split('/'); dA=new Date(`${p[2]}-${p[1]}-${p[0]}`); } 
            let dB = new Date(b.date); if(isNaN(dB)){ const p=b.date.split(' ')[0].split('/'); dB=new Date(`${p[2]}-${p[1]}-${p[0]}`); } 
            return dA - dB; 
        });
        
        const carData = filteredData.filter(f => f.plate === plate); 
        const carInfo = currentCarsList.find(c => c.plate === plate);
        
        if(carData.length === 0) { 
            btn.disabled = false; btn.innerHTML = originalBtnText; 
            return Swal.fire('แจ้งเตือน', 'ไม่พบข้อมูลของรถคันนี้ในช่วงเวลาหรือประเภทจ่ายที่เลือก', 'info'); 
        }

        const printSection = document.getElementById('print-section'); 
        const monthNames = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]; 
        const shortMonthNames = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]; 
        const reportMonth = `${monthNames[endD.getMonth()]} ${endD.getFullYear()+543}`;

        if(type === '1') {
            let totalLiter = 0; let totalCost = 0; let totalDistance = 0; let trueFirstMile = '';
            let allSorted = currentFuelsList.filter(x => x.plate === plate).sort((a, b) => { let dA = new Date(a.date); if(isNaN(dA)){ const p=a.date.split(' ')[0].split('/'); dA=new Date(`${p[2]}-${p[1]}-${p[0]}`); } let dB = new Date(b.date); if(isNaN(dB)){ const p=b.date.split(' ')[0].split('/'); dB=new Date(`${p[2]}-${p[1]}-${p[0]}`); } return dA - dB; });
            let firstIndex = allSorted.findIndex(f => f.id === carData[0].id); 
            if(firstIndex > 0) { trueFirstMile = parseFloat(allSorted[firstIndex - 1].mile) || ''; }
            
            let tableRows = `<tr><td></td><td></td><td></td><td></td><td></td><td style="text-align:right;">ยกมา</td><td>${trueFirstMile !== '' ? trueFirstMile : ''}</td><td></td><td></td><td></td><td></td></tr>`;
            let prevM = trueFirstMile;
            
            carData.forEach((f, idx) => {
                let dText = ''; if(f.date) { let d = new Date(f.date); if(isNaN(d)) { const p = f.date.split(' ')[0].split('/'); d = new Date(`${p[2]}-${p[1]}-${p[0]}`); } dText = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${(d.getFullYear()+543).toString().slice(-2)}'`; }
                const q = parseFloat(f.quantity) || 0; const c = parseFloat(f.totalAmount) || 0; const m = parseFloat(f.mile) || 0;
                let dist = ''; if (prevM !== '' && m >= prevM) { dist = m - prevM; } else if (idx > 0) { let lastM = parseFloat(carData[idx-1].mile) || 0; if(m >= lastM) dist = m - lastM; }
                totalLiter += q; totalCost += c; if(dist !== '') totalDistance += dist; let avg = (dist !== '' && q > 0) ? (dist / q).toFixed(2) : '';
                tableRows += `<tr><td>${dText}</td><td>${f.docNo || ''}</td><td>${q > 0 ? q.toFixed(2) : ''}</td><td>${c > 0 ? c.toFixed(2) : ''}</td><td></td><td></td><td>${m || ''}</td><td></td><td>${dist || ''}</td><td>${avg}</td><td style="text-align:center;">${f.station || ''}</td></tr>`;
                prevM = m;
            });
            let totalAvg = (totalDistance > 0 && totalLiter > 0) ? (totalDistance / totalLiter).toFixed(2) : '';
            
            printSection.innerHTML = `<div style="font-family: 'Sarabun', sans-serif;"><div class="print-title">รายการใช้น้ำมันเชื้อเพลิงและน้ำมันหล่อลื่น</div><div class="print-title" style="font-weight: normal;">ประจำเดือน ${reportMonth}</div><div style="font-size: 14px; text-align: center; font-weight: bold;">ชื่อผู้ใช้รถ ........................................................................ ตำแหน่ง ........................................................................</div><div style="font-size: 14px; text-align: center; font-weight: bold; display: flex; justify-content: center; gap: 20px;"><span>รถยี่ห้อ ${carInfo ? carInfo.brand : ''}</span><span>ประเภท ${carInfo ? carInfo.type : ''}</span><span>ทะเบียน ${plate}</span><span>สังกัด ${carInfo ? carInfo.sangkat : ''}</span></div><table class="print-table"><thead><tr><th rowspan="3">ว.ด.ป</th><th rowspan="3">เลขที่<br>ใบสั่งจ่าย</th><th colspan="4">น้ำมันที่ใช้</th><th rowspan="3">เลข กม.<br>ที่เบิกเติม</th><th rowspan="3">งบ</th><th rowspan="3">ระยะทาง</th><th rowspan="3">เฉลี่ย<br>กม./ลิตร</th><th rowspan="3">หมายเหตุ</th></tr><tr><th colspan="2">เบนซิน</th><th colspan="2">หล่อลื่น</th></tr><tr><th>ลิตร</th><th>เป็นเงิน</th><th>ลิตร</th><th>เป็นเงิน</th></tr></thead><tbody>${tableRows}<tr style="font-weight:bold; background:#f9f9f9;"><td colspan="2">รวม</td><td>${totalLiter > 0 ? totalLiter.toFixed(2) : ''}</td><td>${totalCost > 0 ? totalCost.toFixed(2) : ''}</td><td></td><td></td><td></td><td></td><td>${totalDistance > 0 ? totalDistance : ''}</td><td>${totalAvg}</td><td></td></tr></tbody></table><div class="print-sign-area"><div style="width: 45%; text-align: center;"><div class="print-sign-line" style="width: 80%; margin: 0 auto;"></div>(.........................................................................)<br>หัวหน้าหน่วยงานที่มีหน้าที่ควบคุมดูแลยานพาหนะ</div><div style="width: 45%; text-align: center;"><div class="print-sign-line" style="width: 80%; margin: 0 auto;"></div>ผจก.กฟจ.นพ.<br>วันที่ .......... / .................... / ...........</div></div></div>`;
            
            window.print(); 
            btn.disabled = false; btn.innerHTML = originalBtnText;
        } else {
            const customFrom = document.getElementById('rep-from').value || '................................................';
            const customTo = document.getElementById('rep-to').value || '................................................';
            const customNo = document.getElementById('rep-custom-no').value || '................................................';
            const customDate = document.getElementById('rep-custom-date').value || '................................................';
            const customDear = document.getElementById('rep-dear').value || '................................................';

            let totalSub = 0; let totalVat = 0; let totalAll = 0; let tableRows = '';
            carData.forEach((f, index) => {
                let dText = ''; if(f.date) { let d = new Date(f.date); if(isNaN(d)) { const parts = f.date.split(' ')[0].split('/'); d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); } dText = `${d.getDate()} ${shortMonthNames[d.getMonth()]} ${d.getFullYear()+543}`; }
                const t = parseFloat(f.totalAmount) || 0; const sub = (t * 100) / 107; const vat = (t * 7) / 107;
                totalSub += sub; totalVat += vat; totalAll += t;
                let costCenterArr = []; if (f.wbs) costCenterArr.push(f.wbs); if (f.network) costCenterArr.push(f.network); let costCenterStr = costCenterArr.join(' / ');
                tableRows += `<tr><td style="text-align:center;">${index + 1}</td><td style="text-align:center;">${dText}</td><td style="text-align:right;">${sub.toFixed(2)}</td><td style="text-align:right;">${vat.toFixed(2)}</td><td style="text-align:right;">${t.toFixed(2)}</td><td></td><td></td><td style="text-align:center;">${f.budget || ''}</td><td style="text-align:center;">${costCenterStr}</td></tr>`;
            });
            const carTypeStr = carInfo ? carInfo.type : ''; const carDeptStr = carInfo ? `${carInfo.phanek} ${carInfo.sangkat}` : ''; const thaiBahtText = ThaiBaht(totalAll);

            printSection.innerHTML = `
                <div style="font-family: 'Sarabun', sans-serif;">
                    <div style="display:flex; align-items:center; margin-bottom:10px;"><img id="form2-logo" src="https://images2.imgbox.com/b3/4f/rQUZ8OAA_o.png" style="width: 100px; height: 100px; object-fit: contain; margin-right:15px; display:none;"><h2 id="fallback-title" style="margin:0; font-weight:bold; font-size:22px; display:none;">บันทึกข้อความ (การไฟฟ้าส่วนภูมิภาค)</h2></div>
                    <div style="font-size:14px; line-height: 1.6; margin-bottom: 10px;">
                        <div style="display: flex;"><div style="width: 50%;"><b>จาก</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${customFrom}</div><div style="width: 50%;"><b>ถึง</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${customTo}</div></div>
                        <div style="display: flex;"><div style="width: 50%;"><b>เลขที่</b>&nbsp;&nbsp;&nbsp;${customNo}</div><div style="width: 50%;"><b>วันที่</b>&nbsp;&nbsp;&nbsp;${customDate}</div></div>
                        <div style="display: flex;"><div style="width: 40px;"><b>เรื่อง</b></div><div>อนุมัติสั่งซื้อ อนุมัติจ่ายเงินค่าน้ำมันเชื้อเพลิง โดยวิธีเฉพาะเจาะจง ด้วยการใช้บัตรเครดิตน้ำมัน และรายงานผลการตรวจรับ</div></div>
                        <div style="display: flex;"><div style="width: 40px;"><b>เรียน</b></div><div>${customDear}</div></div>
                    </div>
                    <p style="font-size:14px; text-indent: 40px; margin-bottom:10px; line-height: 1.6; text-align: justify;">ตามความเห็นชอบและอนุมัติรายงานขอซื้อขอจ้างน้ำมันเชื้อเพลิง มีความประสงค์จัดซื้อน้ำมันเชื้อเพลิง สำหรับรถยนต์ทะเบียน <b>${plate}</b> ประเภท <b>${carTypeStr}</b> ประจำ <b>${carDeptStr}</b> ประจำเดือน <b>${reportMonth}</b> เพื่อใช้ในการปฏิบัติงาน จากสถานีบริการน้ำมันภายใต้การให้บริการ โดยบัตรเครดิตน้ำมันจากธนาคารกรุงไทย จำกัด (มหาชน) สาขานครพนม มีรายละเอียดดังนี้</p>
                    <table class="print-table" style="margin-bottom: 0; border-bottom: none;"><thead><tr><th rowspan="2" style="width: 5%;">ลำดับ</th><th rowspan="2" style="width: 15%;">วันที่</th><th rowspan="2" style="width: 12%;">ค่าน้ำมัน<br>(ก่อน VAT)</th><th rowspan="2" style="width: 12%;">ภาษีมูลค่าเพิ่ม</th><th rowspan="2" style="width: 12%;">รวมเป็นเงิน<br>(รวมภาษี)</th><th colspan="2" style="width: 10%;">เครดิตภาษี</th><th rowspan="2" style="width: 10%;">งบ</th><th rowspan="2" style="width: 24%;">ศูนย์ต้นทุน/WBS/โครงข่าย</th></tr><tr><th style="width: 5%;">ได้</th><th style="width: 5%;">ไม่ได้</th></tr></thead><tbody>${tableRows}<tr style="font-weight:bold; background:#f9f9f9;"><td colspan="4" style="text-align:left; padding-left: 10px;">รวมเป็นเงินทั้งสิ้น ( ${thaiBahtText} )</td><td style="text-align:right;">${totalAll.toFixed(2)}</td><td colspan="4"></td></tr></tbody></table>
                    <table style="width:100%; border:1.5px solid #000; border-top: none; border-collapse: collapse; font-size:13px;">
                        <tr>
                            <td style="width:50%; padding:10px 15px; border-right:1.5px solid #000; border-bottom:1.5px solid #000; vertical-align: top;">จึงเรียนมาเพื่อโปรดอนุมัติสั่งซื้อน้ำมันเชื้อเพลิงจาก บริษัท ปตท.จำกัด (มหาชน) และ บริษัท บางจากคอร์ปอเรชั่น จำกัด (มหาชน) ต่อไปด้วย จะขอบคุณยิ่ง<br><br><br><div style="text-align:center;">ลงชื่อ......................................................................<br>(......................................................................)<br>ตำแหน่ง......................................................................</div></td>
                            <td style="width:50%; padding:10px 15px; border-bottom:1.5px solid #000; vertical-align: top;"><b>อนุมัติสั่งซื้อน้ำมันเชื้อเพลิง เป็นจำนวนเงินทั้งสิ้น... ${totalAll.toFixed(2)} บาท<br>(รวมภาษีมูลค่าเพิ่ม)</b><br><br><br><div style="text-align:center;">ลงชื่อ......................................................................<br>(......................................................................)<br>ตำแหน่ง......................................................................<br>วันที่ .......... / .................... / ...........</div></td>
                        </tr>
                        <tr>
                            <td style="width:50%; padding:10px 15px; border-right:1.5px solid #000; vertical-align: top;"><div style="text-align:center; font-weight:bold; text-decoration:underline; margin-bottom:5px;">รายงานผลการตรวจรับ</div>จาก คณะกรรมการตรวจรับ<br>เรียน ผจก.กฟจ.นพ.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คณะกรรมการฯ ได้ตรวจรับน้ำมันเชื้อเพลิงถูกต้อง ครบถ้วนแล้ว เมื่อวันที่...................................................<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;จึงเรียนมาเพื่อโปรดอนุมัติจ่ายเงิน จำนวน <b>${totalAll.toFixed(2)}</b> บาท (รวมภาษีมูลค่าเพิ่ม) ต่อไปด้วย จะขอบคุณยิ่ง<br><br><div style="margin-left: 15%;">................................................ ประธานกรรมการ<br>................................................ กรรมการ<br>................................................ กรรมการ<br></div><hr style="border-top:1.5px solid #000; margin: 10px 0;">ได้รับของจากคณะกรรมการตรวจรับเพื่อใช้งานแล้ว เมื่อวันที่...................................................<br><br><div style="text-align:center;">ลงชื่อ................................................ ผู้รับของ<br>(......................................................................)<br></div></td>
                            <td style="width:50%; padding:10px 15px; vertical-align: top;"><b>อนุมัติจ่ายเงินให้ธนาคาร กรุงไทย จำกัด (มหาชน) สาขานครพนม เป็นจำนวนเงินทั้งสิ้น &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${totalAll.toFixed(2)} บาท (รวมภาษีมูลค่าเพิ่ม)</b><br><br><br><br><br><br><br><br><div style="text-align:center;">ลงชื่อ......................................................................<br>(......................................................................)<br>ตำแหน่ง......................................................................<br>วันที่ .......... / .................... / ...........</div></td>
                        </tr>
                    </table>
                </div>
            `;
            
            const logoImg = document.getElementById('form2-logo'); 
            logoImg.style.display = 'block';
            
            if (logoImg.complete) { 
                window.print(); btn.disabled = false; btn.innerHTML = originalBtnText; 
            } else { 
                logoImg.onload = function() { 
                    window.print(); btn.disabled = false; btn.innerHTML = originalBtnText; 
                }; 
                logoImg.onerror = function() { 
                    logoImg.style.display = 'none'; 
                    document.getElementById('fallback-title').style.display = 'block'; 
                    window.print(); btn.disabled = false; btn.innerHTML = originalBtnText; 
                }; 
            }
        }
    }, 100);
}