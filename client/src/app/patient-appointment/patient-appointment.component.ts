import { Component, OnInit } from '@angular/core';

import { HttpService } from '../../services/http.service';

@Component({

selector: 'app-patient-appointment',

templateUrl: './patient-appointment.component.html',

styleUrls: ['./patient-appointment.component.scss']

})

export class PatientAppointmentComponent implements OnInit {

appointmentList: any[] = [];


todayAppointments: any[] = [];

upcomingAppointments: any[] = [];

pastAppointments: any[] = [];


pageSize = 5;


todayPage = 1;

upcomingPage = 1;

pastPage = 1;

constructor(public httpService: HttpService) {}

ngOnInit(): void {

this.getAppointments();

}

getAppointments(): void {

const userIdString = localStorage.getItem('userId');

const userId = userIdString ? parseInt(userIdString, 10) : null;

if (userId !== null) {

this.httpService.getAppointmentByPatient(userId).subscribe((data: any) => {

this.appointmentList = Array.isArray(data) ? data : [];


this.splitAppointments();

});

}

}


private parseAppointmentDate(time: string): Date {

if (!time) return new Date(0);

const clean = time.substring(0, 19).replace(' ', 'T'); 

const dt = new Date(clean);


return isNaN(dt.getTime()) ? new Date(0) : dt;

}


private sortAppointmentsByTime(list: any[], order: 'asc' | 'desc' = 'asc'): any[] {

return list.sort((a, b) => {

const t1 = this.parseAppointmentDate(a?.appointmentTime).getTime();

const t2 = this.parseAppointmentDate(b?.appointmentTime).getTime();

return order === 'asc' ? t1 - t2 : t2 - t1;

});

}


private splitAppointments(): void {

const now = new Date();


const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);


const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

const past: any[] = [];

const today: any[] = [];

const upcoming: any[] = [];

for (const appt of this.appointmentList) {

const apptDate = this.parseAppointmentDate(appt?.appointmentTime);


if (apptDate < startOfToday) {

past.push(appt);

continue;

}


if (apptDate >= startOfToday && apptDate < startOfTomorrow) {

today.push(appt);

continue;

}


if (apptDate >= startOfTomorrow) {

upcoming.push(appt);

continue;

}

}


this.todayAppointments = this.sortAppointmentsByTime(today, 'asc');

this.upcomingAppointments = this.sortAppointmentsByTime(upcoming, 'asc');

this.pastAppointments = this.sortAppointmentsByTime(past, 'desc'); 


this.todayPage = 1;

this.upcomingPage = 1;

this.pastPage = 1;

}



get paginatedTodayAppointments(): any[] {

return this.paginate(this.todayAppointments, this.todayPage);

}

get paginatedUpcomingAppointments(): any[] {

return this.paginate(this.upcomingAppointments, this.upcomingPage);

}

get paginatedPastAppointments(): any[] {

return this.paginate(this.pastAppointments, this.pastPage);

}



get todayTotalPages(): number {

return this.totalPages(this.todayAppointments);

}

get upcomingTotalPages(): number {

return this.totalPages(this.upcomingAppointments);

}

get pastTotalPages(): number {

return this.totalPages(this.pastAppointments);

}

private paginate(list: any[], page: number): any[] {

const start = (page - 1) * this.pageSize;

return list.slice(start, start + this.pageSize);

}

private totalPages(list: any[]): number {

return Math.ceil(list.length / this.pageSize) || 1;

}


changePage(section: 'today' | 'upcoming' | 'past', newPage: number): void {

if (section === 'today') {

this.todayPage = Math.min(Math.max(newPage, 1), this.todayTotalPages);

} else if (section === 'upcoming') {

this.upcomingPage = Math.min(Math.max(newPage, 1), this.upcomingTotalPages);

} else {

this.pastPage = Math.min(Math.max(newPage, 1), this.pastTotalPages);

}

}


formatAppointmentTime(time: string): string {

if (!time) return '';

const clean = time.substring(0, 19).replace('T', ' ');

const [datePart, timePart] = clean.split(' ');

if (!datePart || !timePart) return '';

const [year, month, day] = datePart.split('-');

const [hourStr, minute] = timePart.split(':');

let hour = parseInt(hourStr, 10);

const ampm = hour >= 12 ? 'PM' : 'AM';

hour = hour % 12 || 12;

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

return `${day}-${months[+month - 1]}-${year} ${hour}:${minute} ${ampm}`;

}

}