import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// ORIGINAL COMPONENT
import { RegisterComponent } from './register.component';
import { SnotifyModule } from 'ng-snotify';

const routes: Routes = [{ path: '', component: RegisterComponent }]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        SnotifyModule,
    ],
    exports: [RouterModule],
    declarations: [RegisterComponent]
})
export class RegisterModule { }