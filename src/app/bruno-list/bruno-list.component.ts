import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order, OrderService } from '../order.service';
import { User, UserService } from '../user.service';
import { Subscription } from 'rxjs';
import { ChatComponent } from '../chat/chat.component';
import { ClipboardService } from '../clipboard.service';

@Component({
  selector: 'app-bruno-list',
  imports: [NgFor, FormsModule, NgIf, ChatComponent],
  templateUrl: './bruno-list.component.html',
  styleUrl: './bruno-list.component.css'
})
export class BrunoListComponent {
  selectedUserId: number | null = null;
  article: string = '';
  orders: Order[] = [];
  users: User[] = [];
  toastVisible = false;
  errorVisible = false;

  private ordersSub?: Subscription;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private clipboard: ClipboardService) { }

  ngOnInit() {
    this.loadUsers();

    this.ordersSub = this.orderService.orders$.subscribe(orders => {
      this.orders = orders;
    });

    const saved = this.getCookie('bruno-user-id');
    if (saved) {
      this.selectedUserId = Number(saved);
    }
  }

  ngOnDestroy() {
    this.ordersSub?.unsubscribe();
  }

  private loadUsers() {
    this.userService.getAll().subscribe(users => {
      this.users = users.filter(u => u.active);
      if (this.selectedUserId !== null && !this.users.some(u => u.id === this.selectedUserId)) {
        this.selectedUserId = null;
      }
    });
  }

  get selectedUserName(): string {
    const u = this.users.find(u => u.id === this.selectedUserId);
    return u ? u.name : '';
  }

  onUserIdChange(id: number | null) {
    if (id !== null) {
      this.setCookie('bruno-user-id', String(id), 180);
    }
  }

  addOrder() {
    this.add(this.selectedUserId, this.article);
  }

  private add(userId: number | null, article: string) {
    article = article.trim();

    if (userId === null) {
      alert('Seleziona il tuo nome dalla lista!');
      return;
    }

    const user = this.users.find(u => u.id === userId);
    if (!user) {
      alert('Utente non trovato. Ricarica la pagina.');
      return;
    }

    if (article.length == 0) {
      return;
    }

    if (this.orders.some(o => o.user.id === userId)) {
      alert("C'e' gia' un ordine per " + user.name + ".\nCancella prima quello vecchio.");
      return;
    }

    this.orderService.create(userId, article);

    this.article = '';
  }

  metoo(selected: Order) {
    this.add(this.selectedUserId, selected.article);
  }

  report() {
    this.orderService.report();
  }

  get reportText(): string {
    return this.orderService.lastReport;
  }

  copyReport() {
    if (this.reportText) {
      this.clipboard.copyToClipboard(this.reportText).then((success) => {
        if (success) {
          this.toastVisible = true;
          setTimeout(() => this.toastVisible = false, 3000);
        } else {
          this.errorVisible = true;
          setTimeout(() => this.errorVisible = false, 3000);
        }
      });
    }
  }

  delete(selected: Order) {
    if (window.confirm('Sei sicuro di voler cancellare?')) {
      this.orderService.delete(selected);
    }
  }

  setCookie(name: string, value: string, days: number) {
    const oneDayInMillis = 864e5;
    const expires = new Date(Date.now() + days * oneDayInMillis).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  }

  getCookie(name: string): string | null {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, null as string | null);
  }
}
