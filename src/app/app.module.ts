import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, BaseRequestOptions } from '@angular/http';

/* App Component & App Routing */
import { AppComponent } from './app.component';
import { routes } from './app.routing';

import { LoginComponent } from './login/index';
import { SignupComponent } from './signup/index';
import { DemoComponent } from './demo/index';
import { NavbarComponent } from './navbar/index';
import { ReloadDemoComponent } from './reload-demo/index';

/* All Service */
import { AuthenticationService, UserService, ContentRetrievalService, ContentListingService } from './_services/index';

/* videogular */
import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';

/*dragula */
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

/* Chart.js */
import { ChartsModule } from 'ng2-charts/ng2-charts';

/* Material Design */
import 'hammerjs'; // Hammer Js
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MdSliderModule } from '@angular/material';

/* Local Storage Module */

// used to create fake backend
import { fakeBackendProvider } from './_helpers/index';
import { MockBackend, MockConnection } from '@angular/http/testing';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DemoComponent,
    ReloadDemoComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    DragulaModule,
    ChartsModule,
    NoopAnimationsModule,
    MdSliderModule,
    routes
  ],
  providers: [
    BaseRequestOptions,
    UserService,
    AuthenticationService,
    ContentRetrievalService,
    ContentListingService,

    // providers used to create fake backend
    fakeBackendProvider,
    MockBackend
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
