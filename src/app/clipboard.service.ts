// clipboard.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  async copyToClipboard(text: string): Promise<boolean> {
    try {
      // Metodo 1: Clipboard API moderna (preferita)
      if (this.isClipboardApiSupported()) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Metodo 2: Fallback con execCommand
      return this.fallbackCopyTextToClipboard(text);
    } catch (error) {
      console.error('Errore durante la copia:', error);
      
      return this.fallbackCopyTextToClipboard(text);
    }
  }

  private isClipboardApiSupported(): boolean {
    return !!(navigator.clipboard && navigator.clipboard.writeText);
  }

  private fallbackCopyTextToClipboard(text: string): boolean {
    try {
      // Crea un elemento textarea temporaneo
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Imposta stili per renderlo invisibile
      textArea.style.position = 'fixed';
      textArea.style.top = '-9999px';
      textArea.style.left = '-9999px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.setAttribute('readonly', '');
      
      document.body.appendChild(textArea);
      
      // Seleziona e copia il testo
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);
      
      // deprecated, a dirty little trick
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    }
  }
}