import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';


@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css'],
  imports: [
    CommonModule,
    RouterModule,
    Sidebar,
    Navbar
  ]
})
export class DashboardLayout {}