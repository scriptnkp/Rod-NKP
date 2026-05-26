// ==========================================
// ไฟล์: js/admin-user.js
// หน้าที่: จัดการฐานข้อมูลผู้ใช้งาน และสิทธิ์การเข้าถึง (เฉพาะ Admin)
// ==========================================

function renderAdminUserPage(container) { 
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title"><i class="fas fa-users text-primary"></i> ฐานข้อมูลผู้ใช้งาน</h2>
            <button class="btn" onclick="openUserModal('add')"><i class="fas fa-plus"></i> เพิ่มผู้ใช้ใหม่</button>
        </div>
        <div id="user-table-loader" style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
        <div class="table-container hidden" id="user-table-wrapper">
            <table>
                <thead>
                    <tr><th>รหัสพนักงาน</th><th>ชื่อ-สกุล</th><th>สังกัด</th><th>สิทธิ์ (Role)</th><th style="text-align:center;">จัดการ</th></tr>
                </thead>
                <tbody id="admin-user-table-body"></tbody>
            </table>
        </div>`; 
        
    fetchUsersData().then(() => { 
        document.getElementById('user-table-loader').classList.add('hidden'); 
        document.getElementById('user-table-wrapper').classList.remove('hidden'); 
        const tbody = document.getElementById('admin-user-table-body'); 
        
        if(currentUsersList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">ไม่มีข้อมูล</td></tr>`; 
        } else {
            currentUsersList.forEach(u => { 
                const roleBadge = u.role === 'Admin' ? `<span style="background:#FEE2E2; color:#991B1B; padding:3px 8px; border-radius:12px; font-size:12px; font-weight:600;">Admin</span>` : (u.role === 'ผู้ช่วย Admin' ? `<span style="background:#FEF3C7; color:#B45309; padding:3px 8px; border-radius:12px; font-size:12px; font-weight:600;">ผู้ช่วย Admin</span>` : `<span style="background:#E0E7FF; color:#3730A3; padding:3px 8px; border-radius:12px; font-size:12px; font-weight:600;">User</span>`); 
                tbody.innerHTML += `
                    <tr>
                        <td>${u.empId}</td>
                        <td style="font-weight: 500;">${u.name}</td>
                        <td>${u.department}</td>
                        <td>${roleBadge}</td>
                        <td style="text-align:center;">
                            <button class="btn btn-warning btn-sm" style="padding: 6px 10px;" onclick="openUserModal('edit', '${u.empId}')"><i class="fas fa-edit"></i></button> 
                            <button class="btn btn-danger btn-sm" style="padding: 6px 10px;" onclick="deleteUser('${u.empId}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`; 
            }); 
        }
    }); 
}

function openUserModal(mode, empId = null) { 
    document.getElementById('userModal').style.display = 'flex'; 
    if(mode === 'add') { 
        document.getElementById('userModalTitle').innerText = 'เพิ่มผู้ใช้ใหม่'; 
        document.getElementById('userOriginalEmpId').value = ''; 
        ['userEmpId','userName','userDept'].forEach(el => document.getElementById(el).value = ''); 
        document.getElementById('userRole').value = 'User'; 
    } else if (empId) { 
        document.getElementById('userModalTitle').innerText = 'แก้ไขผู้ใช้'; 
        const u = currentUsersList.find(item => item.empId.toString() === empId.toString()); 
        if(u) { 
            document.getElementById('userOriginalEmpId').value = u.empId; 
            document.getElementById('userEmpId').value = u.empId; 
            document.getElementById('userName').value = u.name; 
            document.getElementById('userDept').value = u.department; 
            document.getElementById('userRole').value = u.role; 
        } 
    } 
}

async function saveUser() { 
    const originalEmpId = document.getElementById('userOriginalEmpId').value; 
    const empId = document.getElementById('userEmpId').value; 
    const name = document.getElementById('userName').value; 
    const dept = document.getElementById('userDept').value; 
    const role = document.getElementById('userRole').value; 
    
    if(!empId || !name) return Swal.fire('แจ้งเตือน', 'กรุณากรอกรหัสและชื่อ', 'warning'); 
    
    const payload = { 
        action: originalEmpId ? 'edit_user' : 'add_user', 
        originalEmpId: originalEmpId, 
        empId: empId, 
        name: name, 
        department: dept, 
        role: role 
    }; 
    
    document.getElementById('saveUserBtn').disabled = true; 
    try { 
        const res = await apiCall(payload); 
        if(res.status === 'success') { 
            Swal.fire('สำเร็จ', res.message, 'success'); 
            document.getElementById('userModal').style.display = 'none'; 
            loadPage('user-settings'); 
        } else { 
            Swal.fire('ผิดพลาด', res.message, 'error'); 
        } 
    } catch(e) {} finally { 
        document.getElementById('saveUserBtn').disabled = false; 
    } 
}

function deleteUser(empId) { 
    if(empId.toString() === JSON.parse(localStorage.getItem('user_session')).empId.toString()) {
        return Swal.fire('ปฏิเสธ', 'ไม่สามารถลบบัญชีตัวเองขณะเข้าสู่ระบบได้', 'error'); 
    }
    
    Swal.fire({ 
        title: 'ลบข้อมูลผู้ใช้?', 
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonColor: '#EF4444', 
        confirmButtonText: 'ลบเลย!' 
    }).then(async (result) => { 
        if (result.isConfirmed) { 
            try { 
                const res = await apiCall({ action: 'delete_user', empId: empId }); 
                if(res.status === 'success') { 
                    Swal.fire('ลบแล้ว', '', 'success'); 
                    loadPage('user-settings'); 
                } else { 
                    Swal.fire('ผิดพลาด', res.message, 'error'); 
                } 
            } catch(e) {} 
        } 
    }); 
}