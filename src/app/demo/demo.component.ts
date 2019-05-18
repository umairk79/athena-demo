import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { AuthenticationService, ContentRetrievalService, ContentListingService } from '../_services/index';
import { Video, ListContentRequest, Episode, DemoPageUrls } from '../_models/index';
import { VgAPI } from 'videogular2/core';           //Videogular
import { DragulaService } from 'ng2-dragula/ng2-dragula';       //Dragula 

@Component({
  selector: 'app-demo',
  templateUrl: 'demo.component.html',
  styleUrls: ['demo.component.css'],
  viewProviders: [DragulaService],
})

export class DemoComponent implements OnInit {
  @ViewChild('closeBtn') closeBtn: ElementRef;
  spinnerFlag: boolean = false; //to show spinner
  playlistEpisodes: Episode[] = [];

  //  MD-SLIDER(Months Counting)
  slider_autoTicks = false;
  slider_invert = false;
  slider_max = 10;
  slider_min = 4;
  slider_showTicks = false;
  slider_step = 1;
  slider_thumbLabel = false;
  slider_vertical = false;
  slider_value = 10;
  slider_disabled = false;
  many: false;

  // LINE CHART
  public lineChartData2: Array<any> = [
    { data: [], label: '' },
    { data: [], label: '' },
  ];
  public lineChartData: Array<any> = [
    { data: [], label: '' },
    { data: [], label: '' },
  ];
  public lineChartLabels: Array<any> = [];
  public lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    scales: {
      xAxes: [{
        display: true
      }],
      yAxes: [{
        display: true
      }],
    },
    animation: {
      easing: 'easeOutQuint'
    }
  };
  public lineChartColors: Array<any> = [
    { // dark blue primary(Selected Entity)
      backgroundColor: 'rgba(0,0,0,0)',
      borderColor: '#246dff',
      pointBackgroundColor: 'rgba(0,0,0,0)',
      pointBorderColor: 'transparent',
      pointHoverBackgroundColor: 'transparent',
      pointHoverBorderColor: 'rgba(0,0,0,0)'

    },
    { // light blue selected option to compare
      backgroundColor: '#92B7FC',
      borderColor: '#92B7FC',
      pointBackgroundColor: 'transparent',
      pointBorderColor: 'transparent',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#92B7FC'
    }
  ];
  public lineChartLegend: boolean = false;
  public lineChartType: string = 'line';

  // BAR CHART
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      enabled: false
    },
    scales: {
      xAxes: [{
        display: false,
        ticks: {
        }
      }],
      yAxes: [{
        display: false
      }],
    },
  };
  public barChartLabels: string[] = [];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = false;

  public barChartInitialData: any[] = [
    { data: [], label: '' }
  ];

  public barChartData: any[] = [
    { data: [], label: '' }
  ];

  public barChartColors: Array<any> = [
    {
      backgroundColor: '#92B7FC',
      borderColor: '#92B7FC',
      pointBackgroundColor: 'transparent',
      pointBorderColor: 'transparent',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#92B7FC'
    }
  ];

  api: VgAPI;     //Videogular API

  video: Video;
  dempPageUrl: DemoPageUrls;

  previousSec: number;        //Timer value just before the current second
  currentSec: number;         //The current second(Video Timer)
  totalSecs: number;          //Total seconds in the video
  monthsCount: number;        //Months count for slider

  entities: entity[] = [];         //All Entities in the video and their information
  entitiesMap: number[] = [];      //Mapping of Sorted position wrt Initial indexes(not used:for Sorting)
  durationCount: number[] = [];   //Duration presence of each Entity(not used;for sorting)
  csvEntityData: any;
  csvEntityAllLines: any[] = [];
  csvEntityHeader: any[] = [];

  entityDetails: { name: string, description: string, imageUrl: string, realName: string }[] = [];
  objects: { time: number, name: string[], percentage: number[], caption: string, caption_prob: any }[] = []; //Objects array
  objectsToShow: { name: string, percentage: number }[] = [];    //Objects per second

  description: string;  //description string
  episodes: number[] = [];

  options = { metric: [], market: [], target: [], pairs: [], entities: [] };
  optionFilter = { metric: '', market: '', target: '', pairs: '', entities: '' };
  gaps = { metric: 0, market: 0, target: 0, pairs: 0, entities: 0 };

  graphData: any;
  graphDataAllLines: any[] = [];
  graphDataHeader: any[] = [];
  barChart: barChart[] = [];

  selectedEnitityIndex: number;   //Current selected Entity Index
  selectedEntity: any;            //The selected entity
  timer: number;                  //Timer for flipping right side data
  timerFlag: number;              //Flag for stopping and starting flipping
  flipTimeInterval: number;       //Interval for flipper
  pageFlag: boolean;
  index = 0;

  constructor(private http: Http,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private contentRetrievalService: ContentRetrievalService,
    private contentListingService: ContentListingService) {

    //DECLARATIONS
    this.spinnerFlag = false;
    this.pageFlag = false;
    this.previousSec = 999999;
    this.monthsCount = 10;
    this.timer = 0;
    this.timerFlag = 1;
    this.flipTimeInterval = 15;

    this.selectedEnitityIndex = 0;

    // Triggers every second(used for timer)
    Observable.interval(1000 * 1).takeWhile(() => true).subscribe(() => this.flipTimer());
  }

  // Function Triggered when page is reloaded
  ngOnInit() {
    /* if user is logged-in */
    this.authenticationService.isLoggedIn().then((result: boolean) => {
      if (result) {
        /* check session storage for video data to load demo page */
        if (typeof (Storage) !== 'undefined') {
          let show: string = sessionStorage.getItem('show');
          let series: string = sessionStorage.getItem('series');
          let episode: string = sessionStorage.getItem('episode');

          /* load demo page for given video or else load 1st episode of 1st season of FRIENDS */
          if (show && series && episode) {
            this.video = { show: show, season: +series, episode: +episode };
          } else {
            this.video = { show: 'FRIENDS', season: 1, episode: 1 };
          }
        } else {
          /* default case : load 1st episode of 1st season of FRIENDS */
          this.video = { show: 'FRIENDS', season: 1, episode: 1 };
        }

        /* load demo page */
        this.spinnerFlag = false;
        this.retrieveContentData(this.video);
      } else {
        /* if user is not logged-in then Route to login page */
        this.router.navigate(['/login']);
      }
    })

  }

  retrieveContentData(pageVideo: Video) {
    this.contentRetrievalService.loadContent(pageVideo)
      .subscribe(
      data => {
        this.dempPageUrl = data;
        this.readInitialData(this.dempPageUrl.entityAppearanceInfoCsvUrl);
        this.readGraphData(this.dempPageUrl.graphDataUrl);
        this.readScreenTimeData(this.dempPageUrl.screenTimeDataUrl);
      },
      error => {
      });

  }

  onPlayerReady(api: VgAPI) {
    this.api = api;

    this.api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        // Set the video to the beginning
        this.api.getDefaultMedia().currentTime = 0;
      }
    );
    this.api.getDefaultMedia().subscriptions.timeUpdate.subscribe(
      () => {

        this.currentSec = Math.floor(this.api.getDefaultMedia().currentTime);
        if (this.previousSec != this.currentSec && this.previousSec != 999999) {
          this.extractData(this.currentSec);
          this.extractObjects(this.currentSec)
        }
        this.previousSec = this.currentSec;
      }
    );
    this.api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        if (typeof (Storage) !== 'undefined') {
          let show: string = sessionStorage.getItem('show');
          let series: string = sessionStorage.getItem('series');
          let episode: string = sessionStorage.getItem('episode');

          /* load demo page for given video or else load 1st episode of 1st season of FRIENDS */
          if (show && series && episode) {
            if(episode=='10'){
              episode='1';
            }
            else{
              episode = (+episode +1) +'';
            }
            this.video = { show: show, season: +series, episode: +episode };
          } else {
            this.video = { show: 'FRIENDS', season: 1, episode: 1 };
          }
        } else {
          /* default case : load 1st episode of 1st season of FRIENDS */
          this.video = { show: 'FRIENDS', season: 1, episode: 1 };
        }
        this.reloadPage(this.video);
      }
    )
  }


  readInitialData(entityAppearanceInfoCsvUrl: string) {
    this.http.get(entityAppearanceInfoCsvUrl)
      .subscribe(
      data => {
        this.extractInitialData(data);
      }
      );
  }

  readGraphData(graphDataUrl: string) {
    this.http.get(graphDataUrl)
      .subscribe(
      data => {
        this.extractGraphData(data);
      }
      );
  }

  readScreenTimeData(screenTimeDataUrl: string) {
    this.http.get(screenTimeDataUrl)
      .subscribe(
      data => {
        this.extractScreenTimeData(data);
      }
      );
  }

  private extractInitialData(res: Response) {
    this.csvEntityData = res['_body'];
    this.csvEntityAllLines = this.csvEntityData.split(/\r\n|\n/);
    this.csvEntityHeader = this.csvEntityAllLines[0].split(',');
    this.totalSecs = this.csvEntityAllLines.length - 1;
    let prev = 99;

    for (let entity_count = 5; entity_count < 14; entity_count++) {     //here 1 and 10 are the first and last entity coloumn
      let duration_count = 0;
      let present: any[] = [];
      present.length = 0;
      present.push(0);
      let index = 0;

      for (let line_no = 0; line_no < this.csvEntityAllLines.length; line_no++) {
        let data = this.csvEntityAllLines[line_no].split(',');
        if (data[entity_count] == 1) {
          if (prev == 0) {
            present.push(0);
            index++;
          }
          present[index]++;
          duration_count++;
          prev = 1;
        }
        if (data[entity_count] == 0) {
          if (prev == 1) {
            present.push(0);
            index++;
          }
          present[index]--;
          duration_count--;
          prev = 0;
        }
      }
      this.entities.push({
        name: this.csvEntityHeader[entity_count],
        availabilityLater: present,
        availabilityPresent: [],
        flag: 1
      });
      this.durationCount.push(duration_count);
      this.entitiesMap.push(entity_count - 1);
    }
    this.selectedEntity = this.entities[0].name;
    for (let line_no = 1; line_no < this.csvEntityAllLines.length; line_no++) {
      let data = this.csvEntityAllLines[line_no].split(',');
      if (typeof data[14] == "undefined") {
        continue;
      }
      let objects = data[14].split(';');
      let objects_name = [];
      let objects_percentage = [];
      let description;
      let caption_rounded;
      for (let j = 0; j < objects.length; j++) {
        if (objects[j].split('_')[1] >= 0.5) {
          objects_name.push(objects[j].split('_')[0]);
          objects_percentage.push(objects[j].split('_')[1]);
        }
        let captionPercentage: number = data[16];
        captionPercentage *= 100;
        caption_rounded = captionPercentage.toFixed(4)
        description = data[15];
      }
      let length = objects_name.length;
      for (let i = (length - 1); i >= 0; i--) {           //Bubble Sort
        for (let j = (length - i); j > 0; j--) {
          if (objects_percentage[j] > objects_percentage[j - 1]) {
            let swap: any = objects_percentage[j];
            objects_percentage[j] = objects_percentage[j - 1];
            objects_percentage[j - 1] = swap;

            swap = objects_name[j];
            objects_name[j] = objects_name[j - 1];
            objects_name[j - 1] = swap;
          }
        }
      }
      this.objects.push({
        time: data[0],
        name: objects_name,
        percentage: objects_percentage,
        caption: description,
        caption_prob: caption_rounded
      });
    }
  }

  private extractGraphData(res: Response) {
    this.graphData = res['_body'];
    this.graphDataAllLines = this.graphData.split(/\r\n|\n/);
    this.graphDataHeader = this.graphDataAllLines[0].split(',');

    let i = 1;
    while (true) {
      let episode = this.graphDataAllLines[i].split(',')[2];
      if (this.episodes.length == 0) {
        this.episodes.push(episode);
      }
      else {
        if (episode == this.episodes[0]) {
          break;
        }
        this.episodes.push(episode);
      }
      i++;
    }
    let episode_count = this.episodes.length;
    let gap = episode_count;
    let gaps: number[] = [];
    let options: { option: any[] }[] = [];
    for (let j = 7, k = 0; j > 4; j-- , k++) {
      options.push({
        option: []
      });
      let i = 1;
      while (true) {
        let option = this.graphDataAllLines[i].split(',')[j];
        if (options[k].option.length == 0) {
          options[k].option.push(option);
        }
        else {
          if (option == options[k].option[0]) {
            break;
          }
          options[k].option.push(option);
        }
        i += gap;
      }
      gap = gap * options[k].option.length;
    }
    this.options.target = options[0].option;
    this.options.market = options[1].option;
    this.options.metric = options[2].option;
    i = 1;
    while (true) {
      if (i > this.graphDataAllLines.length - 1) {
        break;
      }
      let entity = this.graphDataAllLines[i].split(',')[3];
      let entity_type = this.graphDataAllLines[i].split(',')[4];
      if (entity_type == "Location" || entity_type == "Character") {
        this.options.entities.push(entity);
      }
      else {
        this.options.pairs.push(entity);
      }
      i += gap;
    }
    this.optionFilter.entities = this.options.entities[0];
    this.optionFilter.market = this.options.market[0];
    this.optionFilter.metric = this.options.metric[0];
    this.optionFilter.pairs = this.options.pairs[0];
    this.optionFilter.target = this.options.target[0];

    for (let i = 0; i < this.episodes.length; i++) {
      this.lineChartLabels.push("Ep" + this.episodes[i]);
    }

    this.changeBothGraphs(this.optionFilter.pairs, this.optionFilter.entities, this.optionFilter.metric, this.optionFilter.market, this.optionFilter.target);
    this.pageFlag = true;
  }

  private extractScreenTimeData(res: Response) {
    let screenData = res['_body'];
    let screenDataAllLines = screenData.split(/\r\n|\n/);
    let screenDataHeader = screenDataAllLines[0].split(',');

    let i = 1;
    while (true) {
      let entity = screenDataAllLines[i].split(',');
      if (this.entityDetails.length == 0) {
        this.entityDetails.push({
          name: entity[0],
          description: entity[6],
          imageUrl: entity[4],
          realName: entity[5]
        });
      }
      else {
        if (entity[0] == this.entityDetails[0].name) {
          break;
        }
        this.entityDetails.push({
          name: entity[0],
          description: entity[6],
          imageUrl: entity[4],
          realName: entity[5]
        });
      }
      i++;
    }
    this.barChartInitialData.length = 0;
    let episode_length = 10;
    let some: any[] = [{ data: [], label: '' }];
    some.length = 0;
    this.barChartInitialData.length = 0;

    for (i = 0; i < this.entityDetails.length; i++) {
      let barData = [];
      let l = 0;
      for (let k = 0; k < episode_length; k++) {
        barData.push(screenDataAllLines[i + 1 + l].split(',')[7]);
        l += this.entityDetails.length;
      }

      let clone = JSON.parse(JSON.stringify(this.barChartData));
      clone[0].data = barData;
      clone[0].label = screenDataAllLines[i + 1].split(',')[0];
      this.barChartData = clone;

      this.barChartInitialData.push({
        data: barData,
        label: screenDataAllLines[i + 1].split(',')[0]
      })

      this.barChart.push({
        barChartData: this.barChartData
      })
    }
    for (i = 0; i < episode_length; i++) {
      this.barChartLabels.push("Ep" + i);
    }
    for( i=0;i<this.barChart.length;i++){
      for( let j=0;j<this.barChart.length;j++){
        if( this.entities[i].name == this.barChart[j].barChartData[0].label){
          let swap = this.barChart[i];
          this.barChart[i] = this.barChart[j];
          this.barChart[j] = swap;
          break;
        }
      }
    }
  }

  extractObjects(currentSec: number) {
    this.objectsToShow = [];      //Empty ever second
    for (let i = 0; i < this.objects[currentSec].name.length; i++) {
      this.objectsToShow.push({
        name: this.objects[currentSec].name[i],
        percentage: this.objects[currentSec].percentage[i]
      });
    }
    //this.description = this.objects[currentSec].caption + " [ " + this.objects[currentSec].caption_prob.toString() + ' ]';
    this.description = this.objects[currentSec].caption;
  }

  private extractData(currentSec: number) {

    let prev = 99;

    for (let entity_count = 5; entity_count < 14; entity_count++) {    //here 1 and 10 are the first and last entity coloumn
      let present: any[] = [];
      present.length = 0;
      present.push(0);
      let index = 0;

      if (currentSec >= this.totalSecs) {
        currentSec = this.totalSecs;
      }

      for (let line_no = 0; line_no < currentSec; line_no++) {
        let data = this.csvEntityAllLines[line_no].split(',');

        if (data[entity_count] == 1) {
          if (prev == 0) {
            present.push(0);
            index++;
          }
          present[index]++;
          prev = 1;
        }
        if (data[entity_count] == 0) {
          if (prev == 1) {
            present.push(0);
            index++;
          }
          present[index]--;
          prev = 0;
        }
        if (line_no == this.csvEntityAllLines.length - 1) {
        }
      }

      let later: any[] = [];
      later.length = 0;
      later.push(0);
      let ind = 0;
      prev = 99;

      for (let line_no = currentSec; line_no < this.csvEntityAllLines.length; line_no++) {
        let data = this.csvEntityAllLines[line_no].split(',');


        if (data[entity_count] == 1) {
          if (prev == 0) {
            later.push(0);
            ind++;
          }
          later[ind]++;
          prev = 1;
        }
        if (data[entity_count] == 0) {
          if (prev == 1) {
            later.push(0);
            ind++;
          }
          later[ind]--;
          prev = 0;
        }
      }
      this.entities[entity_count - 5].availabilityLater = later;
      this.entities[entity_count - 5].availabilityPresent = present;

    }
  }

  // Hides entity on clicking the cross button
  hideEntity(i: number) {
    this.entities[i].flag = 0;
  }

  selectEntity(index: number) {
    if (this.timerFlag == 1) {
      this.timerFlag = 0;
    }
    else {
      if (index == this.selectedEnitityIndex) {
        this.timerFlag = 1;
        this.timer = 0;
      }
    }
    this.selectedEnitityIndex = index;
    this.selectedEntity = this.entities[this.selectedEnitityIndex].name;
    if (this.selectedEntity == this.optionFilter.entities) {
      let c = this.options.entities.indexOf(this.optionFilter.entities);
      if (c == this.options.entities.length - 1) {
        c = 0;
      }
      c++;
      this.optionFilter.entities = this.options.entities[c];
      this.changeGraph2(this.optionFilter.entities, this.optionFilter.metric, this.optionFilter.market, this.optionFilter.target);
    }
    this.changeSelected(this.selectedEntity, this.optionFilter.metric, this.optionFilter.market, this.optionFilter.target);
    this.changeSelected(this.selectedEntity, this.optionFilter.metric, this.optionFilter.market, this.optionFilter.target);
  }

  changeMonthsCount() {
    for (let j = 0; j < this.entityDetails.length; j++) {
      let data = [];
      for (let i = this.barChartInitialData[j].data.length - this.monthsCount; i < this.barChartInitialData[j].data.length; i++) {
        data.push(this.barChartInitialData[j].data[i]);
      }
      let clone = JSON.parse(JSON.stringify(this.barChartData));
      clone[0].data = data;
      clone[0].label = this.barChartInitialData[j].label;
      this.barChart[j].barChartData = clone;
    }
    this.barChartLabels.length = 0;
    for (let i = this.episodes.length; i > this.episodes.length - this.monthsCount; i--) {
      this.barChartLabels.push('Ep' + i);      //push labels
    }
  }

  //  Timer to change right side data(every flip time interval(initialized as flipTimeInterval) seconds)
  flipTimer() {
    if (this.timerFlag == 1) {
      this.timer++;
    }
    if (this.timer == this.flipTimeInterval) {
      this.selectedEnitityIndex++;
      if (this.selectedEnitityIndex == 9)
        this.selectedEnitityIndex = 0;
      this.selectedEntity = this.entities[this.selectedEnitityIndex].name;
      if (this.selectedEntity == this.optionFilter.entities) {
        let c = this.options.entities.indexOf(this.optionFilter.entities);
        if (c == this.options.entities.length - 1) {
          c = 0;
        }
        c++;
        this.optionFilter.entities = this.options.entities[c];
        this.changeGraph2(this.optionFilter.entities, this.optionFilter.metric, this.optionFilter.market, this.optionFilter.target);
      }
      this.changeSelected(this.selectedEntity, this.optionFilter.metric, this.optionFilter.market, this.optionFilter.target);
      this.timer = 0;
    }
  }

  // depends on data
  onChangeObj(newObj: any, filter: string, graphFlag: number) {
    if (filter == 'entities') {
      this.optionFilter.entities = newObj;
    }
    if (filter == 'pairs') {
      this.optionFilter.pairs = newObj;
    }
    if (filter == 'metric') {
      this.optionFilter.metric = newObj;
    }
    if (filter == 'market') {
      this.optionFilter.market = newObj;
    }
    if (filter == 'target') {
      this.optionFilter.target = newObj;
    }
    let i = 1;
    if (graphFlag == 1) {
      this.changeGraph1(this.optionFilter.pairs, this.optionFilter.metric, this.optionFilter.market, this.optionFilter.target);
    }
    if (graphFlag == 2) {
      this.changeGraph2(this.optionFilter.entities, this.optionFilter.metric, this.optionFilter.market, this.optionFilter.target);
    }
    if (graphFlag == 0) {
      this.timer=0;
      this.changeBothGraphs(this.optionFilter.pairs, this.optionFilter.entities, this.optionFilter.metric, this.optionFilter.market, this.optionFilter.target);
    }
  }

  changeGraph1(pair: string, metric: string, market: string, target: string) {
    let pair_index = 1;
    while (this.graphDataAllLines[pair_index].split(',')[3] != pair ||
      this.graphDataAllLines[pair_index].split(',')[5] != metric ||
      this.graphDataAllLines[pair_index].split(',')[6] != market ||
      this.graphDataAllLines[pair_index].split(',')[7] != target
    ) {
      pair_index++;
    }
    this.lineChartData[1].label = pair;
    for (let j = 0; j < this.episodes.length; j++) {
      this.lineChartData[1].data[j] = this.graphDataAllLines[pair_index + j].split(',')[8];
    }
    this.lineChartData = this.lineChartData.slice();
  }

  changeGraph2(entities: any, metric: any, market: any, target: any) {
    let entity_to_compare_index = 1;
    while (this.graphDataAllLines[entity_to_compare_index].split(',')[3] != entities ||
      this.graphDataAllLines[entity_to_compare_index].split(',')[5] != metric ||
      this.graphDataAllLines[entity_to_compare_index].split(',')[6] != market ||
      this.graphDataAllLines[entity_to_compare_index].split(',')[7] != target
    ) {
      entity_to_compare_index++;
    }
    this.lineChartData2[1].label = entities;
    for (let j = 0; j < this.episodes.length; j++) {
      this.lineChartData2[1].data[j] = this.graphDataAllLines[entity_to_compare_index + j].split(',')[8];
    }
    this.lineChartData2 = this.lineChartData2.slice();
  }

  changeSelected(entity: any, metric: any, market: any, target: any) {
    let entity_index = 1;
    while (this.graphDataAllLines[entity_index].split(',')[3] != this.selectedEntity ||
      this.graphDataAllLines[entity_index].split(',')[5] != metric ||
      this.graphDataAllLines[entity_index].split(',')[6] != market ||
      this.graphDataAllLines[entity_index].split(',')[7] != target
    ) {
      entity_index++;
    }
    this.lineChartData[0].label = this.selectedEntity;
    this.lineChartData2[0].label = this.selectedEntity;
    for (let j = 0; j < this.episodes.length; j++) {
      this.lineChartData[0].data[j] = this.graphDataAllLines[entity_index + j].split(',')[8];
      this.lineChartData2[0].data[j] = this.graphDataAllLines[entity_index + j].split(',')[8];
    }
    this.lineChartData = this.lineChartData.slice();
    this.lineChartData2 = this.lineChartData2.slice();
  }

  changeBothGraphs(pair: any, entity: any, metric: any, market: any, target: any) {
    let entity_index = 1, pair_index = 1, entity_to_compare_index = 1;
    while (this.graphDataAllLines[entity_index].split(',')[3] != this.selectedEntity ||
      this.graphDataAllLines[entity_index].split(',')[5] != metric ||
      this.graphDataAllLines[entity_index].split(',')[6] != market ||
      this.graphDataAllLines[entity_index].split(',')[7] != target
    ) {
      entity_index++;
    }
    while (this.graphDataAllLines[pair_index].split(',')[3] != pair ||
      this.graphDataAllLines[pair_index].split(',')[5] != metric ||
      this.graphDataAllLines[pair_index].split(',')[6] != market ||
      this.graphDataAllLines[pair_index].split(',')[7] != target
    ) {
      pair_index++;
    }
    while (this.graphDataAllLines[entity_to_compare_index].split(',')[3] != entity ||
      this.graphDataAllLines[entity_to_compare_index].split(',')[5] != metric ||
      this.graphDataAllLines[entity_to_compare_index].split(',')[6] != market ||
      this.graphDataAllLines[entity_to_compare_index].split(',')[7] != target
    ) {
      entity_to_compare_index++;
    }
    this.lineChartData[0].label = this.selectedEntity;
    this.lineChartData[1].label = this.optionFilter.pairs;
    this.lineChartData2[0].label = this.selectedEntity;
    this.lineChartData2[1].label = this.optionFilter.entities;
    for (let i = 0; i < this.lineChartData.length; i++) {
      for (let j = 0; j < this.episodes.length; j++) {
        if (i == 0) {
          this.lineChartData[i].data[j] = this.graphDataAllLines[entity_index + j].split(',')[8];
          this.lineChartData2[i].data[j] = this.graphDataAllLines[entity_index + j].split(',')[8];
        }
        else {
          this.lineChartData[i].data[j] = this.graphDataAllLines[pair_index + j].split(',')[8];
          this.lineChartData2[i].data[j] = this.graphDataAllLines[entity_to_compare_index + j].split(',')[8];
        }
      }
    }
    this.lineChartData = this.lineChartData.slice();
    this.lineChartData2 = this.lineChartData2.slice();
  }

  listContent() {
    var shows: string[];
    shows = [this.video.show];

    let listContentRequest: ListContentRequest = { INFO_REQUIRED: 'SEASON_ALL', SEASON: this.video.season, SHOW_NAMES: shows }
    this.contentListingService.listContent(listContentRequest).subscribe(
      data => {
        this.spinnerFlag = false;
        var season = "S" + this.pad(this.video.season, 2);
        var showInfo = data[this.video.show][season];
        var episode: string;
        var videoTemp: Video;
        for (let i = 1; i <= showInfo["EPISODE_COUNT"]; i++) {
          episode = "E" + this.pad(i, 2);
          videoTemp = { show: this.video.show, season: this.video.season, episode: i };
          this.playlistEpisodes[i - 1] = { id: showInfo[episode].EPISODE_ID, name: showInfo[episode].EPISODE_NAME, thumb: showInfo[episode].THUMB_URL, video: videoTemp };
        }
      },
      error => {
        console.log(error);
      });
  }

  /* reload demo page with new input */
  reloadPage(nextVideo: Video) {
    /* save default values for a video to load demo page */

    if (typeof (Storage) !== 'undefined') {
      sessionStorage.setItem('show', nextVideo.show);
      sessionStorage.setItem('series', nextVideo.season + '');
      sessionStorage.setItem('episode', nextVideo.episode + '');
    }
    this.router.navigate(['/reload-demo']);
  }

  ngOnDestroy() {
    this.spinnerFlag = false;
    this.closeBtn.nativeElement.click();
  }

  /*show spinner overlay*/
  showSpinner() {
    this.spinnerFlag = true;
  }

  /** get session count */
  pad(num, size) {
    var s = num + "";
    while (s.length < size)
      s = "0" + s;

    return s;
  }
}

// Interface for Character related information
interface entity {
  name: string;
  availabilityPresent: any[];
  availabilityLater: any[];
  flag: number;
}

interface barChart {
  barChartData: { data: any[], label: string }[];
}