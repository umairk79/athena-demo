import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ReuquestADemoModal } from '../_models/index';

@Injectable()
export class RequestADemoService {
    constructor(private http: Http) { }

    create(demo: ReuquestADemoModal): Observable<string> {
        let apiUrl = '/api/requestademo/';
        let headers = new Headers();
        let requestOptions = new RequestOptions({ headers: headers });
        return this.http
            .post(apiUrl, demo, requestOptions)
            .map((response: Response) => {
                let wsResponse = response.json();
                if (wsResponse.status_code == 200) {
                    return wsResponse.email_id;
                } else {
                    throw new Error('This request has failed, Status Code' + wsResponse.status + ', Message : ' + wsResponse.message);
                }
            });
    }
}