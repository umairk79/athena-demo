import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function fakeBackendFactory(backend: MockBackend, options: BaseRequestOptions, realBackend: XHRBackend) {
    
    // configure fake backend
    backend.connections.subscribe((connection: MockConnection) => {

        // wrap in timeout to simulate server api call
        setTimeout(() => {

            // authenticate
            if (connection.request.url.endsWith('api/authenticateuser/') && connection.request.method === RequestMethod.Post) {
                console.log("fake-authenticate");
                
                // get parameters from post request
                let params = JSON.parse(connection.request.getBody());

                // create a mock response
                connection.mockRespond(new Response(new ResponseOptions({
                    status: 200,
                    body: {
                        status_code : 200,
                        id: '007',
                        username: params.username,
                        firstName: 'Quantiphi',
                        lastName: 'Analytics',
                        token: 'fake-jwt-token'
                    }
                })));
                return;
            }

             // registration
            if (connection.request.url.endsWith('api/register/') && connection.request.method === RequestMethod.Post) {
                console.log("fake-register");
                
                // get parameters from post request
                let params = JSON.parse(connection.request.getBody());

                // create a mock response
                connection.mockRespond(new Response(new ResponseOptions({
                    status: 200,
                    body: {
                        id: '007',
                        username: 'fake-user',
                        status_code : 200
                    }
                })));
                return;
            }

            // requestademo
            if (connection.request.url.endsWith('api/requestademo/') && connection.request.method === RequestMethod.Post) {
                console.log("fake-requestademo");
                
                // get parameters from post request
                let params = JSON.parse(connection.request.getBody());

                // create a mock response
                connection.mockRespond(new Response(new ResponseOptions({
                    status: 200,
                    body: {
                        id: 'ghsy877hwqsatyfhwjsa',
                        email_id: params.emailId,
                        status_code: 200,
                        token: 'fake-jwt-token'
                    }
                })));
                return;
            }

            // generatevideometadata
            if (connection.request.url.endsWith('api/generatevideometadata/') && connection.request.method === RequestMethod.Post) {
                
                // get parameters from post request
                let params = JSON.parse(connection.request.getBody());

                // create a mock response
                connection.mockRespond(new Response(new ResponseOptions({
                    status: 200,
                    body: {
                        video_url: 'https://storage.googleapis.com/athenas-owl/processed-videos/FRIENDS/S07/E01/episode.mp4',
                        graph_data_url: 'assets/csv/graph_data.csv',
                        screen_time_data_url: 'assets/csv/screen_time.csv',
                        character_location_url: 'assets/csv/Episode1_.csv',
                        status_code: 200,
                        token: 'fake-jwt-token'
                    }
                })));
                return;
            }

            // pass through any requests not handled above
            let realHttp = new Http(realBackend, options);
            let requestOptions = new RequestOptions({
                method: connection.request.method,
                headers: connection.request.headers,
                body: connection.request.getBody(),
                url: connection.request.url,
                withCredentials: connection.request.withCredentials,
                responseType: connection.request.responseType
            });
            realHttp.request(connection.request.url, requestOptions)
                .subscribe((response: Response) => {
                    connection.mockRespond(response);
                },
                (error: any) => {
                    connection.mockError(error);
                });

        }, 500);

    });

    return new Http(backend, options);
};

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: Http,
    useFactory: fakeBackendFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};