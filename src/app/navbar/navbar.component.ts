import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'navbar.component.html',
    styleUrls: ['navbar.component.css'],
    selector: 'navbar'
})

export class NavbarComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService) { }

    ngOnInit() { }

    userLogout() {
        // reset login status
        this.authenticationService.logout();
        
        window.location.href = 'http://athenasowl.tv';
    }

    ngOnDestroy() {
        // window.location.href = 'http://athenasowl.tv';
    }
}