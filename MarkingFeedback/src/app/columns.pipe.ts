import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'columns'
})
export class ColumnsPipe implements PipeTransform {

  transform(columns: any[]): string[] {
    return columns.map(c => c.matColumnDef as string);
  }

}
