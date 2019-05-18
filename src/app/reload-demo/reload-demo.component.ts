import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reload-demo',
  templateUrl: './reload-demo.component.html',
  styleUrls: ['./reload-demo.component.css']
})
export class ReloadDemoComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.router.navigate(['/demo']);
  }

}
