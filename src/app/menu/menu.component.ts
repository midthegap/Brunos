import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MenuService } from '../menu.service';
import { BrunoListComponent } from '../bruno-list/bruno-list.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-menu',
  imports: [BrunoListComponent, DatePipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  imageSrc: string | null = null;
  menuDate: Date | null = null;

  constructor(
    private http: HttpClient, 
    private menuService: MenuService
  ) {
    this.loadMenuImage();
    this.loadMenuDate();

    this.menuService.menuUpdated$.subscribe(() => {
      this.loadMenuImage();
      this.loadMenuDate();
    });
  }

  loadMenuImage() {
    this.http.get(environment.apiUrl + '/api/menu/image', { responseType: 'blob' })
      .subscribe(blob => {
        this.imageSrc = URL.createObjectURL(blob);
      });
  }

  loadMenuDate() {
    this.http.get<Date>(environment.apiUrl + '/api/menu/date')
      .subscribe(d => {
        this.menuDate = new Date(d);
      });
  }
}
