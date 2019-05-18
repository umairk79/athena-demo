import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/index';
import { Video } from '../_models/index';

declare var particlesJS: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  model: any = {};
  spinnerFlag: boolean = false; //to show spinner
  loginUnsuccessful = false;
  errorMessage: string = '';
  returnUrl: string;
  video: Video = { show: 'FRIENDS', season: 7, episode: 1 };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService) { }

    form = new FormGroup({
    username: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
  });

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();


    /* Add partical js animation in background */
    particlesJS.load('particles-js', 'assets/particles.json', function () {
      console.log('callback - particles.js config loaded');
    });
  }

  ngOnDestroy() {
    this.spinnerFlag = false;
  }

  login() {
    this.authenticationService.login(this.form.value.username, this.form.value.password)
      .subscribe(
      data => {
        /* Checking if the user is logged-in */
        this.authenticationService.isLoggedIn().then((result: boolean) => {
          if (result) {
            this.spinnerFlag = false;
            this.loginUnsuccessful = false;

            /* save default values for a video to load demo page */
            if (typeof (Storage) !== 'undefined') {
              sessionStorage.setItem('show', 'FRIENDS');
              sessionStorage.setItem('series', '7');
              sessionStorage.setItem('episode', '1');
            }

            /* Route to demo page */
            this.router.navigate(['/demo']);
          } else {
            this.spinnerFlag = false;
            this.loginUnsuccessful = true;
            this.errorMessage = 'Wrong Username/Password.';
          }
        })
      },
      error => {
        this.spinnerFlag = false;      
        this.loginUnsuccessful = true;
        console.log(error);
        this.errorMessage = 'Wrong Username/Password.';
      });
  }

  /*show spinner overlay*/
  showSpinner() {
    this.spinnerFlag = true;
  }



}
