import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../_services/user.service';

declare var particlesJS: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  model = {};
  showOnlyMesssage = false;
  signupMessage = '';
  username = '';
  flag: boolean = false; //to show spinner


  ngOnInit() {
    /* Add partical js animation in background */
    particlesJS.load('particles-js', 'assets/particles.json', function () {
      console.log('callback - particles.js config loaded');
    });
  }

  constructor(
    private router: Router,
    private userService: UserService) { }

  form = new FormGroup({
    firstName: new FormControl("", Validators.required),
    lastName: new FormControl("", Validators.required),
    organization: new FormControl("", Validators.required),
    emailId: new FormControl("", Validators.compose([Validators.required, Validators.email, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/)])),
    password: new FormControl("", Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{8,20}$/)])),
    confirmPassword: new FormControl("", Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(20)])),
    sceretAccessKey: new FormControl("", Validators.compose([Validators.required, Validators.minLength(16), Validators.maxLength(16), Validators.pattern(/^[a-zA-Z0-9_]*$/)]))
  });


  signUp() {
    this.userService.create(this.form.value)
      .subscribe(
      data => {
        this.username = data;
        this.showOnlyMesssage = true;
        this.flag = false;
        this.signupMessage = 'User Registration Successful, Your user Name is ' + data;
        // this.router.navigate(['/landing']);
      },
      error => {
        console.log(error);
        this.signupMessage = 'User Registration Failed, Issue = ' + error;
      });
  }

  /*show spinner overlay*/
  showSpinner() {
    this.flag = true;
  }


}
