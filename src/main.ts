import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from './environments/environment';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

const socketIoConfig: SocketIoConfig = {
  url: environment.socketIOUrl,
  options: {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 5000
  }
};

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    importProvidersFrom(SocketIoModule.forRoot(socketIoConfig))
  ]
}).catch((err) => console.error(err));
