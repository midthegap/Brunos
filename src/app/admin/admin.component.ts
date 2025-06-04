import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient, private router: Router) {}

  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          this.imageFile = file; // salva il file per l'upload
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imageSrc = e.target.result;
          };
          reader.readAsDataURL(file);
        }
        event.preventDefault();
        break;
      }
    }
  }

  uploadImage() {
    if (!this.imageFile) return;

    const formData = new FormData();
    formData.append('image', this.imageFile);

    this.http.post(environment.apiUrl + '/api/menu/upload', formData).subscribe({
      next: () => {
        this.toastMessage = 'Upload riuscito!';
        this.toastError = false;
        setTimeout(() => this.toastMessage = null, 2000);
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
    this.router.navigate(['/']);
  }
}
