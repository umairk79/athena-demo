import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { User } from '../_models/index';

@Injectable()
export class UserService {
    constructor(private http: Http) { }

    create(user: User)  : Observable<string> {
        let headers = new Headers();
        let requestOptions = new RequestOptions({ headers: headers });
        return this.http
                        .post('/api/register/', user, requestOptions)
                        .map((response: Response) => {
                            let wsResponse = response.json();
                            if (wsResponse.status_code == 200) {
                                return wsResponse.username;
                            } else {
                                throw new Error('This request has failed, Status Code' + wsResponse.status + ', Message : ' + wsResponse.message);
                            }
                        });
    }


    // private helper methods

    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }
}