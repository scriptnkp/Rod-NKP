// ==========================================
// ไฟล์: js/utility.js
// หน้าที่: จัดการงานเอกสารอรรถประโยชน์ (แบบฟอร์มขอใช้รถยนต์ และ ยพ.6)
// ==========================================

function renderUtilityPage(container) {
    container.innerHTML = `
        <div class="page-title" style="color: #8B5CF6;"><i class="fas fa-briefcase"></i> งานบริการอรรถประโยชน์</div>
        <div class="form-box">
            <div class="input-group">
                <label>เลือกประเภทเอกสารที่ต้องการสร้าง</label>
                <select id="doc-type-selector" onchange="handleDocSelection()" style="border: 2px solid #8B5CF6; font-size: 16px; padding: 12px !important; line-height: 1.6 !important; min-height: 50px !important; font-family: 'Prompt', sans-serif; width: 100%; border-radius: 8px;">
                    <option value="">-- กรุณาเลือกรายการ --</option>
                    <option value="loan-car">📄 แบบฟอร์มการขอใช้รถยนต์ในเวลาปฏิบัติงานปกติ</option>
                    <option value="yp6">📗 ยพ.6 (สมุดบันทึกการใช้รถยนต์)</option>
                </select>
            </div>
            <div id="doc-description" style="margin-top: 20px; color: var(--text-light); text-align: center;">
                <i class="fas fa-info-circle"></i> เลือกรายการด้านบนเพื่อเริ่มกรอกข้อมูลและพิมพ์เอกสาร
            </div>
        </div>
    `;
}

function handleDocSelection() {
    const type = document.getElementById('doc-type-selector').value;
    if (type === 'loan-car') {
        openLoanCarModal();
    } else if (type === 'yp6') {
        openYP6Modal();
    }
}

// ==========================================
// 1. ระบบแบบฟอร์มการขอใช้รถยนต์
// ==========================================
function openLoanCarModal() {
    const user = JSON.parse(localStorage.getItem('user_session'));
    const now = new Date();
    const defaultDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear() + 543}`;
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    Swal.fire({
        title: 'ฟอร์มการขอใช้รถยนต์',
        html: `
            <div style="text-align: left; font-family: 'Prompt', sans-serif; max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                <div style="background: #F3F4F6; padding: 8px; border-radius: 6px; margin-bottom: 10px; font-weight: 600; color: #4F46E5;">1. ข้อมูลงานและผู้ขอใช้รถ</div>
                <div class="flex-row" style="gap: 10px;">
                    <div class="input-group flex-col"><label>ชื่อผู้ขอ</label><input type="text" id="p-name" class="swal2-input" style="margin:0; width:100%;" value="${user.name}"></div>
                    <div class="input-group flex-col"><label>แผนก</label><input type="text" id="p-dept" class="swal2-input" style="margin:0; width:100%;" value="${user.department}"></div>
                </div>
                <div class="flex-row" style="gap: 10px; margin-top:10px;">
                    <div class="input-group flex-col"><label>ลักษณะงาน</label><input type="text" id="p-job-desc" class="swal2-input" style="margin:0; width:100%;" placeholder="ระบุลักษณะงาน"></div>
                    <div class="input-group flex-col"><label>ปริมาณงาน</label><input type="text" id="p-job-qty" class="swal2-input" style="margin:0; width:100%;" placeholder="เช่น 1 งาน"></div>
                </div>
                <div class="input-group" style="margin-top:10px;"><label>สถานที่</label><input type="text" id="p-location" class="swal2-input" style="margin:0; width:100%;"></div>
                
                <div class="flex-row" style="gap: 10px; margin-top:10px;">
                    <div class="input-group flex-col"><label>ตั้งแต่วันที่ (DD/MM/YYYY)</label><input type="text" id="p-start-date" class="swal2-input" style="margin:0; width:100%;" value="${defaultDate}"></div>
                    <div class="input-group flex-col"><label>เวลา (น.)</label><input type="time" id="p-start-time" class="swal2-input" style="margin:0; width:100%;" value="${defaultTime}"></div>
                </div>
                <div class="flex-row" style="gap: 10px; margin-top:10px;">
                    <div class="input-group flex-col"><label>ถึงวันที่ (DD/MM/YYYY)</label><input type="text" id="p-end-date" class="swal2-input" style="margin:0; width:100%;" value="${defaultDate}"></div>
                    <div class="input-group flex-col"><label>เวลา (น.)</label><input type="time" id="p-end-time" class="swal2-input" style="margin:0; width:100%;" value="16:30"></div>
                </div>

                <div style="background: #F3F4F6; padding: 8px; border-radius: 6px; margin: 15px 0 10px; font-weight: 600; color: #4F46E5;">2. ผู้ขับรถ และ รถยนต์</div>
                <div class="flex-row" style="gap: 10px;">
                    <div class="input-group flex-col"><label>ชื่อคนขับรถ</label><input type="text" id="p-driver-name" class="swal2-input" style="margin:0; width:100%;" value="${user.name}"></div>
                    <div class="input-group flex-col"><label>ตำแหน่งคนขับ</label><input type="text" id="p-driver-pos" class="swal2-input" style="margin:0; width:100%;" placeholder="เช่น ช่างไฟฟ้า"></div>
                </div>
                <div class="input-group" style="margin-top:10px;"><label>ใบอนุญาตขับขี่เลขที่</label><input type="text" id="p-driver-license" class="swal2-input" style="margin:0; width:100%;"></div>
                
                <div class="flex-row" style="gap: 10px; margin-top:10px;">
                    <div class="input-group flex-col">
                        <label>เลือกทะเบียนรถ</label>
                        <select id="p-car-plate" class="swal2-input" style="margin:0; width:100%; padding:10px; min-height:48px;" onchange="autoFillUtilityCar()">
                            <option value="">- เลือกรถ -</option>
                            ${currentCarsList.map(c => `<option value="${c.plate}">${c.plate}</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group flex-col"><label>ประเภทรถ</label><input type="text" id="p-car-type" class="swal2-input" style="margin:0; width:100%;" readonly></div>
                </div>

                <div style="background: #F3F4F6; padding: 8px; border-radius: 6px; margin: 15px 0 10px; font-weight: 600; color: #4F46E5;">3. ผู้ร่วมเดินทาง (คั่นด้วยลูกน้ำ ,)</div>
                <div class="input-group">
                    <textarea id="p-passengers" class="swal2-textarea" style="margin:0; width:100%; height: 60px;" placeholder="เช่น นายสมชาย ใจดี, นางสาวสมศรี มีสุข"></textarea>
                </div>
            </div>
        `,
        width: '650px',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-print"></i> เปิดหน้าต่างพิมพ์เอกสาร',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#10B981',
        preConfirm: () => {
            return {
                name: document.getElementById('p-name').value,
                dept: document.getElementById('p-dept').value,
                jobDesc: document.getElementById('p-job-desc').value,
                jobQty: document.getElementById('p-job-qty').value,
                location: document.getElementById('p-location').value,
                startDate: document.getElementById('p-start-date').value,
                startTime: document.getElementById('p-start-time').value,
                endDate: document.getElementById('p-end-date').value,
                endTime: document.getElementById('p-end-time').value,
                driverName: document.getElementById('p-driver-name').value,
                driverPos: document.getElementById('p-driver-pos').value,
                driverLicense: document.getElementById('p-driver-license').value,
                plate: document.getElementById('p-car-plate').value,
                carType: document.getElementById('p-car-type').value,
                passengers: document.getElementById('p-passengers').value
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            generateLoanCarPDF(result.value);
            document.getElementById('doc-type-selector').value = '';
        } else {
            document.getElementById('doc-type-selector').value = '';
        }
    });
}

function autoFillUtilityCar() {
    const plate = document.getElementById('p-car-plate').value;
    const car = currentCarsList.find(c => c.plate === plate);
    document.getElementById('p-car-type').value = car ? car.type : '';
}

function generateLoanCarPDF(d) {
    let totalDays = '0'; let totalHours = '0';
    try {
        if(d.startDate && d.startTime && d.endDate && d.endTime) {
            const [sDay, sMonth, sYear] = d.startDate.split('/'); const [sHr, sMin] = d.startTime.split(':');
            const start = new Date(parseInt(sYear) - 543, parseInt(sMonth) - 1, parseInt(sDay), parseInt(sHr), parseInt(sMin));
            const [eDay, eMonth, eYear] = d.endDate.split('/'); const [eHr, eMin] = d.endTime.split(':');
            const end = new Date(parseInt(eYear) - 543, parseInt(eMonth) - 1, parseInt(eDay), parseInt(eHr), parseInt(eMin));
            if(end >= start) {
                const diffMs = end - start;
                totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); 
                totalHours = Math.round((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); 
            }
        }
    } catch(e) {}

    let passArr = d.passengers.split(',').map(item => item.trim()).filter(item => item !== '');
    let passHtmlLeft = ''; let passHtmlRight = '';
    for(let i=0; i<5; i++) { passHtmlLeft += `<div style="margin-bottom: 2px;">${i+1}. ${passArr[i] || '.........................................................'}</div>`; }
    for(let i=5; i<10; i++) { passHtmlRight += `<div>${i+1}. ${passArr[i] || '.........................................................'}</div>`; }

    const htmlString = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
            @media print { @page { size: A4 portrait; margin: 15mm 20mm 15mm 25mm !important; } body { margin: 0 !important; padding: 0 !important; } }
            html, body { font-family: 'Sarabun', 'TH Sarabun New', sans-serif !important; font-size: 12.5pt !important; line-height: 1.25 !important; color: #000 !important; font-weight: normal !important; -webkit-print-color-adjust: exact; }
            *, div, p, span, td { font-family: 'Sarabun', 'TH Sarabun New', sans-serif !important; font-size: 12.5pt !important; font-weight: normal !important; box-sizing: border-box; } 
            .bold { font-weight: bold !important; } .flex { display: flex !important; } .justify { text-align: justify !important; text-justify: inter-word !important; } .center { text-align: center !important; }
            .sec-heading { margin-top: 6px; margin-bottom: 2px; } .indent-level-1 { padding-left: 1.25cm; } 
            .fluent-paragraph { text-indent: 1.25cm; padding-left: 0; margin-bottom: 6px; text-align: justify; } 
            table { width: 100%; border-collapse: collapse !important; margin: 0 !important; } td { border: none !important; padding: 0 !important; vertical-align: top !important; background: none !important; }
        </style>
    </head>
    <body>
        <div class="center bold" style="font-size: 14pt !important; margin-bottom: 15px; line-height: 1.3;">แบบฟอร์มการขอใช้รถยนต์ในเวลาปฏิบัติงานปกติ<br>กฟจ.นครพนม</div>
        <div class="flex bold sec-heading"><div style="width: 30px;">1.</div><div class="bold">ผู้ขอใช้รถยนต์</div></div>
        <div class="indent-level-1" style="margin-bottom: 4px;">เรียน  หผ.กส.</div>
        <div class="fluent-paragraph">ด้วย (แผนก) <span>${d.dept || '..............................'}</span> จำเป็นต้องใช้รถยนต์ไปปฏิบัติงาน (ลักษณะงาน) <span>${d.jobDesc || '........................................................'}</span> ปริมาณงาน <span>${d.jobQty || '.........................'}</span> สถานที่ <span>${d.location || '..................................................'}</span> ตั้งแต่วันที่ <span>${d.startDate || '....................'}</span> เวลา <span>${d.startTime || '..........'}</span> น. ถึงวันที่ <span>${d.endDate || '....................'}</span> เวลา <span>${d.endTime || '..........'}</span> น. รวม <span>${totalDays}</span> วัน <span>${totalHours}</span> ชม. โดยมี (นาย/นาง/น.ส.) <span>${d.driverName || '..................................................'}</span> ตำแหน่ง <span>${d.driverPos || '..............................'}</span> ทำหน้าที่ขับรถยนต์ ใบอนุญาตขับขี่เลขที่ <span>${d.driverLicense || '........................................'}</span> โดยมีผู้ร่วมเดินทางดังนี้.-</div>
        <div style="padding-left: 2.2cm; width: 100%; margin-bottom: 6px;"><table><tr><td width="50%">${passHtmlLeft}</td><td width="50%">${passHtmlRight}</td></tr></table></div>
        <div class="fluent-paragraph" style="margin-bottom: 8px;">จึงเรียนมาเพื่อโปรดพิจารณา</div>
        <table style="margin-bottom: 10px;"><tr><td width="35%"></td><td width="65%" class="center" style="white-space: nowrap;">...................................................... หผ...........หรือผู้ปฏิบัติงานแทน<br>( <span>${d.name || '..........................................'}</span> )<br>ตำแหน่ง <span>${d.dept || '..........................................'}</span><br>......../......../........</td></tr></table>
        <div class="flex bold sec-heading"><div style="width: 30px;">2.</div><div class="bold">ผู้พิจารณาจัดรถยนต์</div></div>
        <div class="indent-level-1" style="margin-bottom: 4px;">เรียน  หผ...........................</div>
        <div class="fluent-paragraph">ผกส. พิจารณาแล้ว จึงจัดรถยนต์ (ประเภท) <span>${d.carType || '........................................'}</span> หมายเลขทะเบียน <span>${d.plate || '........................................'}</span> เพื่อไปปฏิบัติงานดังกล่าว เป็นเวลา ............ วัน โดยพักแรมที่หน้างาน จึงเรียนมาเพื่อโปรดทราบและดำเนินการต่อไป</div>
        <table style="margin-bottom: 10px;"><tr><td width="50%" class="center"><br>( ...................................................... )<br>ตำแหน่ง ......................................................<br>......../......../........</td><td width="50%" class="center">......................................................<br>( ...................................................... )<br>ตำแหน่ง ......................................................<br>......../......../........</td></tr></table>
        <table style="margin-top: 5px;"><tr><td width="50%" style="padding-right: 10px;"><div class="flex bold"><div style="width: 25px;">3.</div><div class="bold">รายงาน ผจก.กฟจ.นพ.</div></div><div class="indent-1" style="padding-left: 25px;">เรียน ผจก.ผ่าน รจก.(ท.) กฟจ.นครพนม</div><div style="padding-left: 50px; margin-bottom: 8px;">เพื่อโปรดทราบ และพิจารณาอนุมัติ</div><div class="center" style="padding-left: 25px;">......................................................<br>( ...................................................... )<br>ตำแหน่ง ......................................................<br>......../......../........</div></td><td width="50%" style="padding-left: 10px;"><div class="flex bold" style="margin-bottom: 6px;"><div style="width: 25px;">4.</div><div class="bold">อนุมัติ</div></div><div class="center" style="margin-top: 28px;">......................................................<br>( ...................................................... )<br>ตำแหน่ง ......................................................<br>......../......../........</div></td></tr></table>
    </body>
    </html>`;

    Swal.fire({ title: 'กำลังสร้างเอกสาร...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    const printFrame = document.createElement('iframe'); printFrame.id = 'print-frame-' + Date.now(); printFrame.style.cssText = 'position:absolute;width:0;height:0;border:none;'; document.body.appendChild(printFrame);
    printFrame.contentWindow.document.open(); printFrame.contentWindow.document.write(htmlString); printFrame.contentWindow.document.close();
    setTimeout(() => { Swal.close(); printFrame.contentWindow.focus(); printFrame.contentWindow.print(); setTimeout(() => { document.body.removeChild(printFrame); }, 1000); }, 1000);
}

// ==========================================
// 2. ระบบแบบฟอร์ม ยพ.6
// ==========================================

window.updateYp6Phanek = function() {
    const sangkat = document.getElementById('yp6-sangkat').value;
    const phanekSelect = document.getElementById('yp6-phanek');
    const plateSelect = document.getElementById('yp6-plate');

    phanekSelect.innerHTML = '<option value="">- เลือกแผนก -</option>';
    plateSelect.innerHTML = '<option value="">- เลือกทะเบียนรถ -</option>';

    if (!sangkat) return;

    const filteredCars = currentCarsList.filter(c => c.sangkat === sangkat);
    const uniquePhaneks = [...new Set(filteredCars.map(c => c.phanek))].filter(Boolean);

    uniquePhaneks.forEach(p => {
        phanekSelect.innerHTML += `<option value="${p}">${p}</option>`;
    });
};

window.updateYp6Plate = function() {
    const sangkat = document.getElementById('yp6-sangkat').value;
    const phanek = document.getElementById('yp6-phanek').value;
    const plateSelect = document.getElementById('yp6-plate');

    plateSelect.innerHTML = '<option value="">- เลือกทะเบียนรถ -</option>';

    if (!phanek) return;

    const filteredCars = currentCarsList.filter(c => c.sangkat === sangkat && c.phanek === phanek);
    filteredCars.forEach(c => {
        plateSelect.innerHTML += `<option value="${c.plate}">${c.plate}</option>`;
    });
};

function openYP6Modal() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const firstDay = `${y}-${m}-01`;
    const today = `${y}-${m}-${d}`;

    let sangkatList = [...new Set(currentCarsList.map(c => c.sangkat))].filter(Boolean);

    Swal.fire({
        title: 'ยพ.6 (สมุดบันทึกการใช้รถยนต์)',
        html: `
            <div style="text-align: left; font-family: 'Prompt', sans-serif;">
                <div class="flex-row" style="gap: 10px;">
                    <div class="input-group flex-col">
                        <label>ตั้งแต่วันที่</label>
                        <input type="date" id="yp6-start" class="swal2-input" style="margin:0; width:100%; padding:10px; min-height:50px; border-radius:6px; cursor:pointer;" value="${firstDay}">
                    </div>
                    <div class="input-group flex-col">
                        <label>ถึงวันที่</label>
                        <input type="date" id="yp6-end" class="swal2-input" style="margin:0; width:100%; padding:10px; min-height:50px; border-radius:6px; cursor:pointer;" value="${today}">
                    </div>
                </div>
                
                <div class="input-group" style="margin-top:15px;">
                    <label>เลือกสังกัด</label>
                    <select id="yp6-sangkat" class="swal2-select" style="display:flex; margin:0 !important; width:100% !important; padding:12px 14px !important; min-height:55px !important; line-height:1.6 !important; font-size:16px !important; font-family:'Prompt',sans-serif; border-radius:6px;" onchange="updateYp6Phanek()">
                        <option value="">- เลือกสังกัด -</option>
                        ${sangkatList.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>

                <div class="input-group" style="margin-top:10px;">
                    <label>เลือกแผนก</label>
                    <select id="yp6-phanek" class="swal2-select" style="display:flex; margin:0 !important; width:100% !important; padding:12px 14px !important; min-height:55px !important; line-height:1.6 !important; font-size:16px !important; font-family:'Prompt',sans-serif; border-radius:6px;" onchange="updateYp6Plate()">
                        <option value="">- เลือกแผนก -</option>
                    </select>
                </div>

                <div class="input-group" style="margin-top:10px;">
                    <label>เลือกทะเบียนรถ <span style="color:red">*</span></label>
                    <select id="yp6-plate" class="swal2-select" style="display:flex; margin:0 !important; width:100% !important; padding:12px 14px !important; min-height:55px !important; line-height:1.6 !important; font-size:16px !important; font-family:'Prompt',sans-serif; border-radius:6px;">
                        <option value="">- เลือกทะเบียนรถ -</option>
                    </select>
                </div>
            </div>
        `,
        width: '500px',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-search"></i> ค้นหาและพิมพ์',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#8B5CF6',
        preConfirm: () => {
            const plate = document.getElementById('yp6-plate').value;
            if (!plate) { Swal.showValidationMessage('กรุณาเลือกทะเบียนรถ'); return false; }
            return {
                startDate: document.getElementById('yp6-start').value, 
                endDate: document.getElementById('yp6-end').value,
                sangkat: document.getElementById('yp6-sangkat').value,
                phanek: document.getElementById('yp6-phanek').value,
                plate: plate
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetchAndGenerateYP6(result.value);
            document.getElementById('doc-type-selector').value = '';
        } else {
            document.getElementById('doc-type-selector').value = '';
        }
    });
}

function parseThaiDate(str) {
    if (!str) return null;
    let s = String(str).trim();
    
    let matchGrid = s.match(/(\d{1,2})[\/](\d{1,2})[\/](\d{4})/);
    if (matchGrid) {
        let d = parseInt(matchGrid[1]); let m = parseInt(matchGrid[2]); let y = parseInt(matchGrid[3]);
        if (y > 2500) y -= 543;
        return new Date(y, m - 1, d);
    }
    
    let matchDash = s.match(/(\d{4})[-](\d{1,2})[-](\d{1,2})/);
    if (matchDash) {
        let y = parseInt(matchDash[1]); let m = parseInt(matchDash[2]); let d = parseInt(matchDash[3]);
        if (y > 2500) y -= 543;
        return new Date(y, m - 1, d);
    }

    let t = Date.parse(s);
    if(!isNaN(t)) {
        let dt = new Date(t);
        if(dt.getFullYear() > 2500) dt.setFullYear(dt.getFullYear() - 543);
        return dt;
    }
    return null; 
}

async function fetchAndGenerateYP6(params) {
    Swal.fire({ title: 'กำลังดึงประวัติการใช้รถยนต์...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

    try {
        let res;
        try {
            res = await apiCall({ action: 'get_car_logs' }); 
            if (!res || res.status !== 'success') {
                res = await apiCall({ action: 'get_reports' });
            }
        } catch (e) {
            console.error(e);
        }
        
        let allLogs = [];
        if (res && res.data) {
            if (Array.isArray(res.data)) {
                allLogs = res.data;
            } else if (res.data.logs && Array.isArray(res.data.logs)) {
                allLogs = res.data.logs;
            } else {
                allLogs = Object.values(res.data);
            }
        } else if (res && Array.isArray(res)) {
            allLogs = res;
        }

        if(allLogs.length === 0) {
            throw new Error("ไม่มีข้อมูลบันทึกประวัติรถยนต์ในระบบ");
        }
        
        const [sYear, sMonth, sDay] = params.startDate.split('-');
        const startD = new Date(parseInt(sYear), parseInt(sMonth) - 1, parseInt(sDay));
        startD.setHours(0,0,0,0);
        
        const [eYear, eMonth, eDay] = params.endDate.split('-');
        const endD = new Date(parseInt(eYear), parseInt(eMonth) - 1, parseInt(eDay));
        endD.setHours(23,59,59,999);

        const displayStartDate = `${sDay}/${sMonth}/${parseInt(sYear) + 543}`;
        const displayEndDate = `${eDay}/${eMonth}/${parseInt(eYear) + 543}`;

        let historyLogs = allLogs.filter(log => {
            let plateValue = String(log['ทะเบียน'] || log['ทะเบียนรถ'] || log.plate || '').replace(/\s+/g, '');
            let paramPlate = String(params.plate).replace(/\s+/g, '');
            
            if (plateValue !== paramPlate && !plateValue.includes(paramPlate) && !paramPlate.includes(plateValue)) {
                return false;
            }
            
            let logDateStr = String(log['วัน'] || log['วันที่เวลารับ'] || log['วันที่'] || log['วัน/เดือน/ปี'] || log.timestamp || ''); 
            let logD = parseThaiDate(logDateStr);
            
            if (logD && !isNaN(logD.getTime())) {
                logD.setHours(0,0,0,0);
                if (logD < startD || logD > endD) return false;
            } else {
                return false;
            }
            
            return true;
        });

        if (historyLogs.length === 0) {
            Swal.fire({
                title: 'ไม่พบประวัติ',
                html: `ไม่พบบันทึกข้อมูลของรถทะเบียน <b>${params.plate}</b><br>ในช่วงวันที่กำหนด<br><br><small style="color:var(--text-light);">(ตรวจเช็คในระบบแล้ว มีประวัติรวมทั้งหมด ${allLogs.length} บรรทัด)</small>`,
                icon: 'info'
            });
            return;
        }

        let tbodyHtml = '';
        
        historyLogs.forEach(log => {
            let logDateStr = String(log['วัน'] || log['วันที่เวลารับ'] || log['วันที่'] || ''); 
            let matchDate = logDateStr.match(/(\d{1,2})[\/|-](\d{1,2})[\/|-](\d{4})/);
            let displayDateInTable = matchDate ? `${matchDate[1]}/${matchDate[2]}/${matchDate[3]}` : '-';
            
            let empName = log['ผู้ปฏิบัติงาน'] || log.empName || log.name || '-';
            let location = log['สถานที่ปฏิบัติงาน'] || log.location || log['สถานที่'] || '-';
            let startMile = log['เลขไมล์ก่อนใช้'] || log['ขาไป'] || log.startMile || '-';
            let endMile = log['เลขไมล์หลังใช้'] || log['ขากลับ'] || log.endMile || '-';
            let fuel = log['น้ำมันเชื้อเพลิงที่เติมแต่ละครั้ง'] || log.fuel || '';
            let remark = log['หมายเหตุ'] || log.remark || '';

            tbodyHtml += `
                <tr>
                    <td class="col-date">${displayDateInTable}</td>
                    <td class="col-name">${empName}</td>
                    <td class="col-task">${location}</td>
                    <td class="col-mile">${startMile}</td>
                    <td class="col-mile">${endMile}</td>
                    <td class="col-fuel">${fuel}</td>
                    <td class="col-remark">${remark}</td>
                </tr>
            `;
        });
        
        // 🔴 ปรับลดแถวเปล่าเหลือ 18 แถว เพื่อรองรับฟอนต์ 14pt ได้พอดีหน้า A4 แบบสวยๆ ครับ
        const minRows = 18;
        if(historyLogs.length < minRows) {
            for(let i = historyLogs.length; i < minRows; i++) {
                tbodyHtml += `<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
            }
        }

        const htmlString = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
                @media print { @page { size: A4 portrait; margin: 15mm !important; } body { margin: 0 !important; padding: 0 !important; } }
                
                /* 🔴 อัปไซส์ฟอนต์เป็น 14pt ตามต้องการครับ! */
                html, body { font-family: 'Sarabun', 'TH Sarabun New', sans-serif !important; font-size: 14pt !important; color: #000 !important; background: #fff; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
                
                .header-title { font-size: 17pt; font-weight: bold; text-align: center; margin-bottom: 8px; }
                .sub-title { font-size: 15pt; margin-bottom: 8px; display: flex; justify-content: space-between; }
                table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
                
                /* 🔴 ปรับขนาดฟอนต์หัวตาราง และระยะห่างไม่ให้ล้น */
                th { border: 1px solid #000; text-align: center; padding: 6px 4px; font-weight: bold; vertical-align: middle; line-height: 1.3 !important; font-size: 14pt !important; }
                
                /* 🔴 ล็อกความสูงกล่องตารางไว้ที่ 35px เพื่อความสมดุล */
                td { border-left: 1px solid #000; border-right: 1px solid #000; border-bottom: 1px dotted #000; padding: 4px; vertical-align: middle; height: 35px; font-size: 14pt !important; }
                
                .col-date { width: 12%; text-align: center; } .col-name { width: 18%; } .col-task { width: 30%; } .col-mile { width: 10%; text-align: center; } .col-fuel { width: 10%; text-align: center; } .col-remark { width: 10%; }
            </style>
        </head>
        <body>
            <div class="header-title">ยพ.๖ สมุดบันทึกการใช้รถยนต์</div>
            <div class="sub-title">
                <div><b>ทะเบียนรถ:</b> ${params.plate}</div>
                <div><b>แผนก/สังกัด:</b> ${params.phanek || '-'} ${params.sangkat ? '('+params.sangkat+')' : ''}</div>
                <div><b>ช่วงวันที่:</b> ${displayStartDate} ถึง ${displayEndDate}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th rowspan="2">วันที่</th>
                        <th rowspan="2">ชื่อและตำแหน่ง<br>ผู้ใช้รถ</th>
                        <th rowspan="2">ไปปฏิบัติงานอะไรและที่ใด</th>
                        <th colspan="2">เลขกิโลเมตรหรือ<br>ไมล์ประจำรถ</th>
                        <th rowspan="2">น้ำมันเชื้อ<br>เพลิงที่เติม<br>แต่ละครั้ง</th>
                        <th rowspan="2">หมายเหตุ</th>
                    </tr>
                    <tr>
                        <th>ไป</th>
                        <th>กลับ</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbodyHtml}
                </tbody>
            </table>
        </body>
        </html>
        `;

        const uniqueId = 'print-yp6-' + Date.now();
        const printFrame = document.createElement('iframe');
        printFrame.id = uniqueId;
        printFrame.style.cssText = 'position:absolute;width:0;height:0;border:none;';
        document.body.appendChild(printFrame);
        printFrame.contentWindow.document.open();
        printFrame.contentWindow.document.write(htmlString);
        printFrame.contentWindow.document.close();

        setTimeout(() => {
            Swal.close();
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
            setTimeout(() => { document.body.removeChild(printFrame); }, 1000);
        }, 1000);

    } catch (error) {
        console.error(error);
        Swal.fire('ผิดพลาด', error.message || 'ไม่สามารถดึงข้อมูลประวัติการใช้รถได้', 'error');
    }
}