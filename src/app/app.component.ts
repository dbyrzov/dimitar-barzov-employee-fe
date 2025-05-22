import { Component } from '@angular/core';
import { EmployeesComponent } from './components/employees/employees.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EmployeesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-employee';
}
