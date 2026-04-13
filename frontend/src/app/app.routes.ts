
import { Routes } from '@angular/router';
import { SignupComponent } from './modules/auth/signup/signup.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { DashboardLayout } from './modules/dashboard/layout/dashboard-layout/dashboard-layout';
import { Overview } from './modules/dashboard/pages/overview/overview';
import { Tickets } from './modules/dashboard/pages/tickets/tickets';
import { WebhookLogs } from './modules/dashboard/pages/webhook-logs/webhook-logs';
import { ForgetPassword } from './modules/auth/forget-password/forget-password';
export const routes: Routes = [
  { path: '', redirectTo: 'signup', pathMatch: 'full' },

  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
    { path: 'forgotpassword', component: ForgetPassword },

  

  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      { path: 'overview', component: Overview },
      { path: 'tickets', component: Tickets },
      { path: 'webhooks', component: WebhookLogs },
      
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },



  { path: '**', redirectTo: 'signup' }
];