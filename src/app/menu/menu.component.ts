import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MenuService } from '../menu.service';
import { BrunoListComponent } from '../bruno-list/bruno-list.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-menu',
  imports: [BrunoListComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  imageSrc: string | null = null;

  constructor(private http: HttpClient, private menuService: MenuService) {
    this.loadMenuImage();

    this.menuService.menuUpdated$.subscribe(() => {
      this.loadMenuImage();
    });
  }

  loadMenuImage() {
    console.log("GET immagine")
    this.http.get(environment.apiUrl + '/api/menu/image', { responseType: 'blob' })
      .subscribe(blob => {
        this.imageSrc = URL.createObjectURL(blob);
      });
  }
}
