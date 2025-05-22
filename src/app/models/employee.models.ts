export interface EmployeeProject {
  empId: number;
  projectId: number;
  dateFrom: Date;
  dateTo: Date;
}

export interface WorkTogether {
  empId1: number;
  empId2: number;
  projectId: number;
  daysWorked: number;
}
