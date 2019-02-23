import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const Approutes: Routes = [
    { path: 'authentification', loadChildren: './authentification/authentification.module#AuthentificationModule' },
    { path: 'inscription', loadChildren: './register/register.module#RegisterModule' },
    { path: 'app', loadChildren: './header/header.module#HeaderModule' },
    { path: '**', redirectTo: 'authentification' },
];

@NgModule({
    imports: [RouterModule.forRoot(Approutes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }