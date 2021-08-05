import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

const NOTI_TIMEOUT_MILLIS = 5000;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notiIdGen = new NotiIdGenerator();
  private notificationSubject = new Subject<Notification>();

  constructor() {
  }

  info(title: string, text?: string, selfDismissable = true) {
    this.createNoti(NotificationType.INFO, title, text, selfDismissable);
  }

  warn(title: string, text?: string, selfDismissable = true) {
    this.createNoti(NotificationType.WARN, title, text, selfDismissable);
  }

  error(title: string, text?: string, selfDismissable = true) {
    this.createNoti(NotificationType.ERROR, title, text, selfDismissable);
  }

  private createNoti(
    type: NotificationType,
    title: string,
    text: string,
    selfDismissable: boolean
  ) {
    const noti = {
      id: this.notiIdGen.nextId(),
      title,
      text,
      type,
      selfDismissable,
      timeout: NOTI_TIMEOUT_MILLIS
    };
    console.log("Pushing next noti", noti);
    this.notificationSubject.next(noti);
  }

  get(): Observable<Notification> {
    return this.notificationSubject;
  }
}

export class NotiIdGenerator {
  private counter = 1;

  nextId(): string {
    return `jcg_noti_${this.counter++}`;
  }
}

export enum NotificationType {
  INFO,
  WARN,
  ERROR,
}

export interface Notification {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly type: NotificationType;
  readonly selfDismissable: boolean;
  readonly timeout: number;
}
