import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'], 
})
export class Sidebar implements OnInit {

  user: any = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('user');

      if (data) {
        this.user = JSON.parse(data);
      }
    }
  }

  getInitial() {
    return this.user?.name
      ? this.user.name.charAt(0).toUpperCase()
      : 'U';
  }
}