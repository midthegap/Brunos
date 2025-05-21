import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrunoListComponent } from "./bruno-list/bruno-list.component";
import { MenuComponent } from "./menu/menu.component";

@Component({
  selector: 'app-root',
  imports: [BrunoListComponent, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Brunos';
}
