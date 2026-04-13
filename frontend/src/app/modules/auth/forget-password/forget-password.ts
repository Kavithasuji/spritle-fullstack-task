import { Component, NgModule } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-forget-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})

export class ForgetPassword {

  email = '';
  otp: string[] = ['', '', '', '', '', ''];
  newPassword = '';

  step = 1;

  constructor(private auth: AuthService, private router: Router, private cd: ChangeDetectorRef  ) { }

  sendOtp() {
    if (this.isSendingOtp || !this.isValidEmail()) return;

    this.isSendingOtp = true;
    this.step = 2;

    this.auth.forgotPassword({ email: this.email }).subscribe({
      next: () => {
        this.step = 2;
        this.isSendingOtp = false;
      },
      error: () => {
        alert('Failed to send OTP');
        this.isSendingOtp = false;
      }
    });
  }
  isSendingOtp = false;

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
  isVerifyingOtp = false;

verifyOtp() {
  const finalOtp = this.otp.join('');

  if (finalOtp.length !== 6 || this.isVerifyingOtp) return;

  this.isVerifyingOtp = true;

  this.auth.verifyForgotOtp({
    email: this.email,
    otp: finalOtp
  }).subscribe({
    next: (res) => {
      console.log('OTP success:', res);

      this.isVerifyingOtp = false;  
      this.step = 3;                 

      this.cd.detectChanges();      
    },
    error: (err) => {
      console.log('OTP error:', err);
      alert('Invalid OTP');
      this.isVerifyingOtp = false;
    }
  });
}
  isResetting = false;

  resetPassword() {
    if (!this.newPassword || this.isResetting) return;

    this.isResetting = true;

    this.auth.resetPassword({
      email: this.email,
      password: this.newPassword
    }).subscribe({
      next: () => {
        alert('Password updated successfully');
        this.router.navigate(['/login']);
      },
      error: () => {
        alert('Failed to update password');
        this.isResetting = false;
      }
    });
  }

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  moveNext(event: any, index: number) {
    if (event.target.value.length === 1) {
      const next = event.target.parentElement.children[index];
      if (next) next.focus();
    }
  }
}

