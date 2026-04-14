import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule, RouterModule]
})
export class LoginComponent {

  user = { email: '', password: '' };
  errorMsg = '';
  isLoading = false;

  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}
  ngOnInit() {}

  login() {
    this.isLoading = true;
      if (!this.isValidEmail(this.user.email)) {
    this.errorMsg = 'Invalid email address';
    return;
  }

    this.auth.login(this.user).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.success) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));

          alert('Login successful');
          this.router.navigate(['/dashboard']);
        } else {
          this.handleError(res.msg);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.handleError(err.error?.msg);
      }
    });
  }

  handleError(msg: string) {
    if (msg === 'User not found') {
      alert('User not found. Redirecting to Sign Up...');
      this.router.navigate(['/signup']);
    } 
    else if (msg === 'Please complete signup (verify OTP first)') {
      alert('Please verify your email. Redirecting...');
      this.router.navigate(['/signup']);
    } 
    else if (msg === 'Incorrect password') {
      alert('Invalid credentials. Please try again.');
      this.user.password = '';

      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/login']);
      });
    } 
    else {
      alert('Login failed. Please try again.');
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  goToForgot() {
    this.router.navigate(['/forgotpassword']);
  }
  isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
}