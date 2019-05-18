import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
    // private authUrl = 'http://login.athenasowl.qdatalabs.com/api/authenticate/';

    // For Local use only
     private authUrl = '/api/authenticateuser/';

    constructor(private http: Http) { }

    login(username: string, password: string): Observable<void> {
        let body = { username: username, password: password };
        let bodyString = JSON.stringify(body); // Stringify payload
        let headers = new Headers({ 'Content-Type': 'application/json' }); // Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option

        return this.http.post(this.authUrl, bodyString, options)
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let user = response.json();

                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                } else {
                    throw new Error('This request has failed, Status Code' + response.json().status + ', Message : ' + response.json().message);
                }
            });
    }

    /** Remove user from local storage to log user out */
    logout(): Promise<void> {
        localStorage.removeItem('currentUser');
        if (typeof (Storage) !== 'undefined') {
            sessionStorage.removeItem('show');
            sessionStorage.removeItem('series');
            sessionStorage.removeItem('episode');
        }
        return;
    }

    isLoggedIn(): Promise<boolean> {
        if (localStorage.getItem('currentUser')) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
}