import { Component, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IntegrationService } from '../../../../core/services/integrations';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './integrations.html',
  styleUrls: ['./integrations.css'],
})
export class Integrations {

  user: any;
  token: string | null = '';
  isFreshdeskConnected = false;
  showFreshdeskModal = false;
  domain = '';
  apiKey = '';

  constructor(private integrationService: IntegrationService, private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object   // ✅ ADD THIS
  ) { }

  ngOnInit() {
    const userData = localStorage.getItem('user');

    this.user = userData ? JSON.parse(userData) : null;
    this.token = localStorage.getItem('token');


    if (this.user?.id) {
      this.loadIntegrationStatus();
    }
  }
  loadIntegrationStatus() {
    this.integrationService.getIntegration(this.user.id).subscribe({
      next: (res: any) => {
        const data = res?.data;
        this.isFreshdeskConnected = !!data?.freshdesk?.apiKey;
        this.isHubspotConnected = !!data?.hubspot?.accessToken;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load integration', err);
      }
    });
  } openFreshdeskModal() {
    this.showFreshdeskModal = true;
  }

  closeModal() {
    this.showFreshdeskModal = false;
  }

  connectFreshdesk() {
    if (!this.domain || !this.apiKey) return;

    if (!this.user) {
      console.error('User not found');
      return;
    }
    const payload = {
      domain: this.domain,
      apiKey: this.apiKey,
      userId: this.user.id
    };


    this.integrationService.connectFreshdesk(payload).subscribe({
      next: () => {
        this.isFreshdeskConnected = true;
        this.showFreshdeskModal = false;

        this.showToast('Freshdesk connected successfully');
      },
      error: () => {
        this.showToast('Failed to connect Freshdesk');
      }
    });
  }



  showToast(message: string) {
    alert(message);
  }

  isHubspotConnected = false;
  showHubspotModal = false;
  openHubspotModal() {
    this.showHubspotModal = true;
  }

  closeHubspotModal() {
    this.showHubspotModal = false;
  }
  connectHubspot() {
    if (!this.user?.id) {
      console.error('User not found');
      return;
    }

    this.showHubspotModal = false;
    const url = this.integrationService.connectHubspot(this.user.id);


    window.location.href = url;
  }

  disconnectFreshdesk() {
    this.isFreshdeskConnected = false;
    this.domain = '';
    this.apiKey = '';
  }


  disconnectHubspot() {
    if (!this.user?.id) return;
    this.isHubspotConnected = false;
    this.showToast('HubSpot disconnected ');
  }
}