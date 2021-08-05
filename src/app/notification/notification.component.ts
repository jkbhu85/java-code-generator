import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Notification, NotificationType } from './noti-provider.service';
import { Toast } from "bootstrap";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styles: [
  ]
})
export class NotificationComponent implements OnInit {

  @Input() notification: Notification;
  @Output() close: EventEmitter<Notification> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    console.log("Showing notification with id:", this.notification.id);
    setTimeout(() => {
      const elem = document.querySelector('#' + this.notification.id);
      if (elem) {
        const toast = new Toast(elem);
        toast.show();
      }
    }, 0);
  }

  getCssClass(): string {
    if (this.notification.type === NotificationType.ERROR) {
      return "jcg-noti jcg-noti-error";
    } else if (this.notification.type === NotificationType.WARN) {
      return "jcg-noti jcg-noti-warn";
    } else {
      return "jcg-noti jcg-noti-info"
    }
  }

  onClose() {
    this.close.emit(this.notification);
  }

}
