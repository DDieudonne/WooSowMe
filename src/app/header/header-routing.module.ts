import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

const routes: Routes = [
    {
        path: 'application', component: HeaderComponent,
        children: [
            { path: 'acceuil', loadChildren: './home/home.module#HomeModule' },
            { path: 'profil', loadChildren: './profil/profil.module#ProfilModule' },
            { path: 'profil', loadChildren: './profil/profil.module#ProfilModule' },
            { path: 'demandes&notifications', loadChildren: './request/request.module#RequestModule' },
            { path: 'conversations', loadChildren: './messenger/messenger.module#MessengerModule' },
            { path: 'friends', loadChildren: './friends/friends.module#FriendsModule' },
            { path: 'profils/:id', loadChildren: './profils/profils.module#ProfilsModule' },
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HeaderRoutingModule { }