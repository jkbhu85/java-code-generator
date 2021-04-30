import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JdbcComponent } from './jdbc/jdbc.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { CopyBtnDirective } from './common/copy-btn.directive';
import { ObjToPsComponent } from './jdbc/obj-to-ps.component';
import { RsToObjComponent } from './jdbc/rs-to-obj.component';

@NgModule({
  declarations: [
    AppComponent,
    JdbcComponent,
    HomeComponent,
    CopyBtnDirective,
    ObjToPsComponent,
    RsToObjComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
