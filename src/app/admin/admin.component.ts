import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { MenuService } from '../menu.service';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-admin',
  imports: [NgClass, NgIf],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  imageSrc: string | null = null;
  imageFile: File | null = null;
  toastMessage: string | null = null;
  toastError: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private menuService: MenuService,
    private orderService: OrderService
  ) { }

  private handleImageFile(file: File) {
    if (file.type.startsWith('image/')) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageSrc = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          this.handleImageFile(file);
        }
        event.preventDefault();
        break;
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.handleImageFile(file);
    }
  }

  uploadImage() {
    if (!this.imageFile) return;

    const formData = new FormData();
    formData.append('image', this.imageFile);

    this.http.post(environment.apiUrl + '/api/menu/upload', formData).subscribe({
      next: () => {
        this.toastMessage = 'Image uploaded!';
        this.toastError = false;
        setTimeout(() => this.toastMessage = null, 2000);
        // disable upload button
        this.imageFile = null;
      },
      error: (err) => {
        const status = err.status;
        this.toastMessage = `Errore upload (status ${status}): ${err.message}`;
        this.toastError = true;
        setTimeout(() => this.toastMessage = null, 5000);
      }
    });
  }

  goToHome() {
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  reset() {
    if (window.confirm('Sei sicuro di voler cancellare tutti gli ordini?')) {
      this.uploadImageFromAssets('waiting.jpg');
      this.menuService.resetMenu();
      this.orderService.reset();
    }
  }

  uploadImageFromAssets(imageName: string) {
    fetch('/assets/' + imageName)
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], imageName, { type: blob.type });

        this.imageFile = file;
        this.uploadImage();
      });
  }

  close() {
    this.uploadImageFromAssets('closed.png');
    //TODO: block new orders
  }
}