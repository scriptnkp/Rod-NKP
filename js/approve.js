// ==========================================
// ไฟล์: js/approve.js
// หน้าที่: หน้าอนุมัติขอใช้รถ (เฉพาะ Admin) + แจ้งเตือน popup เมื่อมีคำขอใหม่
// ==========================================

const PENDING_STATUS = 'รออนุมัติ';
let pendingUsesList = [];
let approvePollTimer = null;
let notifiedPendingIds = new Set();

function escHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function isAdminUser() {
    try { return JSON.parse(localStorage.getItem('user_session')).role === 'Admin'; } catch (e) { return false; }
}

// --- ตรวจคำขอใหม่ทุก 30 วินาที (เริ่มตอน Admin login) ---
function startApprovalPolling() {
    stopApprovalPolling();
    checkPendingApprovals();
    approvePollTimer = setInterval(checkPendingApprovals, 30000);
}

function stopApprovalPolling() {
    if (approvePollTimer) clearInterval(approvePollTimer);
    approvePollTimer = null;
    notifiedPendingIds.clear();
    pendingUsesList = [];
}

function updateApproveBadges() {
    const n = pendingUsesList.length;
    ['sidebar-approve-badge', 'quick-approve-badge'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = n;
        el.style.display = n > 0 ? 'inline-block' : 'none';
    });
}

async function fetchPendingUses() {
    const res = await apiCall({ action: 'get_active_uses' });
    if (res.status === 'success') {
        activeUsesList = res.data;
        pendingUsesList = res.data.filter(u => u.status === PENDING_STATUS);
    }
}

async function checkPendingApprovals() {
    if (!isAdminUser()) return;
    try { await fetchPendingUses(); } catch (e) { return; }
    updateApproveBadges();

    // ถ้าเปิดหน้าอนุมัติอยู่ ให้รีเฟรชรายการแทนการเด้ง popup
    if (document.getElementById('approve-list')) { renderApproveList(); return; }

    const fresh = pendingUsesList.filter(u => !notifiedPendingIds.has(String(u.useId)));
    if (fresh.length === 0 || Swal.isVisible()) return; // ถ้ามี popup อื่นเปิดอยู่ รอรอบถัดไป
    fresh.forEach(u => notifiedPendingIds.add(String(u.useId)));

    const first = fresh[0];
    const r = await Swal.fire({
        title: '🔔 มีคำขอใช้รถรออนุมัติ',
        html: fresh.length === 1
            ? `<b>${escHtml(first.empName)}</b> ขอใช้รถ <b>${escHtml(first.plate)}</b><br>ไป: ${escHtml(first.location)}`
            : `มีคำขอใหม่ <b>${fresh.length}</b> รายการ<br>ล่าสุด: ${escHtml(first.empName)} (${escHtml(first.plate)})`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'ไปหน้าอนุมัติ',
        cancelButtonText: 'ไว้ทีหลัง',
        confirmButtonColor: '#10B981'
    });
    if (r.isConfirmed) loadPage('approve', document.getElementById('menu-admin-approve'));
}

// --- หน้าอนุมัติ ---
async function renderApprovePage(container) {
    if (!isAdminUser()) {
        container.innerHTML = `<div class="form-box" style="text-align:center;">หน้านี้สำหรับ Admin เท่านั้น</div>`;
        return;
    }
    container.innerHTML = `
        <div class="page-title" style="color: var(--success);"><i class="fas fa-user-check"></i> อนุมัติขอใช้รถ</div>
        <div id="approve-list"><div style="text-align:center; padding:40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>`;
    try { await fetchPendingUses(); } catch (e) {
        document.getElementById('approve-list').innerHTML = `<div class="form-box" style="text-align:center;">โหลดข้อมูลไม่สำเร็จ</div>`;
        return;
    }
    updateApproveBadges();
    renderApproveList();
}

function renderApproveList() {
    const box = document.getElementById('approve-list');
    if (!box) return;
    if (pendingUsesList.length === 0) {
        box.innerHTML = `<div class="form-box" style="text-align:center; color:var(--text-light);"><i class="fas fa-check-circle text-success"></i> ไม่มีคำขอที่รออนุมัติ</div>`;
        return;
    }
    box.innerHTML = `<div class="card-grid" style="margin-top:0;">` + pendingUsesList.map(u => {
        const car = currentCarsList.find(c => c.plate === u.plate) || {};
        const id = escHtml(u.useId);
        return `
        <div class="use-card" style="border-left: 4px solid var(--primary);">
            <div class="use-card-header">
                <div class="use-card-plate"><i class="fas fa-car-side"></i> ${escHtml(u.plate)}</div>
                <div class="use-card-badge" style="background:#E0E7FF; color:#3730A3;">รออนุมัติ</div>
            </div>
            <div class="use-card-detail"><strong>ผู้ขอ:</strong> ${escHtml(u.empName)}</div>
            <div class="use-card-detail"><strong>รถ:</strong> ${escHtml(car.brand || '-')} ${escHtml(car.type || '')} (${escHtml(car.phanek || '-')})</div>
            <div class="use-card-detail"><strong>สถานที่:</strong> ${escHtml(u.location)}</div>
            <div class="use-card-detail"><strong>ไมล์เริ่มต้น:</strong> ${escHtml(u.startMile)}</div>
            <div class="use-card-detail"><strong>เวลาที่ขอ:</strong> ${escHtml(formatDisplayDate(u.date))}</div>
            <div class="flex-row" style="margin-top:15px; gap:10px;">
                <button class="btn btn-danger flex-col" style="min-width:0;" onclick="decideUse('${id}','rejected')"><i class="fas fa-times"></i> ไม่อนุมัติ</button>
                <button class="btn btn-success flex-col" style="min-width:0;" onclick="decideUse('${id}','approved')"><i class="fas fa-check"></i> อนุมัติ</button>
            </div>
        </div>`;
    }).join('') + `</div>`;
}

async function decideUse(useId, decision) {
    const u = pendingUsesList.find(x => String(x.useId) === String(useId));
    if (!u) return;
    const user = JSON.parse(localStorage.getItem('user_session'));
    let reason = '';

    if (decision === 'approved') {
        const c = await Swal.fire({
            title: 'อนุมัติใช้รถ?',
            html: `ทะเบียน <b>${escHtml(u.plate)}</b><br>ผู้ขอ: ${escHtml(u.empName)}`,
            icon: 'question', showCancelButton: true,
            confirmButtonText: 'อนุมัติ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#10B981'
        });
        if (!c.isConfirmed) return;
    } else {
        const c = await Swal.fire({
            title: 'ไม่อนุมัติ',
            html: `ทะเบียน <b>${escHtml(u.plate)}</b> — ${escHtml(u.empName)}`,
            input: 'text', inputPlaceholder: 'เหตุผล (ไม่บังคับ)',
            icon: 'warning', showCancelButton: true,
            confirmButtonText: 'ยืนยันไม่อนุมัติ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#EF4444'
        });
        if (!c.isConfirmed) return;
        reason = c.value || '';
    }

    Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
        const res = await apiCall({ action: 'decide_use', useId: u.useId, decision: decision, reason: reason, empName: user.name });
        if (res.status === 'success') {
            pendingUsesList = pendingUsesList.filter(x => String(x.useId) !== String(useId));
            if (decision === 'approved') u.status = 'อนุมัติ';
            else activeUsesList = activeUsesList.filter(x => String(x.useId) !== String(useId));
            updateApproveBadges();
            renderApproveList();
            Swal.fire({ icon: 'success', title: decision === 'approved' ? 'อนุมัติแล้ว' : 'บันทึกไม่อนุมัติแล้ว', timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire('เกิดข้อผิดพลาด', res.message || 'ไม่สามารถบันทึกได้', 'error');
        }
    } catch (e) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์', 'error');
    }
}
