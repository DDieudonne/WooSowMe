import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { AngularFireAuth } from 'angularfire2/auth';
// ORIGINAL COMPONENT
import { AuthentificationComponent } from './authentification.component';
import { environment } from '../../environments/environment';

// SERVICES

const routes: Routes = [{ path: '', component: AuthentificationComponent }]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
        RouterModule.forChild(routes),
        HttpClientModule,
        HttpModule,
    ],
    exports: [RouterModule],
    declarations: [AuthentificationComponent],
})
export class AuthentificationModule { }
