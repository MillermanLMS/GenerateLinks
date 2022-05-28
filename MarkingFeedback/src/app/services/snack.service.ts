import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackService {
  constructor(private snackbar: MatSnackBar) {}

  /**
   *
   * @param content Text content for snackbar
   * @param button default value: 'Dismiss'
   * @param duration default value: 1500
   * @returns
   */
  open(
    content: string,
    button?: string,
    duration?: number
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackbar.open(content, button || 'Dismiss', {
      duration: duration || 1500,
    });
  }
}
