import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { AdminService, CreateUserPayload, UpdateUserPayload } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  pageLoaded = signal(false);
  showModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingUser = signal<User | null>(null);
  error = signal('');
  success = signal('');

  // Form fields
  formName = signal('');
  formEmail = signal('');
  formPassword = signal('');
  formUserType = signal<'admin' | 'user'>('user');
  formUserStatus = signal<'active' | 'inactive' | 'banned'>('active');

  hotZones = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    delay: Math.random() * 8,
    duration: 4 + Math.random() * 4,
  }));

  constructor(
    private adminService: AdminService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    setTimeout(() => this.pageLoaded.set(true), 80);
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('فشل تحميل المستخدمين');
        this.loading.set(false);
      },
    });
  }

  openCreateModal() {
    this.modalMode.set('create');
    this.editingUser.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(user: User) {
    this.modalMode.set('edit');
    this.editingUser.set(user);
    this.formName.set(user.name);
    this.formEmail.set(user.email);
    this.formPassword.set('');
    this.formUserType.set(user.user_type);
    this.formUserStatus.set(user.user_status);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.error.set('');
  }

  resetForm() {
    this.formName.set('');
    this.formEmail.set('');
    this.formPassword.set('');
    this.formUserType.set('user');
    this.formUserStatus.set('active');
    this.error.set('');
  }

  submitForm() {
    const name = this.formName().trim();
    const email = this.formEmail().trim();
    const password = this.formPassword();

    if (!name || !email) {
      this.error.set('يرجى ملء الحقول المطلوبة');
      return;
    }

    if (this.modalMode() === 'create') {
      if (!password) {
        this.error.set('كلمة المرور مطلوبة');
        return;
      }
      const payload: CreateUserPayload = {
        name,
        email,
        password,
        user_type: this.formUserType(),
        user_status: this.formUserStatus(),
      };
      this.adminService.createUser(payload).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
          this.showSuccess('تم إنشاء المستخدم بنجاح');
        },
        error: (err) => this.error.set(err.error?.message || 'فشل إنشاء المستخدم'),
      });
    } else {
      const user = this.editingUser();
      if (!user) return;
      const payload: UpdateUserPayload = {
        name,
        email,
        user_type: this.formUserType(),
        user_status: this.formUserStatus(),
      };
      if (password) payload.password = password;
      this.adminService.updateUser(user.id, payload).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
          this.showSuccess('تم تحديث المستخدم بنجاح');
        },
        error: (err) => this.error.set(err.error?.message || 'فشل تحديث المستخدم'),
      });
    }
  }

  deleteUser(user: User) {
    if (!confirm(`هل تريد حذف ${user.name}؟`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.showSuccess('تم حذف المستخدم');
      },
      error: () => this.error.set('فشل حذف المستخدم'),
    });
  }

  private showSuccess(msg: string) {
    this.success.set(msg);
    setTimeout(() => this.success.set(''), 3000);
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#4caf50';
      case 'inactive': return '#ff9800';
      case 'banned': return '#e04040';
      default: return '#888';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'banned': return 'محظور';
      default: return status;
    }
  }

  getRoleLabel(type: string): string {
    return type === 'admin' ? 'مدير' : 'مستخدم';
  }

  onFormInput(field: 'name' | 'email' | 'password', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    switch (field) {
      case 'name': this.formName.set(value); break;
      case 'email': this.formEmail.set(value); break;
      case 'password': this.formPassword.set(value); break;
    }
  }

  onSelectChange(field: 'type' | 'status', event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (field === 'type') this.formUserType.set(value as 'admin' | 'user');
    else this.formUserStatus.set(value as 'active' | 'inactive' | 'banned');
  }
}
