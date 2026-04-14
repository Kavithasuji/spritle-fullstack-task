import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntegrationService } from '../../../../core/services/integrations';

@Component({
  selector: 'app-webhook-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './webhook-logs.html',
  styleUrls: ['./webhook-logs.css']
})
export class WebhookLogs implements OnInit {

  logs: any[] = [];
  loading = false;

  constructor(
    private integrationService: IntegrationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLogs();

    setInterval(() => {
      this.loadLogs();
    }, 5000);
  }

  loadLogs() {
    this.loading = true;

    this.integrationService.getWebhookLogs().subscribe({
      next: (res: any) => {
        this.logs = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}