import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { DemoComponent } from './demo/demo.component';
import { ReloadDemoComponent } from './reload-demo/reload-demo.component';

export const routing: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: SignupComponent },
    { path: 'demo', component: DemoComponent },
    { path: 'reload-demo', component: ReloadDemoComponent },
    
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routes: ModuleWithProviders = RouterModule.forRoot(routing);