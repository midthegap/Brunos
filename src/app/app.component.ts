import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrunoListComponent } from "./bruno-list/bruno-list.component";

@Component({
  selector: 'app-root',
  imports: [BrunoListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Counter';
}
