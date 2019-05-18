import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Video, DemoPageUrls } from '../_models/index';

@Injectable()
export class ContentRetrievalService {
    constructor(private http: Http) { }

    loadContent(video: Video): Observable<DemoPageUrls> {
        //let apiUrl ='http://retrievecontent.athenasowl.qdatalabs.com/api/retrievecontent/';

        // URL for localhost
        let apiUrl = 'api/generatevideometadata/'  
        let headers = new Headers();
        let requestOptions = new RequestOptions({ headers: headers });
        return this.http
            .post(apiUrl, video, requestOptions)
            .map((response: Response) => {
                let wsResponse = response.json();
                if (wsResponse.status_code == 200) {
                    let demoPageUrls: DemoPageUrls = {
                        videoUrl: wsResponse.video_url,
                        entityAppearanceInfoCsvUrl: wsResponse.character_location_url,
                        graphDataUrl: wsResponse.graph_data_url,
                        screenTimeDataUrl: wsResponse.screen_time_data_url
                    }
                    return demoPageUrls;
                } else {
                    throw new Error('This request has failed, Status Code' + wsResponse.status + ', Message : ' + wsResponse.message);
                }
            });
    }
}