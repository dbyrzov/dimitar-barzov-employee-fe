import { Component } from '@angular/core';
import { EmployeeProject, WorkTogether } from '../../models/employee.models';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
})
export class EmployeesComponent {
  results: WorkTogether[] = [];

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.trim().split('\n');
      const header = lines.shift(); // Remove header

      const projects: EmployeeProject[] = [];

      for (let line of lines) {
        const [empIdStr, projectIdStr, fromStr, toStr] = line
          .split(',')
          .map((x) => x.trim());
        const empId = +empIdStr;
        const projectId = +projectIdStr;
        const dateFrom = this.parseDate(fromStr);
        const dateTo = this.parseDate(toStr, true);

        if (!isNaN(empId) && !isNaN(projectId) && dateFrom && dateTo) {
          projects.push({ empId, projectId, dateFrom, dateTo });
        }
      }

      this.results = this.computeCollaborations(projects);
    };

    reader.readAsText(file);
  }

  parseDate(dateStr: string, isEnd = false): Date {
    if (!dateStr || dateStr.toLowerCase() === 'null') {
      return new Date();
    }

    const formats = [
      /(\d{4})-(\d{2})-(\d{2})/, // yyyy-MM-dd
      /(\d{2})\/(\d{2})\/(\d{4})/, // MM/dd/yyyy or dd/MM/yyyy
      /(\d{2})-(\d{2})-(\d{4})/, // dd-MM-yyyy
      /(\d{4})\/(\d{2})\/(\d{2})/, // yyyy/MM/dd
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let year, month, day;

        if (format === formats[0] || format === formats[3]) {
          // yyyy-MM-dd or yyyy/MM/dd
          year = +match[1];
          month = +match[2];
          day = +match[3];
        } else if (format === formats[1]) {
          // try MM/dd/yyyy
          const m = +match[1],
            d = +match[2],
            y = +match[3];
          if (m <= 12 && d <= 31) {
            month = m;
            day = d;
            year = y;
          }
        } else if (format === formats[2]) {
          // dd-MM-yyyy
          day = +match[1];
          month = +match[2];
          year = +match[3];
        }

        if (year && month && day) {
          return new Date(year, month - 1, day);
        }
      }
    }

    // fallback to native parsing
    return new Date(dateStr);
  }

  computeCollaborations(projects: EmployeeProject[]): WorkTogether[] {
    const result: WorkTogether[] = [];
    const grouped = new Map<number, EmployeeProject[]>();

    for (const proj of projects) {
      if (!grouped.has(proj.projectId)) {
        grouped.set(proj.projectId, []);
      }
      grouped.get(proj.projectId)?.push(proj);
    }

    for (const [projectId, records] of grouped.entries()) {
      for (let i = 0; i < records.length; i++) {
        for (let j = i + 1; j < records.length; j++) {
          const empA = records[i];
          const empB = records[j];

          const overlapStart = new Date(
            Math.max(empA.dateFrom.getTime(), empB.dateFrom.getTime())
          );
          const overlapEnd = new Date(
            Math.min(empA.dateTo.getTime(), empB.dateTo.getTime())
          );

          if (overlapEnd >= overlapStart) {
            const daysWorked = Math.ceil(
              (overlapEnd.getTime() - overlapStart.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            result.push({
              empId1: empA.empId,
              empId2: empB.empId,
              projectId,
              daysWorked,
            });
          }
        }
      }
    }

    return result;
  }
}
