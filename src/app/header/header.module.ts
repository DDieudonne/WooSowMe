import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { HeaderComponent } from './header.component';
import { HomeComponent } from './home/home.component';
import { HeaderRoutingModule } from './header-routing.module';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { MomentModule } from 'angular2-moment';
import { NgProgressModule } from 'ngx-progressbar';
import { ProfilComponent } from './profil/profil.component';
import { WebcamModule } from 'ngx-webcam';
import { MyFilterPipe } from '../search-users.pipe';
import { RequestComponent } from './request/request.component';
import { SnotifyModule } from 'ng-snotify';
import { MessengerComponent } from './messenger/messenger.component';
import { FriendsComponent } from './friends/friends.component';
import { ProfilsComponent } from './profils/profils.component';
import { TagInputModule } from 'ngx-chips';
// ORIGINAL COMPONENT


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
        HttpClientModule,
        HttpModule,
        HeaderRoutingModule,
        MomentModule,
        NgProgressModule,
        WebcamModule,
        SnotifyModule,
        TagInputModule
    ],
    exports: [RouterModule],
    declarations: [
        HeaderComponent,
        HomeComponent,
        ProfilComponent,
        RequestComponent,
        NavbarMenuComponent,
        MessengerComponent,
        FriendsComponent,
        ProfilsComponent,
        MyFilterPipe
    ],
})
export class HeaderModule { }
