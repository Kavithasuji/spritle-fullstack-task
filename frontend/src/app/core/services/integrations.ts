import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IntegrationService {

  api = 'http://localhost:5000/api/integrations';

  constructor(private http: HttpClient) {}

  connectFreshdesk(data: any) {
    return this.http.post(`${this.api}/freshdesk`, data);
  }

  getIntegration(userId: string) {
    return this.http.get(`${this.api}/${userId}`);
  }

  disconnectFreshdesk(userId: string) {
    return this.http.delete(`${this.api}/freshdesk/${userId}`);
  }

  getTickets(userId: string) {
  return this.http.get(`${this.api}/tickets/${userId}`);
}
getConversations(userId: string, ticketId: number) {
  return this.http.get(
    `${this.api}/conversations/${userId}/${ticketId}`
  );
}

connectHubspot(userId: string) {
  return `${this.api}/hubspot/connect?userId=${userId}`;
}



getRequester(userId: string, requesterId: number) {
  return this.http.get(
    `${this.api}/requester/${userId}/${requesterId}`
  );
}
getHubspotContact(userId: string, email: string) {
  return this.http.get(
    `${this.api}/hubspot/contact/${userId}?email=${email}`
  );
}
getWebhookLogs() {
  return this.http.get<any>('http://localhost:5000/api/webhook/logs');
}

}