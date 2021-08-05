import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  Notification,
  NotificationService
} from './notification/noti-provider.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  subscription: Subscription;

  constructor(private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.subscription = this.notificationService.get().subscribe(
      (noti) => this.onReceiveNoti(noti));
    console.log("subscription complete: ", this.subscription !== null);
  }

  private onReceiveNoti(notification: Notification) {
    console.log("New notification received");
    this.notifications.push(notification);
    if (notification.selfDismissable) {
      setTimeout(() => this.onRemoveNoti(notification), notification.timeout);
    }
  }

  onRemoveNoti(notification: Notification) {
    const idx = this.findIndex(notification);
    if (idx > -1) {
      this.notifications.splice(idx, 1);
    }
  }

  private findIndex(notification: Notification): number {
    for (let i = 0; i < this.notifications.length; i++) {
      if (this.notifications[i] === notification) return i;
    }
    return -1;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
