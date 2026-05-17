import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface User {
  id: number;
  name: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl + '/api/user');
  }

  create(name: string): Observable<User> {
    return this.http.post<User>(this.baseUrl + '/api/user', { name });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/api/user/' + id);
  }

  setActive(id: number, active: boolean): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/api/user/${id}/active`, active);
  }
}
