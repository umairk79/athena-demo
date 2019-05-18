import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ListContentRequest, DemoPageUrls } from '../_models/index';

@Injectable()
export class ContentListingService {
    constructor(private http: Http) { }

    listContent(video: ListContentRequest): Observable<string> {
        // let apiUrl = 'http://listcontent.athenasowl.qdatalabs.com/api/listcontent/';

          let apiUrl = 'api/listvideos/'        // URL for localhost      
        let headers = new Headers();
        let requestOptions = new RequestOptions({ headers: headers });
        return this.http
            .post(apiUrl, video, requestOptions)
            .map((response: Response) => {
                let wsResponse = response.json();
                if (wsResponse.status_code == 200) {
                    return wsResponse;
                } else {
                    throw new Error('This request has failed, Status Code' + wsResponse.status + ', Message : ' + wsResponse.message);
                }
            });
    }
}