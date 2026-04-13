import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  api = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  signup(payload: any) {
    return this.http.post(`${this.api}/signup`, payload);
  }

  checkEmail(email: string) {
    return this.http.post(`${this.api}/check-email`, { email });
  }

  verifySignup(data: any) {
    return this.http.post(`${this.api}/verify-signup`, data);
  }

login(data: any) {
  return this.http.post(`${this.api}/login`, data);
}

  verifyLogin(data: any) {
    return this.http.post(`${this.api}/verify-login`, data);
  }
  forgotPassword(data: any) {
  return this.http.post(`${this.api}/forgot-password`, data);
}

verifyForgotOtp(data: any) {
  return this.http.post(`${this.api}/verify-forgot-otp`, data);
}

resetPassword(data: any) {
  return this.http.post(`${this.api}/reset-password`, data);
}
}