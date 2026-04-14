import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IntegrationService } from '../../../../core/services/integrations';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket.html',
  styleUrl: './ticket.css',
})
export class Ticket implements OnInit {

  user: any;
  tickets: any[] = [];
  filteredTickets: any[] = [];

  isConnected = false;
  loading = false;
  selectedFilter = 'all';
  selectedTicket: any = null;
  isConversationOpen = false;
  conversations: any[] = [];
  convLoading = false;
  isHubspotConnected = false;

  constructor(
    private integrationService: IntegrationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) : null;

    if (this.user?.id) {
      this.checkIntegrationAndLoadTickets();
    } else {
      console.error('User ID not found');
    }
  }

  /* ---------------- CHECK INTEGRATION ---------------- */
  checkIntegrationAndLoadTickets() {
    this.loading = true;
    this.cdr.detectChanges();

    this.integrationService.getIntegration(this.user.id).subscribe({
      next: (res: any) => {
        const data = res.data;

        if (data?.freshdesk?.apiKey) {
          this.isConnected = true;
          this.loadTickets();
        } else {
          this.isConnected = false;
          this.loading = false;
        }

        this.isHubspotConnected = !!data?.hubspot?.accessToken;

        console.log("HubSpot Connected:", this.isHubspotConnected);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(' Integration error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTickets() {
    this.integrationService.getTickets(this.user.id).subscribe({
      next: (res: any) => {
        this.tickets = Array.isArray(res) ? res : (res.data || []);
        this.filterTickets('all');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ticket fetch error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterTickets(value: string) {
    this.selectedFilter = value;

    if (value === 'all') {
      this.filteredTickets = [...this.tickets];
    } else {
      this.filteredTickets = this.tickets.filter(t =>
        this.getStatusLabel(t.status).toLowerCase() === value.toLowerCase()
      );
    }
    this.cdr.detectChanges();
  }

  toggleConversation(ticket: any) {
    if (this.selectedTicket?.id === ticket.id && this.isConversationOpen) {
      this.closeConversation();
      return;
    }

    this.selectedTicket = ticket;
    this.isConversationOpen = true;
    this.conversations = [];
    this.convLoading = true;
    this.cdr.detectChanges();

    this.integrationService.getConversations(this.user.id, ticket.id).subscribe({
      next: (res: any) => {
        console.log('💬 Conversations raw:', res); // debug — check structure
        // ✅ handle array directly OR nested in res.data
        this.conversations = Array.isArray(res) ? res : (res.data || []);
        this.convLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(' Conversation error', err);
        this.convLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeConversation() {
    this.isConversationOpen = false;
    this.selectedTicket = null;
    this.conversations = [];
    this.cdr.detectChanges();
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 2: return 'Open';
      case 3: return 'Pending';
      case 4: return 'Resolved';
      case 5: return 'Closed';
      default: return 'Open';
    }
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Urgent';
      default: return 'Low';
    }
  }

  getStatusClass(status: number): string {
    return this.getStatusLabel(status).toLowerCase();
  }

  getPriorityClass(priority: number): string {
    return this.getPriorityLabel(priority).toLowerCase();
  }
  hubspotContact: any = null;
  showHubspotModal = false;
  requesterDetails: any = null;
  hubspotLoading = false;


  viewHubspotDetails(ticket: any) {
    if (!this.isHubspotConnected) {
      alert('⚠ Please integrate HubSpot to view CRM details');
      return;
    }
    const requesterId = ticket.requester_id;
    if (!requesterId) {
      alert(' No requester found');
      return;
    }
    this.showHubspotModal = true;
    this.hubspotLoading = true;

    this.requesterDetails = null;
    this.hubspotContact = null;

    this.integrationService.getRequester(this.user.id, requesterId).subscribe({
      next: (res: any) => {
        this.requesterDetails = res.data;
        const email = res?.data?.email;
        if (!email) {
          this.hubspotLoading = false;
          return;
        }
        this.integrationService
          .getHubspotContact(this.user.id, email)
          .subscribe({
            next: (hub: any) => {
              this.hubspotContact = hub?.data || null;
              this.hubspotLoading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error(" HubSpot error:", err);

              if (err?.error?.message?.toLowerCase().includes('token') ||
                err?.status === 401) {

                alert('⚠ HubSpot token expired. Please reconnect HubSpot.');

                this.isHubspotConnected = false;
              }
              this.hubspotContact = null;
              this.hubspotLoading = false;
              this.cdr.detectChanges();
            }
          });
      },
      error: (err) => {
        console.error(" Requester error:", err);

        this.hubspotLoading = false;
      }
    });
  }
  closeHubspotModal() {
    this.showHubspotModal = false;
  }
}