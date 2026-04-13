import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {

  user: any = {};

  ngOnInit() {
    const data = localStorage.getItem('user');

    if (data) {
      this.user = JSON.parse(data);
    }
  }

  getInitial() {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : 'U';
  }
}