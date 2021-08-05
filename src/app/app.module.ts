import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JdbcComponent } from './jdbc/jdbc.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CopyBtnDirective } from './common/copy-btn.directive';
import { ObjToPsComponent } from './jdbc/obj-to-ps.component';
import { RsToObjComponent } from './jdbc/rs-to-obj.component';
import { NotFoundComponent } from './common/not-found.component';
import { AboutComponent } from './common/about.component';
import { NotificationModule } from './notification/notification.module';

@NgModule({
  declarations: [
    AppComponent,
    JdbcComponent,
    HomeComponent,
    CopyBtnDirective,
    ObjToPsComponent,
    RsToObjComponent,
    NotFoundComponent,
    AboutComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NotificationModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
