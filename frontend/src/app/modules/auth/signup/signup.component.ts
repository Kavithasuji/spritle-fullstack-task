import { Component, NgZone } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class SignupComponent {

  user = { name: '', email: '' };
  otp: string[] = ['', '', '', '', '', ''];

  showOTP = false;
  isSending = false;
  emailExists = false;
  showother = false;
  generatedOtp: string = '';

  constructor(private auth: AuthService, private router: Router, private zone: NgZone) {}

  onEmailChange() {
    if (!this.user.email) return;

    this.auth.checkEmail(this.user.email).subscribe({
      next: (res: any) => {
        this.emailExists = res.exists;
      },
      error: () => {
        this.emailExists = false;
      }
    });
  }

  signup() {
    if (this.emailExists) return;

    this.showOTP = true;

    this.auth.signup(this.user).subscribe({
      next: (res: any) => {
        this.generatedOtp = res.otp;
      },
      error: () => {
        alert("Failed to send OTP");
        this.showOTP = false;
      }
    });
  }

  moveNext(event: any, index: number) {
    const input = event.target;
    if (input.value.length === 1) {
      const next = input.parentElement.children[index];
      if (next) next.focus();
    }
  }

  isVerifying = false;

  verify() {
    if (this.isVerifying) return;

    const finalOtp = this.otp.join('');

    if (finalOtp.length !== 6) {
      alert("Enter complete OTP");
      return;
    }

    this.isVerifying = true;

    this.auth.verifySignup({
      name: this.user.name,
      email: this.user.email,
      otp: finalOtp,
      originalOtp: this.generatedOtp
    }).subscribe({
      next: () => {
        alert("Signup successful Password sent to email");
        this.router.navigate(['/login']);
        this.isVerifying = false;
      },
      error: (err) => {
        alert(err.error?.error || "Invalid OTP");
        this.isVerifying = false;
      }
    });
  }

  goBack() {
    this.showOTP = false;
    this.otp = ['', '', '', '', '', ''];
  }
}